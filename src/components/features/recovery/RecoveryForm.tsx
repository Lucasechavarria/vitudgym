'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Battery, Brain, MessageSquare, Save, CheckCircle2, ChevronRight, Star, Activity } from 'lucide-react';

interface RecoveryData {
    horas_sueno: number;
    calidad_sueno: number;
    nivel_estres: number;
    nivel_fatiga: number;
    notas: string;
}

export function RecoveryForm() {
    const [data, setData] = useState<RecoveryData>({
        horas_sueno: 7,
        calidad_sueno: 7,
        nivel_estres: 3,
        nivel_fatiga: 3,
        notas: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/student/recovery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => setIsSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error submitting recovery data:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const sliders = [
        {
            key: 'calidad_sueno',
            label: 'Calidad de Sueño',
            Icon: Moon,
            iconColor: "text-indigo-400",
            color: 'from-indigo-600 to-purple-500',
            desc: '1: Muy mala - 10: Excelente'
        },
        {
            key: 'nivel_estres',
            label: 'Nivel de Estrés',
            Icon: Brain,
            iconColor: "text-orange-400",
            color: 'from-orange-600 to-amber-500',
            desc: '1: Muy bajo - 10: Muy alto'
        },
        {
            key: 'nivel_fatiga',
            label: 'Nivel de Fatiga',
            Icon: Battery,
            iconColor: "text-emerald-400",
            color: 'from-emerald-600 to-teal-500',
            desc: '1: Sin fatiga - 10: Agotado'
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl relative overflow-hidden group shadow-2xl"
        >
            {/* Decorative background elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-all duration-700" />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Activity className="text-indigo-400 w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Recuperación <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">&</span> Bienestar
                        </h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            Sincronización diaria con tu Coach
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Sleep Hours */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                <Star size={14} className="text-yellow-500" />
                                Horas de Sueño
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={data.horas_sueno}
                                    onChange={(e) => setData({ ...data, horas_sueno: parseFloat(e.target.value) })}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-8 text-2xl font-black text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
                                    placeholder="0.0"
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-600 font-black uppercase text-xs tracking-widest">Horas</span>
                            </div>
                            <p className="text-[10px] text-zinc-600 font-medium ml-1">Recomendado: 7-9 horas para atletas elite</p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">
                                <MessageSquare size={14} className="text-indigo-500" />
                                Notas de Bienestar
                            </label>
                            <textarea
                                value={data.notas}
                                onChange={(e) => setData({ ...data, notas: e.target.value })}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[92px] resize-none"
                                placeholder="¿Cómo te sientes hoy? ¿Alguna molestia física o fatiga mental?"
                            />
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {sliders.map((s) => (
                            <div key={s.key} className="space-y-4 bg-black/20 p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                            <s.Icon className={`${s.iconColor} w-4 h-4`} />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{s.label}</span>
                                    </div>
                                    <span className="text-xl font-black text-white italic">{(data as any)[s.key]}</span>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={(data as any)[s.key]}
                                    onChange={(e) => setData({ ...data, [s.key]: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                                <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-tight">{s.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="hidden sm:block">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tu información es analizada por la IA</p>
                            <p className="text-[9px] text-zinc-600 font-medium">Privacidad garantizada via RLS Security</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="relative group overflow-hidden bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <div className="flex items-center gap-3">
                                <AnimatePresence mode="wait">
                                    {isSuccess ? (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <CheckCircle2 size={16} className="text-emerald-600" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="idle"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <Save size={16} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {isSubmitting ? 'Sincronizando...' : isSuccess ? 'Sincronizado' : 'Guardar Registro'}
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
