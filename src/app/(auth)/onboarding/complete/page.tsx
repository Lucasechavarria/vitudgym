'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function CompletePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<any>(null);

    useEffect(() => {
        // Cargar resumen de todos los pasos
        const personalInfo = localStorage.getItem('onboarding_personal_info');
        const medicalInfo = localStorage.getItem('onboarding_medical_info');
        const goals = localStorage.getItem('onboarding_goals');

        if (!personalInfo || !medicalInfo || !goals) {
            toast.error('Debes completar todos los pasos primero');
            router.push('/onboarding/personal-info');
            return;
        }

        setSummary({
            personal: JSON.parse(personalInfo),
            medical: JSON.parse(medicalInfo),
            goals: JSON.parse(goals),
        });
    }, [router]);

    const handleComplete = async () => {
        setLoading(true);

        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                toast.error('No se encontró sesión activa');
                router.push('/login');
                return;
            }

            // Marcar onboarding como completado
            await authService.updateProfile(user.id, {
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString(),
            });

            // Limpiar localStorage
            localStorage.removeItem('onboarding_personal_info');
            localStorage.removeItem('onboarding_medical_info');
            localStorage.removeItem('onboarding_goals');

            toast.success('¡Perfil completado! Bienvenido a Virtud 🎉');

            // Redirigir al dashboard
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);

        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al completar onboarding');
        } finally {
            setLoading(false);
        }
    };

    if (!summary) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
                <div className="text-white">Cargando...</div>
            </div>
        );
    }

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
                        <span className="text-sm font-medium text-orange-500">Paso 4 de 4</span>
                        <span className="text-sm text-gray-400">100% completado</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-full transition-all duration-300"></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            ¡Todo Listo!
                        </h1>
                        <p className="text-gray-400">
                            Revisa tu información antes de finalizar
                        </p>
                    </div>

                    {/* Resumen */}
                    <div className="space-y-6">
                        {/* Información Personal */}
                        <div className="bg-gray-700/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>👤</span> Información Personal
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Nombre:</span>
                                    <p className="text-white font-medium">{summary.personal.full_name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Género:</span>
                                    <p className="text-white font-medium capitalize">{summary.personal.gender}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Teléfono:</span>
                                    <p className="text-white font-medium">{summary.personal.phone}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Contacto de Emergencia:</span>
                                    <p className="text-white font-medium">{summary.personal.emergency_contact_name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Información Médica */}
                        <div className="bg-gray-700/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>🏥</span> Información Médica
                            </h3>
                            <div className="space-y-3 text-sm">
                                {summary.medical.medical_conditions.length > 0 && (
                                    <div>
                                        <span className="text-gray-400">Condiciones:</span>
                                        <p className="text-white">{summary.medical.medical_conditions.join(', ')}</p>
                                    </div>
                                )}
                                {summary.medical.injuries.length > 0 && (
                                    <div>
                                        <span className="text-gray-400">Lesiones:</span>
                                        <p className="text-white">{summary.medical.injuries.join(', ')}</p>
                                    </div>
                                )}
                                {summary.medical.medications && (
                                    <div>
                                        <span className="text-gray-400">Medicamentos:</span>
                                        <p className="text-white">{summary.medical.medications}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Objetivos */}
                        <div className="bg-gray-700/30 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <span>🎯</span> Objetivos de Entrenamiento
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400">Objetivo Principal:</span>
                                    <p className="text-white font-medium capitalize">{summary.goals.primary_goal.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Frecuencia:</span>
                                    <p className="text-white font-medium">{summary.goals.training_frequency_per_week} días/semana</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Duración:</span>
                                    <p className="text-white font-medium">{summary.goals.time_per_session_minutes} minutos</p>
                                </div>
                                <div>
                                    <span className="text-gray-400">Días Disponibles:</span>
                                    <p className="text-white font-medium">{summary.goals.available_days.length} días</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje final */}
                    <div className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
                        <h4 className="text-orange-400 font-semibold mb-2">
                            ¿Qué sigue?
                        </h4>
                        <ul className="text-sm text-gray-300 space-y-2">
                            <li>✅ Un coach revisará tu información</li>
                            <li>✅ Recibirás una rutina personalizada</li>
                            <li>✅ Podrás comenzar a entrenar de inmediato</li>
                            <li>✅ Tu coach estará disponible para consultas</li>
                        </ul>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-4 pt-8">
                        <button
                            type="button"
                            onClick={() => router.push('/onboarding/goals')}
                            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            ← Modificar
                        </button>
                        <button
                            type="button"
                            onClick={handleComplete}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
                        >
                            {loading ? 'Finalizando...' : '¡Comenzar! 🚀'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Podrás editar tu información en cualquier momento desde tu perfil
                </p>
            </motion.div>
        </div>
    );
}
