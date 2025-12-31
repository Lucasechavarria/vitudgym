'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
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
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">🔌 Conexiones Externas</h2>
                                <p className="text-gray-400 text-sm">Configura las herramientas que se conectan con tu gimnasio para automatizar cobros y avisos.</p>
                            </div>

                            {/* MercadoPago */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#009ee3]/10 rounded-2xl flex items-center justify-center text-2xl">
                                            💳
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">MercadoPago</h3>
                                            <p className="text-xs text-gray-500">Para recibir pagos de cuotas automáticamente.</p>
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
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                    </label>
                                </div>

                                {integrations.mercadopago.enabled && (
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Clave Pública (Public Key)</label>
                                            <input
                                                type="text"
                                                placeholder="APP_USR-..."
                                                value={integrations.mercadopago.publicKey}
                                                onChange={(e) => setIntegrations({
                                                    ...integrations,
                                                    mercadopago: { ...integrations.mercadopago, publicKey: e.target.value }
                                                })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Token de Acceso (Access Token)</label>
                                            <input
                                                type="password"
                                                placeholder="APP_USR-..."
                                                value={integrations.mercadopago.accessToken}
                                                onChange={(e) => setIntegrations({
                                                    ...integrations,
                                                    mercadopago: { ...integrations.mercadopago, accessToken: e.target.value }
                                                })}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl">
                                            📧
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Email (SendGrid)</h3>
                                            <p className="text-xs text-gray-500">Para enviar comprobantes y avisos de vencimiento.</p>
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
                                    <div className="space-y-1 pt-4 border-t border-white/5">
                                        <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">API Key de SendGrid</label>
                                        <input
                                            type="password"
                                            placeholder="SG.xxxxx..."
                                            value={integrations.email.apiKey}
                                            onChange={(e) => setIntegrations({
                                                ...integrations,
                                                email: { ...integrations.email, apiKey: e.target.value }
                                            })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500/50"
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={saveSettings}
                                className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all border border-white/10 uppercase tracking-widest text-xs"
                            >
                                Actualizar Credenciales
                            </button>
                        </div>
                    )}

                    {/* Permissions */}
                    {activeSection === 'users' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">👥 Seguridad y Accesos</h2>
                                <p className="text-gray-400 text-sm">Define qué puede hacer cada tipo de usuario en el sistema.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { role: 'SuperAdmin', permissions: ['Control Total', 'Gestión Financiera', 'Gestión de Staff', 'Configuración del Sistema'], info: 'Acceso ilimitado a todas las funciones.', color: 'purple' },
                                    { role: 'Admin', permissions: ['Ver usuarios', 'Editar clases', 'Ver finanzas', 'Gestionar stock'], info: 'Personal administrativo centrado en la operación diaria.', color: 'blue' },
                                    { role: 'Coach', permissions: ['Ver alumnos', 'Crear rutinas', 'Pasar lista', 'Chat con alumnos'], info: 'Personal deportivo limitado a la gestión de sus alumnos.', color: 'orange' },
                                    { role: 'Miembro', permissions: ['Ver su progreso', 'Reservar clases', 'Chat con coach', 'Ver su rutina'], info: 'Clientes del gimnasio con acceso a su propia información.', color: 'green' },
                                ].map((roleInfo) => (
                                    <div key={roleInfo.role} className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-full bg-${roleInfo.color}-500 shadow-lg shadow-${roleInfo.color}-500/40`} />
                                                <div>
                                                    <h3 className={`font-black text-white text-xl tracking-tight`}>{roleInfo.role}</h3>
                                                    <p className="text-xs text-gray-500">{roleInfo.info}</p>
                                                </div>
                                            </div>
                                            <button className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white border border-white/5">
                                                Personalizar
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {roleInfo.permissions.map((perm, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-black/40 text-gray-300 rounded-lg text-[10px] font-bold border border-white/5">
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

                    {/* Branding / Home Personalization */}
                    {activeSection === 'branding' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">🎨 Personalización Visual</h2>
                                <p className="text-gray-400 text-sm">Gestiona la identidad visual de tu gimnasio y el contenido de la página de inicio.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Colores de Marca</h3>
                                    <div>
                                        <label className="block text-gray-300 mb-2 font-bold text-xs uppercase">Color Primario</label>
                                        <div className="flex gap-3">
                                            <input
                                                type="color"
                                                value={branding.primaryColor}
                                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                                className="w-14 h-14 rounded-xl cursor-pointer bg-white/5 border border-white/10"
                                            />
                                            <input
                                                type="text"
                                                value={branding.primaryColor}
                                                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">Logo Principal</h3>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-3">
                                        <div className="w-full h-12 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                                            <img src="/logos/Logo-Fondo-Negro.png" alt="Logo" className="h-8 object-contain" />
                                        </div>
                                        <button className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/5">
                                            Cambiar Logo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h3 className="text-sm font-black text-purple-400 uppercase tracking-widest">🏠 Gestión de Inicio (Carruseles)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((id) => (
                                        <div key={id} className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer hover:border-purple-500/50 transition-all">
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                                                <span className="text-2xl mb-1">🖼️</span>
                                                <span className="text-[10px] font-bold uppercase">Slide {id}</span>
                                            </div>
                                            <div className="absolute bottom-2 right-2 flex gap-1">
                                                <button className="p-2 bg-black/60 backdrop-blur-md rounded-lg text-white hover:bg-purple-600 transition-colors">
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="aspect-video rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-600 hover:text-gray-400 hover:border-white/10 cursor-pointer transition-all">
                                        <Plus size={24} />
                                        <span className="text-[10px] font-bold uppercase mt-1">Añadir Slide</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-500 italic">Aquí podrás subir las imágenes que aparecen en el carrusel de la página de inicio (vitudgym.vercel.app).</p>
                            </div>

                            <button
                                onClick={saveSettings}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-[1.01] active:scale-[0.99] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-purple-900/40 border border-white/10"
                            >
                                GUARDAR TEMA Y CONTENIDO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
