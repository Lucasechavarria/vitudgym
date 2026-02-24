'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [saving, setSaving] = useState(false);

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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/plans/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPlan)
            });
            if (res.ok) {
                toast.success('Plan actualizado con éxito');
                setEditingPlan(null);
                fetchPlans();
            } else {
                toast.error('Error al actualizar plan');
            }
        } catch (error) {
            toast.error('Error de red');
        } finally {
            setSaving(false);
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
                                    {(Array.isArray(plan.caracteristicas) ? plan.caracteristicas : []).map((feat, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                            <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                                            <span className="font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => setEditingPlan(plan)}
                                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${plan.nombre === 'Pro' ? 'bg-red-600 text-white hover:bg-red-700 shadow-xl' : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'}`}
                            >
                                Editar Beneficios
                            </button>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modal de Edición */}
            <AnimatePresence>
                {editingPlan && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPlan(null)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-[#1c1c1e] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
                            <h2 className="text-3xl font-black text-white italic mb-8 uppercase tracking-tight">Editar Tier {editingPlan.nombre}</h2>

                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Precio Mensual ($)</label>
                                        <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none" value={editingPlan.precio_mensual} onChange={e => setEditingPlan({ ...editingPlan, precio_mensual: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Límite Sedes</label>
                                        <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none" value={editingPlan.limite_sucursales} onChange={e => setEditingPlan({ ...editingPlan, limite_sucursales: parseInt(e.target.value) })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Límite de Alumnos</label>
                                    <input required type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none" value={editingPlan.limite_usuarios} onChange={e => setEditingPlan({ ...editingPlan, limite_usuarios: parseInt(e.target.value) })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Características (Separado por comas)</label>
                                    <textarea
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none resize-none"
                                        value={(editingPlan.caracteristicas || []).join(', ')}
                                        onChange={e => setEditingPlan({ ...editingPlan, caracteristicas: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setEditingPlan(null)} className="flex-1 px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Cancelar</button>
                                    <button type="submit" disabled={saving} className="flex-1 px-8 py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50 flex items-center justify-center">
                                        {saving ? 'Guardando...' : 'Aplicar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                            Cuando un gimnasio alcance su límite de alumnos, el sistema le sugerirá automáticamente subir de nivel.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

