'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { supabase } from '@/lib/supabase/client';

export default function RoutinePage() {
    const [selectedDay, setSelectedDay] = useState(0);
    const [routine, setRoutine] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: activeRoutine, error } = await supabase
                    .from('routines')
                    .select('*, exercises(*)')
                    .eq('user_id', user.id)
                    .eq('is_active', true)
                    .single() as { data: any; error: any };

                if (activeRoutine) {
                    // Group exercises by day if structure is flat, or use as is if JSON
                    // Assuming flat structure aligned with our previous implementation
                    // Ideally we should group by 'day_number'

                    // Simple grouping logic for visualization
                    // We need to transform the flat 'exercises' array into the 'days' structure the UI expects
                    // Or adapt the UI. Let's adapt the data to the UI for minimal friction.

                    const groupedDays = [];
                    // Find max days
                    const maxDays = Math.max(...activeRoutine.exercises.map((e: any) => e.day_number || 1), 1);

                    for (let i = 1; i <= maxDays; i++) {
                        const dayExercises = activeRoutine.exercises.filter((e: any) => e.day_number === i);
                        if (dayExercises.length > 0) {
                            groupedDays.push({
                                name: `Día ${i}`,
                                exercises: dayExercises.map((e: any) => ({
                                    name: e.name,
                                    sets: e.sets,
                                    reps: e.reps,
                                    weight: e.weight || '--',
                                    rest: e.rest_seconds,
                                    completed: false // Client side state only for now
                                }))
                            });
                        }
                    }

                    // If no grouping (legacy structure), just dump all in Day 1
                    if (groupedDays.length === 0 && activeRoutine.exercises.length > 0) {
                        groupedDays.push({
                            name: 'Día 1: Entrenamiento Completo',
                            exercises: activeRoutine.exercises.map((e: any) => ({
                                name: e.name,
                                sets: e.sets,
                                reps: e.reps,
                                weight: '--',
                                rest: e.rest_seconds,
                                completed: false
                            }))
                        });
                    }

                    setRoutine({
                        ...activeRoutine,
                        days: groupedDays
                    });
                }
            } catch (error) {
                console.error('Error fetching routine:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoutine();
    }, []);

    if (loading) return <div className="text-white p-8">Cargando rutina...</div>;
    if (!routine) return <div className="text-white p-8">No tienes una rutina activa asignada. <Link href="/dashboard" className="text-orange-500 hover:underline">Volver</Link></div>;

    const exercises = routine.days || [];
    const currentDay = exercises[selectedDay] || { exercises: [], name: 'Día Desconocido' };

    // Placeholder toggler (UI only)
    const toggleExercise = (dayIndex: number, exerciseIndex: number) => {
        const newRoutine = { ...routine };
        newRoutine.days[dayIndex].exercises[exerciseIndex].completed = !newRoutine.days[dayIndex].exercises[exerciseIndex].completed;
        setRoutine(newRoutine);
        toast.success('Estado actualizado');
    };

    const totalExercises = exercises.reduce((sum: number, day: any) => sum + day.exercises.length, 0);
    const completedExercises = exercises.reduce(
        (sum: number, day: any) => sum + day.exercises.filter((ex: any) => ex.completed).length,
        0
    );
    const progress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm mb-2 inline-block">
                    ← Volver al Dashboard
                </Link>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 mb-2">
                    💪 Mi Rutina
                </h1>
                <p className="text-gray-400">{routine.name}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Asignada por</p>
                    <p className="text-xl font-bold text-white">Coach</p>
                </div>
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Duración</p>
                    <p className="text-xl font-bold text-white">{routine.duration_weeks || 4} semanas</p>
                </div>
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Objetivo</p>
                    <p className="text-xl font-bold text-white">{routine.goal}</p>
                </div>
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-gray-400 mb-1">Progreso</p>
                    <p className="text-xl font-bold text-green-400">{progress}%</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progreso Semanal</span>
                    <span className="text-white font-bold">{completedExercises}/{totalExercises} ejercicios</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Day Selector */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-bold text-white mb-3">Selecciona el día</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {exercises.map((day, index) => {
                        const dayCompleted = day.exercises.filter(ex => ex.completed).length;
                        const dayTotal = day.exercises.length;
                        const dayProgress = Math.round((dayCompleted / dayTotal) * 100);

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDay(index)}
                                className={`p-4 rounded-lg border transition-all text-left ${selectedDay === index
                                    ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/20'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-bold text-white text-sm">{day.name}</p>
                                    <span className="text-xs text-gray-400">{dayCompleted}/{dayTotal}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-green-400 h-1.5 rounded-full transition-all"
                                        style={{ width: `${dayProgress}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Exercises */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-6">{currentDay.name}</h3>

                <div className="space-y-4">
                    {currentDay.exercises.map((exercise, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border transition-all ${exercise.completed
                                ? 'bg-green-500/10 border-green-500/30'
                                : 'bg-white/5 border-white/10'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <button
                                        onClick={() => toggleExercise(selectedDay, index)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${exercise.completed
                                            ? 'bg-green-500 border-green-500'
                                            : 'border-gray-500 hover:border-green-500'
                                            }`}
                                    >
                                        {exercise.completed && <span className="text-white font-bold">✓</span>}
                                    </button>

                                    <div className="flex-1">
                                        <p className={`font-bold ${exercise.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                                            {exercise.name}
                                        </p>
                                        <div className="flex gap-4 mt-1 text-xs text-gray-400">
                                            <span>📊 {exercise.sets} series</span>
                                            <span>🔁 {exercise.reps} reps</span>
                                            <span>⚖️ {exercise.weight}</span>
                                            <span>⏱️ {exercise.rest}s descanso</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Coach Notes */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <p className="text-orange-400 font-bold mb-2">💬 Notas del Coach:</p>
                <p className="text-gray-300 text-sm">
                    Recuerda mantener buena técnica en todos los ejercicios. Si sientes algún dolor, detente inmediatamente y consulta conmigo.
                </p>
            </div>
        </motion.div>
    );
}
