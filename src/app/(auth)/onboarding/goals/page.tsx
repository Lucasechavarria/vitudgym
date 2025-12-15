'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { userGoalsService } from '@/services/user-goals.service';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PRIMARY_GOALS = [
    { value: 'muscle_gain', label: '💪 Ganar Masa Muscular', icon: '🏋️' },
    { value: 'weight_loss', label: '🔥 Perder Peso', icon: '⚖️' },
    { value: 'strength', label: '💥 Aumentar Fuerza', icon: '🦾' },
    { value: 'endurance', label: '🏃 Mejorar Resistencia', icon: '⚡' },
    { value: 'flexibility', label: '🧘 Flexibilidad', icon: '🤸' },
    { value: 'general_fitness', label: '✨ Fitness General', icon: '🎯' },
];

const TRAINING_TIMES = [
    { value: 'morning', label: 'Mañana (6-12hs)' },
    { value: 'afternoon', label: 'Tarde (12-18hs)' },
    { value: 'evening', label: 'Noche (18-23hs)' },
    { value: 'flexible', label: 'Flexible' },
];

const DAYS_OF_WEEK = [
    { value: 'monday', label: 'Lun' },
    { value: 'tuesday', label: 'Mar' },
    { value: 'wednesday', label: 'Mié' },
    { value: 'thursday', label: 'Jue' },
    { value: 'friday', label: 'Vie' },
    { value: 'saturday', label: 'Sáb' },
    { value: 'sunday', label: 'Dom' },
];

export default function GoalsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        primary_goal: '',
        training_frequency_per_week: 3,
        preferred_training_time: 'flexible',
        available_days: [] as string[],
        time_per_session_minutes: 60,
        target_weight: '',
        target_date: '',
    });

    useEffect(() => {
        // Verificar que completó los pasos anteriores
        const personalInfo = localStorage.getItem('onboarding_personal_info');
        const medicalInfo = localStorage.getItem('onboarding_medical_info');

        if (!personalInfo || !medicalInfo) {
            toast.error('Debes completar los pasos anteriores primero');
            router.push('/onboarding/personal-info');
        }
    }, [router]);

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            available_days: prev.available_days.includes(day)
                ? prev.available_days.filter(d => d !== day)
                : [...prev.available_days, day]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.primary_goal) {
            toast.error('Debes seleccionar un objetivo principal');
            return;
        }

        if (formData.available_days.length === 0) {
            toast.error('Debes seleccionar al menos un día disponible');
            return;
        }

        setLoading(true);

        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                toast.error('No se encontró sesión activa');
                router.push('/login');
                return;
            }

            // Crear objetivo
            const goalData = {
                user_id: user.id,
                primary_goal: formData.primary_goal,
                training_frequency_per_week: formData.training_frequency_per_week,
                preferred_training_time: formData.preferred_training_time,
                available_days: formData.available_days,
                time_per_session_minutes: formData.time_per_session_minutes,
                target_weight: formData.target_weight ? parseFloat(formData.target_weight) : null,
                target_date: formData.target_date || null,
                is_active: true,
            };

            await userGoalsService.create(goalData);

            // Guardar en localStorage
            localStorage.setItem('onboarding_goals', JSON.stringify(goalData));

            toast.success('Objetivos guardados');
            router.push('/onboarding/complete');

        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al guardar objetivos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
            >
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-orange-500">Paso 3 de 4</span>
                        <span className="text-sm text-gray-400">75% completado</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-3/4 transition-all duration-300"></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Tus Objetivos 🎯
                        </h1>
                        <p className="text-gray-400">
                            Define tus metas para crear un plan de entrenamiento personalizado
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Objetivo principal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-4">
                                ¿Cuál es tu objetivo principal? *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {PRIMARY_GOALS.map(goal => (
                                    <button
                                        key={goal.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, primary_goal: goal.value })}
                                        className={`p-4 rounded-lg border transition-all ${formData.primary_goal === goal.value
                                                ? 'bg-orange-500 border-orange-500 text-white scale-105'
                                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        <div className="text-3xl mb-2">{goal.icon}</div>
                                        <div className="text-sm font-medium">{goal.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Frecuencia y duración */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    ¿Cuántos días por semana puedes entrenar? *
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="7"
                                    value={formData.training_frequency_per_week}
                                    onChange={(e) => setFormData({ ...formData, training_frequency_per_week: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <div className="text-center mt-2">
                                    <span className="text-3xl font-bold text-orange-500">
                                        {formData.training_frequency_per_week}
                                    </span>
                                    <span className="text-gray-400 ml-2">días</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Duración por sesión *
                                </label>
                                <select
                                    value={formData.time_per_session_minutes}
                                    onChange={(e) => setFormData({ ...formData, time_per_session_minutes: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value={30}>30 minutos</option>
                                    <option value={45}>45 minutos</option>
                                    <option value={60}>60 minutos</option>
                                    <option value={90}>90 minutos</option>
                                </select>
                            </div>
                        </div>

                        {/* Días disponibles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                ¿Qué días puedes entrenar? *
                            </label>
                            <div className="flex gap-2 justify-center">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={`w-14 h-14 rounded-full border transition-all ${formData.available_days.includes(day.value)
                                                ? 'bg-orange-500 border-orange-500 text-white scale-110'
                                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Horario preferido */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                ¿Cuándo prefieres entrenar? *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {TRAINING_TIMES.map(time => (
                                    <button
                                        key={time.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, preferred_training_time: time.value })}
                                        className={`px-4 py-3 rounded-lg border transition-colors ${formData.preferred_training_time === time.value
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {time.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Metas opcionales */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Metas Específicas (Opcional)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Peso Objetivo (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.target_weight}
                                        onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="75.0"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Fecha Objetivo
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.target_date}
                                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.push('/onboarding/medical-info')}
                                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                ← Atrás
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {loading ? 'Guardando...' : 'Continuar →'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
