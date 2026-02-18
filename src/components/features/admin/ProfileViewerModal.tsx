'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any | null; // Usar any para soportar campos dinámicos de la API
}

export default function ProfileViewerModal({ isOpen, onClose, user }: ProfileViewerModalProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchHistory();
        } else {
            setHistory([]);
        }
    }, [isOpen, user?.id]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`/api/admin/users/${user.id}/history`);
            const data = await res.json();
            if (res.ok) {
                setHistory(data.history || []);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!isOpen || !user) return null;

    // Helper to safely access JSON fields
    const medical = user.informacion_medica || {};
    const emergency = user.contacto_emergencia || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#1c1c1e] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl pointer-events-auto flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-xl z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                            {user.name?.charAt(0) || user.nombre_completo?.charAt(0) || 'U'}
                                        </span>
                                        {user.name || user.nombre_completo || user.email || user.correo}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1 ml-14">Ficha Técnica Digital</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">
                                {/* Section 1: Personal Data */}
                                <section>
                                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                                        👤 Datos Personales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">D.N.I</p>
                                            <p className="text-white font-medium">{user.dni || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Género</p>
                                            <p className="text-white font-medium capitalize">
                                                {user.genero === 'male' ? 'Masculino' : user.genero === 'female' ? 'Femenino' : user.genero === 'other' ? 'Otro' : user.genero === 'prefer_not_to_say' ? 'Prefiero no decir' : '--'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Fecha Nacimiento</p>
                                            <p className="text-white font-medium">
                                                {user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : 'No registrada'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                                            <p className="text-white font-medium">{user.telefono || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Email</p>
                                            <p className="text-white font-medium">{user.correo || user.email}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-gray-500 uppercase">Dirección</p>
                                            <p className="text-white font-medium">
                                                {user.direccion} {user.ciudad ? `(${user.ciudad})` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Medical Data */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                        🩺 Ficha Médica
                                    </h3>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Grupo Sanguíneo</p>
                                                <p className="text-white font-medium">{medical.blood_type || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Presión</p>
                                                <p className="text-white font-medium">{medical.blood_pressure || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Peso</p>
                                                <p className="text-white font-medium">{medical.weight ? `${medical.weight}kg` : '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Fuma</p>
                                                <p className="text-white font-medium">{medical.is_smoker ? 'Sí' : 'No'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Lesiones</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.injuries || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Alergias</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.allergies || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Enfermedades Crónicas</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.chronic_diseases || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Patologías</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.pathologies || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Antecedentes</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.background || '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Emergency Contact */}
                                <section>
                                    <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                                        🚑 Contacto de Emergencia
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Nombre</p>
                                            <p className="text-white font-medium">{emergency.full_name || '--'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Relación</p>
                                            <p className="text-white font-medium">{emergency.relationship || '--'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                                            <a href={`tel:${emergency.phone}`} className="text-blue-400 hover:underline font-medium">
                                                {emergency.phone || '--'}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Dirección</p>
                                            <p className="text-white font-medium">{emergency.address || '--'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: History log */}
                                <section>
                                    <h3 className="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
                                        📜 Historial de Cambios
                                    </h3>
                                    <div className="bg-black/20 rounded-xl border border-white/5 overflow-hidden">
                                        {loadingHistory ? (
                                            <div className="p-8 text-center text-gray-500 animate-pulse">Cargando historial...</div>
                                        ) : history.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">No hay registros de cambios recientes.</div>
                                        ) : (
                                            <div className="divide-y divide-white/5">
                                                {history.map((log: any) => (
                                                    <div key={log.id} className="p-4 hover:bg-white/5 transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-xs font-black text-purple-400 uppercase tracking-wider">
                                                                {log.field_changed === 'estado_membresia' ? 'Membresía' :
                                                                    log.field_changed === 'rol' ? 'Rol/Acceso' : log.field_changed}
                                                            </span>
                                                            <span className="text-[10px] text-gray-600 font-mono">
                                                                {new Date(log.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-300">
                                                            Cambió de <span className="text-white font-bold">{log.old_value}</span> a <span className="text-green-400 font-bold">{log.new_value}</span>
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">
                                                                👤
                                                            </div>
                                                            <p className="text-[11px] text-gray-500">
                                                                Por <span className="text-gray-300">{log.autor?.nombre_completo || log.autor?.correo || 'Sistema'}</span>
                                                                {log.reason && <span className="italic"> — {log.reason}</span>}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* Section 5: Legal */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
                                        📋 Deslinde Legal
                                    </h3>
                                    <div className={`p-4 rounded-xl border ${user.exencion_aceptada ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} flex justify-between items-center`}>
                                        <div>
                                            <p className={`font-bold ${user.exencion_aceptada ? 'text-green-400' : 'text-red-400'}`}>
                                                {user.exencion_aceptada ? '✓ Deslinde Firmado y Aceptado' : '⚠ Pendiente de Firma'}
                                            </p>
                                            {user.exencion_aceptada && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Firmado digitalmente el: {new Date(user.fecha_exencion).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-[#1c1c1e] sticky bottom-0 rounded-b-3xl">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cerrar Ficha
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
