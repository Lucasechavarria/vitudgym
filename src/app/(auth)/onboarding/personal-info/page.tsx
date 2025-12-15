'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function PersonalInfoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<{
        full_name: string;
        date_of_birth: string;
        gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | '';
        phone: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
    }>({
        full_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Obtener usuario actual
            const user = await authService.getCurrentUser();
            if (!user) {
                toast.error('No se encontró sesión activa');
                router.push('/login');
                return;
            }

            // Actualizar perfil (filtrar gender vacío)
            const profileData = {
                ...formData,
                ...(formData.gender && { gender: formData.gender })
            };
            await authService.updateProfile(user.id, profileData);

            // Guardar en localStorage para el siguiente paso
            localStorage.setItem('onboarding_personal_info', JSON.stringify(formData));

            toast.success('Información guardada');
            router.push('/onboarding/medical-info');

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
                        <span className="text-sm font-medium text-orange-500">Paso 1 de 4</span>
                        <span className="text-sm text-gray-400">25% completado</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-1/4 transition-all duration-300"></div>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Bienvenido a Virtud 🎯
                        </h1>
                        <p className="text-gray-400">
                            Completa tu perfil para que podamos crear la rutina perfecta para ti
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nombre completo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre Completo *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Juan Pérez"
                            />
                        </div>

                        {/* Fecha de nacimiento y género */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Fecha de Nacimiento *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date_of_birth}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Género *
                                </label>
                                <select
                                    required
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' | 'prefer_not_to_say' })}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="male">Masculino</option>
                                    <option value="female">Femenino</option>
                                    <option value="other">Otro</option>
                                    <option value="prefer_not_to_say">Prefiero no decir</option>
                                </select>
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="+54 9 11 1234-5678"
                            />
                        </div>

                        {/* Contacto de emergencia */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-lg font-semibold text-white mb-4">
                                Contacto de Emergencia
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nombre del Contacto *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.emergency_contact_name}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="María Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Teléfono del Contacto *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.emergency_contact_phone}
                                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="+54 9 11 8765-4321"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-6">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
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

                {/* Info adicional */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    Tu información está protegida y solo será compartida con tu coach asignado
                </p>
            </motion.div>
        </div>
    );
}
