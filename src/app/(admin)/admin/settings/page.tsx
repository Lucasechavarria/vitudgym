'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { RoleManagement } from '@/components/features/admin/RoleManagement';

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<'gym' | 'integrations' | 'users' | 'branding' | 'equipment'>('gym');

    const [gymSettings, setGymSettings] = useState({
        name: 'VIRTUD Gym',
        address: 'Av. Principal 123, Buenos Aires',
        phone: '+54 11 1234-5678',
        email: 'info@virtudgym.com',
        openingHours: '06:00 - 23:00',
        timezone: 'America/Argentina/Buenos_Aires',
    });

    const [integrations, setIntegrations] = useState({
        mercadopago: { enabled: false, publicKey: '', accessToken: '' },
        email: { enabled: true, provider: 'sendgrid', apiKey: '' },
        sms: { enabled: false, provider: 'twilio', accountSid: '', authToken: '' },
    });

    const [branding, setBranding] = useState({
        primaryColor: '#f97316',
        secondaryColor: '#3b82f6',
        logo: '/logos/Logo-Fondo-Negro.png',
    });

    const saveSettings = () => {

        toast.success('Configuración guardada exitosamente');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-2">
                    ⚙️ Configuración
                </h1>
                <p className="text-gray-400">Personaliza tu gimnasio y configuraciones del sistema</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-fit sticky top-24">
                    <nav className="space-y-2">
                        {[
                            { id: 'gym', label: 'Gimnasio', icon: '🏢' },
                            { id: 'equipment', label: 'Equipamiento', icon: '🏋️' },
                            { id: 'integrations', label: 'Integraciones', icon: '🔌' },
                            { id: 'users', label: 'Permisos', icon: '👥' },
                            { id: 'branding', label: 'Personalización', icon: '🎨' },
                        ].map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${activeSection === section.id
                                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{section.icon}</span>
                                <span>{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    {/* Gym Settings */}
                    {activeSection === 'gym' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">🏢 Información del Gimnasio</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Nombre</label>
                                    <input
                                        type="text"
                                        value={gymSettings.name}
                                        onChange={(e) => setGymSettings({ ...gymSettings, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Teléfono</label>
                                    <input
                                        type="tel"
                                        value={gymSettings.phone}
                                        onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Email</label>
                                    <input
                                        type="email"
                                        value={gymSettings.email}
                                        onChange={(e) => setGymSettings({ ...gymSettings, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Horario</label>
                                    <input
                                        type="text"
                                        value={gymSettings.openingHours}
                                        onChange={(e) => setGymSettings({ ...gymSettings, openingHours: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Dirección</label>
                                    <input
                                        type="text"
                                        value={gymSettings.address}
                                        onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={saveSettings}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    )}

                    {/* Integrations */}
                    {activeSection === 'integrations' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">🔌 Integraciones</h2>

                            {/* MercadoPago */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">💳</span>
                                        <div>
                                            <h3 className="font-bold text-white">MercadoPago</h3>
                                            <p className="text-xs text-gray-400">Procesar pagos en línea</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={integrations.mercadopago.enabled}
                                            onChange={(e) => setIntegrations({
                                                ...integrations,
                                                mercadopago: { ...integrations.mercadopago, enabled: e.target.checked }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                    </label>
                                </div>

                                {integrations.mercadopago.enabled && (
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Public Key"
                                            value={integrations.mercadopago.publicKey}
                                            onChange={(e) => setIntegrations({
                                                ...integrations,
                                                mercadopago: { ...integrations.mercadopago, publicKey: e.target.value }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                        />
                                        <input
                                            type="password"
                                            placeholder="Access Token"
                                            value={integrations.mercadopago.accessToken}
                                            onChange={(e) => setIntegrations({
                                                ...integrations,
                                                mercadopago: { ...integrations.mercadopago, accessToken: e.target.value }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">📧</span>
                                        <div>
                                            <h3 className="font-bold text-white">Email (SendGrid)</h3>
                                            <p className="text-xs text-gray-400">Enviar notificaciones por correo</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={integrations.email.enabled}
                                            onChange={(e) => setIntegrations({
                                                ...integrations,
                                                email: { ...integrations.email, enabled: e.target.checked }
                                            })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                                    </label>
                                </div>

                                {integrations.email.enabled && (
                                    <input
                                        type="password"
                                        placeholder="API Key"
                                        value={integrations.email.apiKey}
                                        onChange={(e) => setIntegrations({
                                            ...integrations,
                                            email: { ...integrations.email, apiKey: e.target.value }
                                        })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-sm"
                                    />
                                )}
                            </div>

                            <button
                                onClick={saveSettings}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Guardar Integraciones
                            </button>
                        </div>
                    )}

                    {/* Permissions */}
                    {activeSection === 'users' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">👥 Permisos y Roles</h2>

                            <div className="space-y-4">
                                {[
                                    { role: 'SuperAdmin', permissions: ['Ver todo', 'Editar todo', 'Eliminar', 'Cambiar roles'], color: 'purple' },
                                    { role: 'Admin', permissions: ['Ver usuarios', 'Editar clases', 'Ver finanzas'], color: 'blue' },
                                    { role: 'Coach', permissions: ['Ver alumnos', 'Crear rutinas', 'Pasar lista'], color: 'orange' },
                                    { role: 'Usuario', permissions: ['Ver su progreso', 'Reservar clases'], color: 'green' },
                                ].map((roleInfo) => (
                                    <div key={roleInfo.role} className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className={`font-bold text-${roleInfo.color}-400 text-lg`}>{roleInfo.role}</h3>
                                            <button className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                                                Editar
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {roleInfo.permissions.map((perm, i) => (
                                                <span key={i} className="px-2 py-1 bg-white/5 text-gray-300 rounded text-xs">
                                                    ✓ {perm}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Equipment Management */}
                    {activeSection === 'equipment' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">🏋️ Stock de Equipamiento</h2>
                                <a
                                    href="/admin/equipment"
                                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
                                >
                                    + Gestionar Inventario
                                </a>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: 'Prensa de Piernas', quantity: 2, status: 'Disponible', icon: '📐' },
                                    { name: 'Mancuernas Hex', quantity: 20, status: 'Excelente', icon: '💪' },
                                    { name: 'Cinta de Correr T80', quantity: 5, status: 'En Mantenimiento', icon: '🏃' },
                                    { name: 'Rack de Sentadillas', quantity: 3, status: 'Disponible', icon: '🏋️' },
                                ].map((item, idx) => (
                                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{item.icon}</span>
                                            <div>
                                                <h4 className="text-white font-bold">{item.name}</h4>
                                                <p className="text-xs text-gray-400">Cantidad: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${item.status === 'En Mantenimiento' ? 'bg-orange-500/20 text-orange-400' : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Branding */}
                    {activeSection === 'branding' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-4">🎨 Personalización</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Color Primario</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="w-20 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={branding.primaryColor}
                                            onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Color Secundario</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={branding.secondaryColor}
                                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                            className="w-20 h-12 rounded-lg cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={branding.secondaryColor}
                                            onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-2 font-bold text-sm">Logo</label>
                                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                        <p className="text-sm text-gray-400 mb-2">Logo actual: {branding.logo}</p>
                                        <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all">
                                            Subir Nuevo Logo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveSettings}
                                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-xl transition-all"
                            >
                                Guardar Personalización
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
