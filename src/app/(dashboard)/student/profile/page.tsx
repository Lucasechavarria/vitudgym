'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '@/services/auth.service';

interface ProfileData {
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    emergency_contact_name: string;
    emergency_contact_phone: string;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');

    const [profileData, setProfileData] = useState<ProfileData>({
        full_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'prefer_not_to_say',
        emergency_contact_name: '',
        emergency_contact_phone: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const user = await authService.getCurrentUser();
            const profile = await authService.getUserProfile();

            setProfileData({
                full_name: profile.full_name || '',
                email: user?.email || '',
                phone: profile.phone || '',
                date_of_birth: profile.date_of_birth || '',
                gender: profile.gender || 'prefer_not_to_say',
                emergency_contact_name: profile.emergency_contact_name || '',
                emergency_contact_phone: profile.emergency_contact_phone || ''
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await authService.updateProfile(profileData);
            toast.success('Perfil actualizado correctamente');
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al actualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setSaving(true);
        try {
            await authService.updatePassword(passwordData.newPassword);
            toast.success('Contraseña actualizada correctamente');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Error al cambiar contraseña');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">👤 Mi Perfil</h1>
                    <p className="text-gray-400">Gestiona tu información personal y configuración</p>
                </div>

                {/* Tabs */}
                <div className="bg-gray-800 rounded-lg mb-6 p-1 flex gap-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'profile'
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        📋 Información Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'password'
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        🔒 Contraseña
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${activeTab === 'settings'
                                ? 'bg-orange-500 text-white'
                                : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        ⚙️ Configuración
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Información Personal</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-600 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        value={profileData.date_of_birth}
                                        onChange={(e) => setProfileData({ ...profileData, date_of_birth: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Género
                                    </label>
                                    <select
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as any })}
                                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro</option>
                                        <option value="prefer_not_to_say">Prefiero no decir</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Contacto de Emergencia</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.emergency_contact_name}
                                            onChange={(e) => setProfileData({ ...profileData, emergency_contact_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            value={profileData.emergency_contact_phone}
                                            onChange={(e) => setProfileData({ ...profileData, emergency_contact_phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Cambiar Contraseña</h2>

                        <div className="space-y-6 max-w-md">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Mínimo 8 caracteres"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Repite tu contraseña"
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {passwordData.newPassword && (
                                <div className="space-y-2">
                                    <div className="flex gap-1">
                                        <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 10 ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                        <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {passwordData.newPassword.length < 8 && '⚠️ Mínimo 8 caracteres'}
                                        {passwordData.newPassword.length >= 8 && passwordData.newPassword.length < 10 && '✓ Contraseña aceptable'}
                                        {passwordData.newPassword.length >= 10 && /[A-Z]/.test(passwordData.newPassword) && /[0-9]/.test(passwordData.newPassword) && '✓ Contraseña fuerte'}
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleChangePassword}
                                disabled={saving || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                                className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-bold text-white mb-6">Configuración</h2>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div>
                                    <h3 className="text-white font-semibold">Notificaciones por Email</h3>
                                    <p className="text-sm text-gray-400">Recibir actualizaciones sobre rutinas y pagos</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                                <div>
                                    <h3 className="text-white font-semibold">Recordatorios de Entrenamiento</h3>
                                    <p className="text-sm text-gray-400">Notificaciones sobre tus rutinas programadas</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                </label>
                            </div>

                            <div className="border-t border-gray-700 pt-6">
                                <button
                                    onClick={() => {
                                        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                                            authService.signOut();
                                            router.push('/login');
                                        }
                                    }}
                                    className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
