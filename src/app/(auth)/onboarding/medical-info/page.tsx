'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const COMMON_CONDITIONS = [
    'Diabetes',
    'Hipertensión',
    'Asma',
    'Problemas cardíacos',
    'Artritis',
    'Otro',
];

const COMMON_INJURIES = [
    'Rodilla',
    'Hombro',
    'Espalda baja',
    'Muñeca',
    'Tobillo',
    'Cuello',
    'Otro',
];

export default function MedicalInfoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        medical_conditions: [] as string[],
        other_condition: '',
        injuries: [] as string[],
        other_injury: '',
        medications: '',
        restrictions: '',
    });

    useEffect(() => {
        // Verificar que completó el paso anterior
        const personalInfo = localStorage.getItem('onboarding_personal_info');
        if (!personalInfo) {
            toast.error('Debes completar el paso anterior primero');
            router.push('/onboarding/personal-info');
        }
    }, [router]);

    const toggleCondition = (condition: string) => {
        setFormData(prev => ({
            ...prev,
            medical_conditions: prev.medical_conditions.includes(condition)
                ? prev.medical_conditions.filter(c => c !== condition)
                : [...prev.medical_conditions, condition]
        }));
    };

    const toggleInjury = (injury: string) => {
        setFormData(prev => ({
            ...prev,
            injuries: prev.injuries.includes(injury)
                ? prev.injuries.filter(i => i !== injury)
                : [...prev.injuries, injury]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await authService.getCurrentUser();
            if (!user) {
                toast.error('No se encontró sesión activa');
                router.push('/login');
                return;
            }

            // Preparar datos médicos
            const medicalData = {
                medical_conditions: [
                    ...formData.medical_conditions.filter(c => c !== 'Otro'),
                    ...(formData.other_condition ? [formData.other_condition] : [])
                ],
                injuries: [
                    ...formData.injuries.filter(i => i !== 'Otro'),
                    ...(formData.other_injury ? [formData.other_injury] : [])
                ],
                medications: formData.medications,
                restrictions: formData.restrictions,
            };

            // Actualizar perfil
            await authService.updateProfile(user.id, medicalData);

            // Guardar en localStorage
            localStorage.setItem('onboarding_medical_info', JSON.stringify(medicalData));

            toast.success('Información médica guardada');
            router.push('/onboarding/goals');

        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al guardar información');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-orange-500">Paso 2 de 4</span>
                        <span className="text-sm text-gray-400">50% completado</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-1/2 transition-all duration-300"></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Información Médica 🏥
                        </h1>
                        <p className="text-gray-400">
                            Esta información nos ayuda a crear una rutina segura y personalizada
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Condiciones médicas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                ¿Tienes alguna condición médica?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {COMMON_CONDITIONS.map(condition => (
                                    <button
                                        key={condition}
                                        type="button"
                                        onClick={() => toggleCondition(condition)}
                                        className={`px-4 py-2 rounded-lg border transition-colors ${formData.medical_conditions.includes(condition)
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {condition}
                                    </button>
                                ))}
                            </div>
                            {formData.medical_conditions.includes('Otro') && (
                                <input
                                    type="text"
                                    value={formData.other_condition}
                                    onChange={(e) => setFormData({ ...formData, other_condition: e.target.value })}
                                    className="mt-3 w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Especifica la condición"
                                />
                            )}
                        </div>

                        {/* Lesiones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                ¿Tienes alguna lesión actual o previa?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {COMMON_INJURIES.map(injury => (
                                    <button
                                        key={injury}
                                        type="button"
                                        onClick={() => toggleInjury(injury)}
                                        className={`px-4 py-2 rounded-lg border transition-colors ${formData.injuries.includes(injury)
                                                ? 'bg-orange-500 border-orange-500 text-white'
                                                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {injury}
                                    </button>
                                ))}
                            </div>
                            {formData.injuries.includes('Otro') && (
                                <input
                                    type="text"
                                    value={formData.other_injury}
                                    onChange={(e) => setFormData({ ...formData, other_injury: e.target.value })}
                                    className="mt-3 w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Especifica la lesión"
                                />
                            )}
                        </div>

                        {/* Medicamentos */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ¿Tomas algún medicamento actualmente?
                            </label>
                            <textarea
                                value={formData.medications}
                                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Ej: Ibuprofeno 400mg, Losartán 50mg..."
                            />
                        </div>

                        {/* Restricciones */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ¿Tienes alguna restricción o recomendación médica?
                            </label>
                            <textarea
                                value={formData.restrictions}
                                onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Ej: Evitar impacto alto, no levantar más de 20kg..."
                            />
                        </div>

                        {/* Info adicional */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                            <p className="text-sm text-blue-300">
                                💡 <strong>Importante:</strong> Esta información es confidencial y solo será compartida con tu coach para diseñar una rutina segura.
                            </p>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.push('/onboarding/personal-info')}
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
