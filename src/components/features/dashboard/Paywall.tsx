'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CreditCard, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PaywallProps {
    status: string;
    gymName: string;
    primaryColor?: string;
}

export default function Paywall({ status, gymName, primaryColor = '#ef4444' }: PaywallProps) {
    const isExpired = status === 'expired';

    return (
        <div className="relative min-h-[60vh] flex items-center justify-center p-6 overflow-hidden bg-[#1c1c1e] rounded-[2.5rem] border border-white/5">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 rounded-full blur-[100px] -ml-48 -mb-48" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-md w-full text-center space-y-8"
            >
                <div className="inline-flex p-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-4">
                    <Lock size={40} className="animate-pulse" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                        Acceso <br />
                        <span className="text-red-500">Restringido</span>
                    </h2>
                    <p className="text-gray-400 text-sm leading-relaxed px-4">
                        {isExpired
                            ? `Tu membresía en ${gymName} ha vencido. Para seguir visualizando tus rutinas y reservar clases, por favor regulariza tu pago.`
                            : `Aun no tienes una membresía activa en ${gymName}. Contrata un plan para empezar a entrenar.`
                        }
                    </p>
                </div>

                <div className="grid gap-3">
                    <Link href="/dashboard/payments">
                        <button className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-white/5">
                            <CreditCard size={18} />
                            Pagar ahora online
                        </button>
                    </Link>

                    <button className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/5">
                        <MessageSquare size={16} />
                        Hablar con recepción
                    </button>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    <AlertCircle size={12} />
                    Estado actual: <span className="text-red-500/80">{status}</span>
                </div>
            </motion.div>
        </div>
    );
}
