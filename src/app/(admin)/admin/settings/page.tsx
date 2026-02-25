'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { RoleManagement } from '@/components/features/admin/RoleManagement';

interface GymInfo {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    horarios: string;
    timezone: string;
    estado_pago_saas: string;
    fecha_proximo_pago: string | null;
    planes_suscripcion?: {
        nombre: string;
    };
}

interface GymLimits {
    currentUsers: number;
    limitUsers: number | '∞';
    currentBranches: number;
    limitBranches: number | '∞';
}

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<'gym' | 'integrations' | 'users' | 'branding' | 'equipment' | 'billing'>('gym');
    const [loading, setLoading] = useState(false);

    const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
    const [limits, setLimits] = useState<GymLimits | null>(null);

    const [gymSettings, setGymSettings] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        openingHours: '',
        timezone: 'America/Argentina/Buenos_Aires',
    });

    useEffect(() => {
        fetchGymData();
    }, []);

    const fetchGymData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/gym/info');
            const data = await res.json();
            if (res.ok) {
                setGymInfo(data.gym as GymInfo);
                setLimits(data.limits as GymLimits);
                setGymSettings({
                    name: data.gym.nombre || '',
                    address: data.gym.direccion || '',
                    phone: data.gym.telefono || '',
                    email: data.gym.email || '',
                    openingHours: data.gym.horarios || '',
                    timezone: data.gym.timezone || 'America/Argentina/Buenos_Aires'
                });
            }
        } catch (error) {
            console.error('Error fetching gym data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaaSPayment = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/saas/payments/create-preference', { method: 'POST' });
            const data = await res.json();
            if (res.ok && data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error(data.error || 'Error al procesar el pago');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            toast.success('Pago procesado correctamente. Verificando estado...');
            fetchGymData();
        } else if (urlParams.get('payment') === 'failure') {
            toast.error('Hubo un error al procesar tu pago. Inténtalo de nuevo.');
        }
    }, []);

    const saveSettings = () => {
        toast.success('Configuración guardada exitosamente');
    };

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-2">
                    ⚙️ Configuración
                </h1>
                <p className="text-gray-400">Personaliza tu gimnasio y configuraciones del sistema</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 shrink-0 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 h-fit sticky top-24">
                    <nav className="space-y-2">
                        {[
                            { id: 'gym', label: 'Gimnasio', icon: '🏢' },
                            { id: 'equipment', label: 'Equipamiento', icon: '🏋️' },
                            { id: 'billing', label: 'Plan y Facturación', icon: '💳' },
                            { id: 'integrations', label: 'Integraciones', icon: '🔌' },
                            { id: 'users', label: 'Permisos', icon: '👥' },
                            { id: 'branding', label: 'Personalización', icon: '🎨' },
                        ].map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id as any)}
                                className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold overflow-hidden group ${activeSection === section.id
                                    ? 'text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="text-xl relative z-10 group-hover:scale-110 transition-transform">{section.icon}</span>
                                <span className="relative z-10">{section.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 min-h-[600px] shadow-2xl shadow-black/40"
                        >
                            {/* Billing & Plans */}
                            {activeSection === 'billing' && limits && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">💳 Plan y Suscripción</h2>
                                            <p className="text-gray-400 text-sm">Gestiona tu suscripción a Virtud Gym y tus límites de uso.</p>
                                        </div>
                                        <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl">
                                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Plan Actual</p>
                                            <p className="text-lg font-black text-white italic uppercase">{gymInfo?.planes_suscripcion?.nombre || 'Básico'}</p>
                                        </div>
                                    </div>

                                    {/* Status Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:border-purple-500/30">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-tighter">Estado de Cuenta</p>
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full animate-pulse ${gymInfo?.estado_pago_saas === 'active' ? 'bg-green-500 shadow-lg shadow-green-500/40' : 'bg-red-500 shadow-lg shadow-red-500/40'}`} />
                                                <p className="text-xl font-bold text-white uppercase italic">
                                                    {gymInfo?.estado_pago_saas === 'active' ? 'Al día' : 'Pendiente'}
                                                </p>
                                            </div>
                                            <p className="text-[10px] text-gray-500 mt-2">Próximo cobro: {gymInfo?.fecha_proximo_pago ? new Date(gymInfo.fecha_proximo_pago).toLocaleDateString() : 'N/A'}</p>
                                        </motion.div>

                                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:border-purple-500/30">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-tighter">Socios / Alumnos</p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-3xl font-black text-white">{limits.currentUsers}</p>
                                                <p className="text-gray-500 font-bold mb-1">/ {limits.limitUsers}</p>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(((limits.currentUsers || 0) / (limits.limitUsers === '∞' ? 1000 : (limits.limitUsers as number) || 1)) * 100, 100)}%` }}
                                                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div whileHover={{ y: -5 }} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all hover:border-blue-500/30">
                                            <p className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-tighter">Sedes / Sucursales</p>
                                            <div className="flex items-end gap-2">
                                                <p className="text-3xl font-black text-white">{limits.currentBranches}</p>
                                                <p className="text-gray-500 font-bold mb-1">/ {limits.limitBranches}</p>
                                            </div>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(((limits.currentBranches || 0) / (limits.limitBranches === '∞' ? 10 : (limits.limitBranches as number) || 1)) * 100, 100)}%` }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-8 bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/20 rounded-[2.5rem]">
                                            <h3 className="text-lg font-black text-white italic uppercase mb-2">
                                                {gymInfo?.estado_pago_saas === 'active' ? 'Escalar Plan' : 'Reactivar Cuenta'}
                                            </h3>
                                            <p className="text-xs text-gray-400 mb-6">
                                                {gymInfo?.estado_pago_saas === 'active'
                                                    ? 'Aumenta tu capacidad de alumnos y obtén funciones avanzadas de IA.'
                                                    : 'Regulariza tu deuda para volver a tener acceso total a la plataforma.'}
                                            </p>
                                            <button
                                                onClick={handleSaaSPayment}
                                                disabled={loading}
                                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl ${gymInfo?.estado_pago_saas === 'active'
                                                    ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-900/20'
                                                    : 'bg-green-600 text-white hover:bg-green-700 shadow-green-900/20'
                                                    }`}
                                            >
                                                {loading ? 'Procesando...' : gymInfo?.estado_pago_saas === 'active' ? 'Mejorar mi Suscripción' : '🚀 Pagar Mensualidad'}
                                            </button>
                                        </div>

                                        <div className="p-8 bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem]">
                                            <h3 className="text-lg font-black text-white italic uppercase mb-2">Gestionar Sedes</h3>
                                            <p className="text-xs text-gray-400 mb-6">Cada sede adicional tiene un costo de $20/mes fuera de tu plan.</p>
                                            <button
                                                onClick={handleSaaSPayment}
                                                disabled={loading}
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20"
                                            >
                                                {loading ? 'Procesando...' : '+ Agregar Nueva Sede ($20)'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gym Settings */}
                            {activeSection === 'gym' && (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-bold text-white mb-4">🏢 Información del Gimnasio</h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 group">
                                            <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Nombre del Gimnasio</label>
                                            <input
                                                type="text"
                                                value={gymSettings.name}
                                                onChange={(e) => setGymSettings({ ...gymSettings, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10 shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                                            <input
                                                type="tel"
                                                value={gymSettings.phone}
                                                onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10 shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                value={gymSettings.email}
                                                onChange={(e) => setGymSettings({ ...gymSettings, email: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10 shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-2 group">
                                            <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Horarios de Atención</label>
                                            <input
                                                type="text"
                                                value={gymSettings.openingHours}
                                                onChange={(e) => setGymSettings({ ...gymSettings, openingHours: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10 shadow-inner"
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2 group">
                                            <label className="block text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">Dirección Física</label>
                                            <input
                                                type="text"
                                                value={gymSettings.address}
                                                onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600 focus:bg-white/10 shadow-inner"
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

                                    <div className="grid grid-cols-1 gap-6">
                                        {/* MercadoPago */}
                                        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-[#009ee3]/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-[#009ee3]/20">
                                                        💳
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-xl">MercadoPago</h3>
                                                        <p className="text-sm text-gray-500">Cobros automáticos y conciliación bancaria.</p>
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
                                                    <div className="w-14 h-7 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                                                </label>
                                            </div>

                                            <AnimatePresence>
                                                {integrations.mercadopago.enabled && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="space-y-4 pt-6 mt-6 border-t border-white/5 overflow-hidden"
                                                    >
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Clave Pública</label>
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
                                                                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Token de Acceso</label>
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
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>

                                        {/* Email */}
                                        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-3xl shadow-inner shadow-purple-500/20">
                                                        📧
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white text-xl">Email (SendGrid)</h3>
                                                        <p className="text-sm text-gray-500">Notificaciones transaccionales y marketing.</p>
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
                                                    <div className="w-14 h-7 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 peer-checked:after:bg-white"></div>
                                                </label>
                                            </div>

                                            <AnimatePresence>
                                                {integrations.email.enabled && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="space-y-1 pt-6 mt-6 border-t border-white/5 overflow-hidden"
                                                    >
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
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    </div>

                                    <button
                                        onClick={saveSettings}
                                        className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-3xl transition-all border border-white/10 uppercase tracking-widest text-xs mt-8 shadow-xl shadow-black/20"
                                    >
                                        ACTUALIZAR CREDENCIALES
                                    </button>
                                </div>
                            )}

                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">👥 Seguridad y Accesos</h2>
                                    <p className="text-gray-400 text-sm">Define qué puede hacer cada tipo de usuario en el sistema.</p>
                                </div>

                                <RoleManagement />

                                <div className="pt-8 border-t border-white/5">
                                    <h3 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-6 ml-1">Guía de Privilegios por Rol</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { role: 'SuperAdmin', permissions: ['Control Total', 'Gestión Financiera', 'Gestión de Staff', 'Configuración del Sistema'], info: 'Acceso ilimitado a todas las funciones.', color: 'purple' },
                                            { role: 'Admin', permissions: ['Ver usuarios', 'Editar clases', 'Ver finanzas', 'Gestionar stock'], info: 'Personal administrativo centrado en la operación diaria.', color: 'blue' },
                                            { role: 'Coach', permissions: ['Ver alumnos', 'Crear rutinas', 'Pasar lista', 'Chat con alumnos'], info: 'Personal deportivo limitado a la gestión de sus alumnos.', color: 'orange' },
                                            { role: 'Miembro', permissions: ['Ver su progreso', 'Reservar clases', 'Chat con coach', 'Ver su rutina'], info: 'Clientes del gimnasio con acceso a su propia información.', color: 'green' },
                                        ].map((roleInfo) => (
                                            <div key={roleInfo.role} className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:bg-white/10 transition-all group">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`w-2 h-8 rounded-full bg-${roleInfo.color}-500 shadow-lg shadow-${roleInfo.color}-500/40`} />
                                                    <div>
                                                        <h3 className={`font-black text-white text-xl tracking-tight`}>{roleInfo.role}</h3>
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{roleInfo.info}</p>
                                                    </div>
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
                            </div>

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
                                                <div className="w-full h-12 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden relative">
                                                    <Image src="/logos/Logo-Fondo-Negro.png" alt="Logo" width={120} height={32} className="object-contain" />
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
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
