'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import WorkoutPlayer from './WorkoutPlayer';

import { StudentRoutine, ItemVariants, RoutineExercise } from '@/types/student-components';

interface RoutinePreviewProps {
    routine: StudentRoutine;
    handleRequestRoutine: (data: any) => void;
    handleGoalModal: (isOpen: boolean) => void;
    isRequesting: boolean;
    itemVariants: ItemVariants;
}

export function RoutinePreview({ routine, handleRequestRoutine, handleGoalModal, isRequesting, itemVariants }: RoutinePreviewProps) {
    const [isPlayerOpen, setIsPlayerOpen] = React.useState(false);

    const handleComplete = (data: any) => {
        // Podríamos actualizar el dashboard aquí si fuera necesario
        console.log('Entrenamiento finalizado:', data);
    };

    return (
        <>
            <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#1c1c1e] to-[#151515] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white">💪 Rutina Actual</h3>
                        <p className="text-gray-400 text-sm mt-1">{routine?.goal || 'Sin objetivo definido'}</p>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                        <span className="text-2xl">⚡</span>
                    </div>
                </div>

                {routine ? (
                    <div className="relative z-10 space-y-4">
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors group-hover:bg-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-bold text-lg">{routine.name}</span>
                                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Activa</span>
                            </div>

                            <div className="space-y-2 mt-4">
                                {routine.exercises?.slice(0, 3).map((exercise: RoutineExercise, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <span className="flex-1 truncate">{exercise.name}</span>
                                        <span className="text-gray-500">{exercise.sets}x{exercise.reps}</span>
                                    </div>
                                ))}
                                {routine.exercises?.length > 3 && (
                                    <p className="text-xs text-gray-500 pl-4">+ {routine.exercises.length - 3} ejercicios más</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsPlayerOpen(true)}
                                className="flex-[2] bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-3 rounded-xl text-center transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.02] uppercase italic text-xs tracking-widest"
                            >
                                ¡Entrenar Ahora! 🚀
                            </button>
                            <Link
                                href="/dashboard/routine"
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-center transition-all border border-white/10 text-xs"
                            >
                                Detalles
                            </Link>
                            {routine.nutrition_plan_id && (
                                <Link
                                    href="/dashboard/nutrition"
                                    className="px-4 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl text-center transition-all shadow-lg shadow-green-600/20 hover:scale-[1.02]"
                                    title="Ver Plan Nutricional"
                                >
                                    🍎
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 relative z-10">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            📝
                        </div>
                        <p className="text-gray-400 mb-6">Tu coach está diseñando tu plan a medida.</p>
                        <button
                            onClick={() => handleGoalModal(true)}
                            disabled={isRequesting}
                            className="w-full border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl transition-all text-sm font-bold disabled:opacity-50"
                        >
                            {isRequesting ? 'Generando...' : 'Solicitar Rutina'}
                        </button>
                    </div>
                )}

                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors" />

                {/* Workout Player Portal/Overlay */}
                {isPlayerOpen && routine && (
                    <WorkoutPlayer
                        routine={routine as any}
                        onClose={() => setIsPlayerOpen(false)}
                        onComplete={handleComplete}
                    />
                )}
            </motion.div>
        </>
    );
}
