'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Gem,
    CheckCircle2,
    ArrowRight,
    Zap,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Plan {
    id: string;
    nombre: string;
    precio_mensual: number;
    limite_sucursales: number;
    limite_usuarios: number;
    caracteristicas: string[];
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/admin/plans/list');
            const data = await res.json();
            if (res.ok) {
                setPlans(data.plans || []);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-12 p-4 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-red-500 italic uppercase italic tracking-tighter">
                    💎 Niveles de Membresía SaaS
                </h1>
                <p className="text-gray-400 mt-2 font-medium">
                    Configura los planes de suscripción para los gimnasios de la red.
                </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-[500px] bg-white/5 rounded-[3rem] animate-pulse border border-white/5" />
                    ))
                ) : (
                    plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`relative bg-[#1c1c1e] rounded-[3rem] border ${plan.nombre === 'Pro' ? 'border-red-500/50 shadow-2xl shadow-red-900/20' : 'border-white/10'} p-10 overflow-hidden group`}
                        >
                            {plan.nombre === 'Pro' && (
                                <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-black px-6 py-2 rounded-bl-3xl uppercase tracking-widest italic">
                                    Más Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-2xl font-black text-white italic uppercase mb-2">{plan.nombre}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white italic tracking-tighter">${plan.precio_mensual.toLocaleString('es-AR')}</span>
                                    <span className="text-gray-500 text-sm font-bold">/mes</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-10">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Capacidad</p>
                                    <p className="text-sm text-gray-200 font-bold">
                                        Hasta {plan.limite_sucursales} {plan.limite_sucursales === 1 ? 'Sede' : 'Sedes'} y {plan.limite_usuarios} Alumnos
                                    </p>
                                </div>

                                <ul className="space-y-4">
                                    {plan.caracteristicas?.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                                            <span className="font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => toast.success('Edición de planes disponible próximamente')}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${plan.nombre === 'Pro' ? 'bg-red-600 text-white hover:bg-red-700 shadow-xl' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                            >
                                Editar Beneficios
                            </button>
                        </motion.div>
                    ))
                )}
            </div>

            {/* SaaS Tip */}
            <div className="bg-gradient-to-r from-[#1c1c1e] to-transparent p-10 rounded-[3rem] border border-white/5">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-red-600/10 rounded-3xl flex items-center justify-center text-red-500 shrink-0">
                        <Zap size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white italic uppercase mb-2 tracking-tight">Estrategia Commercial</h4>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                            Los planes afectan directamente los límites técnicos de cada tenant.
                            Cuando un gimnasio alcance su límite de {plans[0]?.limite_usuarios || 50} alumnos,
                            el sistema le sugerirá automáticamente subir al plan Pro.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
