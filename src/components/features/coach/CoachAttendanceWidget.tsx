'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export function CoachAttendanceWidget() {
    const [status, setStatus] = useState<'checked-in' | 'checked-out' | 'loading'>('loading');
    const [activeSession, setActiveSession] = useState<any>(null);

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await fetch('/api/coach/attendance?limit=1');
            const data = await res.json();
            if (data.activeSession) {
                setStatus('checked-in');
                setActiveSession(data.activeSession);
            } else {
                setStatus('checked-out');
            }
        } catch (error) {
            console.error('Error checking status:', error);
        }
    };

    const handleCheckIn = async () => {
        const toastId = toast.loading('Registrando entrada...');
        try {
            const res = await fetch('/api/coach/attendance/check-in', {
                method: 'POST'
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success('¡Entrada registrada! Buena jornada.', { id: toastId });
            setStatus('checked-in');
            setActiveSession(data.attendance);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al registrar entrada';
            toast.error(message, { id: toastId });
        }
    };

    const handleCheckOut = async () => {
        const toastId = toast.loading('Registrando salida...');
        try {
            const res = await fetch('/api/coach/attendance/check-out', {
                method: 'PUT'
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            toast.success('¡Salida registrada! Descansa.', { id: toastId });
            setStatus('checked-out');
            setActiveSession(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al registrar salida';
            toast.error(message, { id: toastId });
        }
    };

    if (status === 'loading') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-2xl border ${status === 'checked-in'
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-[#1c1c1e]/60 border-white/10'
                } backdrop-blur-xl shadow-xl transition-colors duration-500`}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    ⏱️ Control de Asistencia
                </h3>
                {status === 'checked-in' && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold animate-pulse">
                        EN TURNO
                    </span>
                )}
            </div>

            {status === 'checked-in' ? (
                <div>
                    <p className="text-gray-300 text-sm mb-4">
                        Ingreso: <span className="font-mono text-white font-bold">{new Date(activeSession?.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <button
                        onClick={handleCheckOut}
                        className="w-full py-3 bg-red-500/80 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-lg"
                    >
                        Marcar Salida
                    </button>
                    <p className="text-center mt-2 text-xs text-green-400">
                        * Recuerda marcar salida al terminar.
                    </p>
                </div>
            ) : (
                <div>
                    <p className="text-gray-400 text-sm mb-4">
                        No has registrado entrada hoy.
                    </p>
                    <button
                        onClick={handleCheckIn}
                        className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                    >
                        Marcar Entrada
                    </button>
                </div>
            )}

            {status !== 'checked-in' && (
                <button
                    onClick={async () => {
                        const reason = prompt('Motivo de la ausencia:');
                        if (!reason) return;

                        const toastId = toast.loading('Registrando ausencia...');
                        try {
                            const res = await fetch('/api/coach/attendance', { // Using PATCH on base route
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reason })
                            });
                            // Note: Next.js API routes are file-based, so PATCH /api/coach/attendance works if defined in route.ts

                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error);

                            toast.success('Ausencia reportada al administrador.', { id: toastId });
                        } catch (error) {
                            const message = error instanceof Error ? error.message : 'Error al reportar ausencia';
                            toast.error(message, { id: toastId });
                        }
                    }}
                    className="w-full mt-3 py-2 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all text-xs"
                >
                    Reportar Falta Justificada
                </button>
            )}
        </motion.div>
    );
}
