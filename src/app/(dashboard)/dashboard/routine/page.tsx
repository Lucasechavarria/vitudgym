'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecureRoutineViewer } from '@/components/SecureRoutineViewer';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Exercise {
    id: string;
    name: string;
    description: string;
    sets: number;
    reps: string;
    rest_seconds: number;
    muscle_group?: string;
    equipment?: string[];
    instructions?: string;
    day_number: number;
    order_in_day: number;
    completed?: boolean;
}

interface Routine {
    id: string;
    name: string;
    description: string;
    goal: string;
    duration_weeks: number;
    medical_considerations?: string;
    coach: {
        full_name: string;
    };
}

export default function MyRoutinePage() {
    const router = useRouter();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedDay, setSelectedDay] = useState(1);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        loadRoutine();
    }, []);

    const loadRoutine = async () => {
        try {
            const response = await fetch('/api/student/my-routine');
            const data = await response.json();

            if (data.success) {
                setRoutine(data.routine);
                setExercises(data.exercises);
                setUserId(data.userId);
            } else {
                if (data.error === 'No active routine') {
                    // Handled in UI
                } else {
                    toast.error('Error al cargar rutina');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar rutina');
        } finally {
            setLoading(false);
        }
    };

    const toggleExerciseComplete = async (exerciseId: string) => {
        try {
            const response = await fetch('/api/student/toggle-exercise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ exerciseId })
            });

            if (response.ok) {
                setExercises(prev =>
                    prev.map(ex =>
                        ex.id === exerciseId
                            ? { ...ex, completed: !ex.completed }
                            : ex
                    )
                );
                // Optional: Play a sound or success haptic here
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const dayExercises = exercises.filter(ex => ex.day_number === selectedDay);
    const totalDays = Math.max(...exercises.map(ex => ex.day_number), 0);

    // Stagger settings for animations
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-t-2 border-b-2 border-orange-500 rounded-full"
                />
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center max-w-md relative z-10 p-8 rounded-3xl bg-white/5 backdrop-blur-3xl border border-white/10"
                >
                    <div className="text-6xl mb-6">🏋️</div>
                    <h2 className="text-3xl font-bold text-white mb-3">Sin Rutina Activa</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Tu coach está diseñando un plan a tu medida. ¡Pronto podrás empezar a entrenar!
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-500/20 transition-all transform hover:scale-105"
                    >
                        Volver al Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    const progress = dayExercises.length > 0 ? (dayExercises.filter(ex => ex.completed).length / dayExercises.length) * 100 : 0;

    return (
        <SecureRoutineViewer routineId={routine.id} userId={userId}>
            <div className="min-h-screen bg-black text-white relative overflow-x-hidden p-4 md:p-8 pb-24">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10">
                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-orange-500/90 to-red-600/90 rounded-3xl p-8 mb-8 shadow-2xl shadow-orange-900/20 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 5.57 2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22 14.86 20.57 16.29 22 18.43 19.86 19.86 18.43 22 16.29l-1.43-1.43z" /></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2 text-white/80 text-sm font-medium uppercase tracking-wider">
                                <span className="bg-white/20 px-2 py-1 rounded-md">Rutina Activa</span>
                                <span>{routine.duration_weeks} Semanas</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                                {routine.name}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm md:text-base font-medium text-white/90">
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 p-1.5 rounded-lg">👨‍🏫</span>
                                    <span>{routine.coach.full_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 p-1.5 rounded-lg">🎯</span>
                                    <span>{routine.goal}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Medical Alert */}
                    <AnimatePresence>
                        {routine.medical_considerations && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl p-6 mb-8 flex items-start gap-4"
                            >
                                <div className="text-2xl mt-1">⚠️</div>
                                <div>
                                    <h3 className="text-yellow-400 font-bold mb-1">Consideraciones Médicas</h3>
                                    <p className="text-yellow-200/80 leading-relaxed">{routine.medical_considerations}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Controls & Progress */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Day Selector */}
                        <div className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                            <h3 className="text-gray-400 font-medium mb-4 text-sm uppercase tracking-wider">Día de Entrenamiento</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`px-5 py-3 rounded-xl font-bold transition-all transform ${selectedDay === day
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        Día {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-center">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-gray-400 font-medium text-sm uppercase">Progreso Hoy</span>
                                <span className="text-2xl font-black text-white">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full"
                                />
                            </div>
                            <p className="text-right text-xs text-gray-500 mt-2">
                                {dayExercises.filter(ex => ex.completed).length} de {dayExercises.length} ejercicios
                            </p>
                        </div>
                    </div>

                    {/* Exercises List */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {dayExercises.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                                <p className="text-gray-500 text-lg">Descanso merecido 😴<br /><span className="text-sm">No hay ejercicios asignados para este día.</span></p>
                            </div>
                        ) : (
                            dayExercises.map((exercise, index) => (
                                <motion.div
                                    variants={item}
                                    key={exercise.id}
                                    className={`group relative rounded-2xl p-6 border transition-all duration-300 ${exercise.completed
                                        ? 'bg-green-500/10 border-green-500/30'
                                        : 'bg-white/5 border-white/10 hover:border-orange-500/50 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-start gap-6">
                                        {/* Status Button */}
                                        <button
                                            onClick={() => toggleExerciseComplete(exercise.id)}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 transform group-hover:scale-110 ${exercise.completed
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                : 'bg-white/5 text-gray-500 hover:bg-orange-500 hover:text-white border-2 border-transparent hover:shadow-lg hover:shadow-orange-500/30'
                                                }`}
                                        >
                                            {exercise.completed ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            ) : (
                                                <span className="text-lg font-bold">{index + 1}</span>
                                            )}
                                        </button>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                                <h4 className={`text-xl font-bold transition-colors ${exercise.completed ? 'text-green-400 line-through decoration-2 decoration-green-500/50' : 'text-white group-hover:text-orange-400'}`}>
                                                    {exercise.name}
                                                </h4>
                                                {exercise.muscle_group && (
                                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5 uppercase tracking-wide">
                                                        {exercise.muscle_group}
                                                    </span>
                                                )}
                                            </div>

                                            {exercise.description && (
                                                <p className="text-gray-400 mb-4 leading-relaxed text-sm md:text-base">{exercise.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                {[
                                                    { label: 'Series', value: exercise.sets, icon: '📊' },
                                                    { label: 'Reps', value: exercise.reps, icon: '🔁' },
                                                    { label: 'Descanso', value: exercise.rest_seconds ? `${exercise.rest_seconds}s` : null, icon: '⏱️' },
                                                    { label: 'Peso', value: null, icon: '⚖️' } // Future feature: Weight tracking
                                                ].filter(stat => stat.value).map((stat, i) => (
                                                    <div key={i} className="bg-black/40 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                                                        <span className="text-lg">{stat.icon}</span>
                                                        <div>
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">{stat.label}</p>
                                                            <p className="text-white font-bold">{stat.value}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {exercise.instructions && (
                                                <div className="bg-black/20 rounded-xl p-4 border-l-4 border-orange-500/50">
                                                    <p className="text-sm text-gray-300 italic">"{exercise.instructions}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
        </SecureRoutineViewer>
    );
}
