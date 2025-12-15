'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SecureRoutineViewer } from '@/components/SecureRoutineViewer';
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
                    toast.error('No tienes una rutina activa');
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
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const dayExercises = exercises.filter(ex => ex.day_number === selectedDay);
    const totalDays = Math.max(...exercises.map(ex => ex.day_number), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando rutina...</div>
            </div>
        );
    }

    if (!routine) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Sin Rutina Activa</h2>
                    <p className="text-gray-400 mb-6">
                        Tu coach está preparando una rutina personalizada para ti
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SecureRoutineViewer routineId={routine.id} userId={userId}>
            <div className="min-h-screen bg-gray-900 p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            {routine.name}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-sm text-white/90">
                            <div className="flex items-center gap-2">
                                <span>👨‍🏫</span>
                                <span>Coach: {routine.coach.full_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>🎯</span>
                                <span>{routine.goal}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{routine.duration_weeks} semanas</span>
                            </div>
                        </div>
                    </div>

                    {/* Medical Considerations */}
                    {routine.medical_considerations && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                            <h3 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                                <span>⚠️</span> Consideraciones Médicas
                            </h3>
                            <p className="text-yellow-200 text-sm">{routine.medical_considerations}</p>
                        </div>
                    )}

                    {/* Day Selector */}
                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                        <h3 className="text-white font-semibold mb-3">Selecciona el día</h3>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${selectedDay === day
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Día {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Exercises */}
                    <div className="space-y-4">
                        {dayExercises.length === 0 ? (
                            <div className="bg-gray-800 rounded-lg p-8 text-center">
                                <p className="text-gray-400">No hay ejercicios para este día</p>
                            </div>
                        ) : (
                            dayExercises.map((exercise, index) => (
                                <div
                                    key={exercise.id}
                                    className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${exercise.completed
                                            ? 'border-green-500 bg-green-500/5'
                                            : 'border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleExerciseComplete(exercise.id)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${exercise.completed
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-600 hover:border-orange-500'
                                                }`}
                                        >
                                            {exercise.completed && (
                                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Exercise Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white mb-1">
                                                        {index + 1}. {exercise.name}
                                                    </h4>
                                                    {exercise.muscle_group && (
                                                        <span className="text-sm text-gray-400">
                                                            {exercise.muscle_group}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {exercise.description && (
                                                <p className="text-gray-300 text-sm mb-3">{exercise.description}</p>
                                            )}

                                            <div className="flex flex-wrap gap-4 text-sm mb-3">
                                                {exercise.sets && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">📊</span>
                                                        <span className="text-white font-medium">{exercise.sets} series</span>
                                                    </div>
                                                )}
                                                {exercise.reps && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">🔢</span>
                                                        <span className="text-white font-medium">{exercise.reps} reps</span>
                                                    </div>
                                                )}
                                                {exercise.rest_seconds && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500">⏱️</span>
                                                        <span className="text-white font-medium">{exercise.rest_seconds}s descanso</span>
                                                    </div>
                                                )}
                                            </div>

                                            {exercise.equipment && exercise.equipment.length > 0 && (
                                                <div className="mb-3">
                                                    <span className="text-gray-400 text-sm">Equipamiento: </span>
                                                    <span className="text-orange-400 text-sm">{exercise.equipment.join(', ')}</span>
                                                </div>
                                            )}

                                            {exercise.instructions && (
                                                <div className="bg-gray-700/50 rounded-lg p-3">
                                                    <p className="text-sm text-gray-300">{exercise.instructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Progress */}
                    <div className="mt-6 bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progreso del día</span>
                            <span className="text-white font-medium">
                                {dayExercises.filter(ex => ex.completed).length} / {dayExercises.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{
                                    width: `${(dayExercises.filter(ex => ex.completed).length / dayExercises.length) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </SecureRoutineViewer>
    );
}
