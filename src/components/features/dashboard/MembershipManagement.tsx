'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    CreditCard,
    Download,
    XCircle,
    TrendingUp,
    Clock,
    ChevronRight,
    AlertCircle,
    Calendar,
    ArrowUpCircle
} from 'lucide-react';

interface Payment {
    id: string;
    fecha: string;
    monto: number;
    metodo: string;
    concepto: string;
    estado: 'aprobado' | 'pendiente' | 'rechazado';
}

const MOCK_PAYMENTS: Payment[] = [
    { id: '1', fecha: '2026-02-15', monto: 35000, metodo: 'MercadoPago', concepto: 'Abono Mensual Feb', estado: 'aprobado' },
    { id: '2', fecha: '2026-01-14', monto: 35000, metodo: 'MercadoPago', concepto: 'Abono Mensual Ene', estado: 'aprobado' },
];

export default function MembershipManagement() {
    const [isCancelling, setIsCancelling] = useState(false);

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Active Plan Card */}
            <div className="relative overflow-hidden p-1 bg-[#1c1c1e]/60 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px] -mr-32 -mt-32" />

                <div className="relative p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-600/20 text-orange-500 rounded-2xl border border-orange-500/20">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Tu Plan Actual</h3>
                                <p className="text-4xl font-black text-white italic tracking-tighter uppercase mt-1">Plan Elite Libre</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                <Calendar size={14} className="text-orange-500" />
                                Próximo cobro: <span className="text-white">15 de Marzo, 2026</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                                <CreditCard size={14} className="text-orange-500" />
                                Monto: <span className="text-white">$35.000 / mes</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="bg-white text-black px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-white/5 active:scale-95">
                            <ArrowUpCircle size={16} />
                            Upgrade de Plan
                        </button>
                        <button
                            onClick={() => setIsCancelling(true)}
                            className="bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-gray-500 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/5"
                        >
                            <XCircle size={16} />
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Payment History */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] ml-4 flex items-center gap-2">
                        <Clock size={14} /> Historial de Pagos
                    </h4>
                    <div className="space-y-3">
                        {MOCK_PAYMENTS.map((payment) => (
                            <motion.div
                                key={payment.id}
                                whileHover={{ scale: 1.01, border: '1px solid rgba(255,255,255,0.1)' }}
                                className="p-5 bg-[#1c1c1e] border border-white/5 rounded-3xl flex items-center justify-between transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{payment.concepto}</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{payment.fecha}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-black text-white italic tracking-tighter">${payment.monto.toLocaleString('es-AR')}</p>
                                        <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{payment.estado}</span>
                                    </div>
                                    <button className="p-3 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl transition-all border border-white/5">
                                        <Download size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: Auto-management Tips / Cards */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[3rem] bg-gradient-to-br from-orange-600 to-orange-500 text-black shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={100} />
                        </div>
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-4">¿Quieres ahorrar entrenando?</h4>
                        <p className="text-sm font-bold opacity-80 mb-6 leading-tight">Pasa al plan anual hoy mismo y obtén 2 meses totalmente gratis.</p>
                        <button className="bg-black text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all">
                            Ver Planes Anuales
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-[#1c1c1e] border border-white/5 space-y-4">
                        <div className="flex items-center gap-3 text-orange-500 mb-2">
                            <AlertCircle size={20} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Importante</p>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Al cancelar tu suscripción, mantendrás el acceso hasta el fin del periodo actual. Cumplimos con el Botón de Arrepentimiento según la Ley 24.240.
                        </p>
                    </div>
                </div>
            </div>

            {/* Cancelation Modal Placeholder */}
            <AnimatePresence>
                {isCancelling && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="max-w-md w-full bg-[#1c1c1e] border border-white/10 p-10 rounded-[3rem] text-center space-y-8 shadow-2xl"
                        >
                            <div className="flex justify-center">
                                <div className="p-5 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
                                    <XCircle size={40} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">¿Seguro que <br /> quieres irte?</h3>
                                <p className="text-gray-500 text-sm font-medium">Perderás tu racha de gamificación y tus rutinas guardadas.</p>
                            </div>
                            <div className="grid gap-3">
                                <button onClick={() => setIsCancelling(false)} className="bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest">No, continuar entrenando</button>
                                <button className="bg-white/5 hover:text-red-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Sí, solicitar cancelación</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
