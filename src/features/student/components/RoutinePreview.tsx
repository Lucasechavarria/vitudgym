'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sword, Zap, Target, Apple, ChevronRight, Activity } from 'lucide-react';
import WorkoutPlayer from './WorkoutPlayer';

import { StudentRoutine, ItemVariants, RoutineExercise } from '@/types/student-components';

interface RoutinePreviewProps {
    routine: StudentRoutine;
    handleGoalModal: (isOpen: boolean) => void;
    isRequesting: boolean;
    itemVariants: ItemVariants;
}

export function RoutinePreview({ routine, handleGoalModal, isRequesting, itemVariants }: RoutinePreviewProps) {
    const [isPlayerOpen, setIsPlayerOpen] = React.useState(false);

    const handleComplete = (data: any) => {
        console.log('Entrenamiento finalizado:', data);
    };

    return (
        <>
            <motion.div
                variants={itemVariants}
                className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group h-full"
            >
                {/* Tactical Backdrop */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-orange-500/20 transition-colors pointer-events-none" />

                <div className="flex justify-between items-start mb-10 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Sword size={16} className="text-orange-500" />
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Operación Activa</span>
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase whitespace-pre-line leading-none">
                            Misión:<br /><span className="text-orange-500">Entrenamiento</span>
                        </h3>
                    </div>
                </div>

                {routine ? (
                    <div className="relative z-10 space-y-8">
                        <div className="bg-black/40 border border-white/5 rounded-[2rem] p-8 transition-all hover:border-orange-500/30 shadow-inner">
                            <div className="flex justify-between items-center mb-6">
                                <div className="space-y-1">
                                    <span className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{routine.nombre}</span>
                                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{routine.objetivo || 'Sin objetivo definido'}</p>
                                </div>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest animate-pulse">Ready</span>
                            </div>

                            <div className="space-y-4">
                                {routine.ejercicios?.slice(0, 3).map((exercise: RoutineExercise, i: number) => (
                                    <div key={i} className="flex items-center gap-4 group/item">
                                        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-zinc-600 border border-white/5 group-hover/item:border-orange-500/50 group-hover/item:text-orange-500 transition-all">
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-zinc-300 truncate group-hover/item:text-white transition-colors">{exercise.nombre}</p>
                                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter">{exercise.series} Series • {exercise.repeticiones} Reps</p>
                                        </div>
                                    </div>
                                ))}
                                {routine.ejercicios?.length > 3 && (
                                    <div className="flex items-center gap-2 pl-2 mt-4 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                        <span>+ {routine.ejercicios.length - 3} Módulos adicionales</span>
                                        <div className="h-[1px] flex-1 bg-white/5" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsPlayerOpen(true)}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-orange-600/20 uppercase italic text-xs tracking-[0.2em]"
                            >
                                <Zap size={18} className="fill-white" /> INICIAR DESPLIEGUE
                            </motion.button>

                            <div className="flex gap-4">
                                <Link
                                    href="/dashboard/routine"
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/5 text-[10px] uppercase tracking-widest"
                                >
                                    BRIEFING <ChevronRight size={14} />
                                </Link>
                                {routine.plan_nutricional_id && (
                                    <Link
                                        href="/dashboard/nutrition"
                                        className="w-16 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-all border border-emerald-600/20 shadow-lg shadow-emerald-500/10"
                                        title="Soporte Nutricional"
                                    >
                                        <Apple size={18} />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 relative z-10 flex flex-col items-center">
                        <div className="w-24 h-24 bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center mb-6 shadow-inner group-hover:rotate-12 transition-transform">
                            <Activity size={32} className="text-zinc-800 animate-pulse" />
                        </div>
                        <p className="text-zinc-500 font-black uppercase tracking-widest text-xs italic mb-8 max-w-[200px]">
                            Esperando directivas del comando central...
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGoalModal(true)}
                            disabled={isRequesting}
                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 disabled:opacity-50"
                        >
                            {isRequesting ? 'Sincronizando...' : 'Solicitar Plan Táctico'}
                        </motion.button>
                    </div>
                )}
            </motion.div>

            {isPlayerOpen && routine && (
                <WorkoutPlayer
                    routine={routine as any}
                    onClose={() => setIsPlayerOpen(false)}
                    onComplete={handleComplete}
                />
            )}
        </>
    );
}
