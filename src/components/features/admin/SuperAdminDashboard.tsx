'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    TrendingUp,
    History,
    ShieldAlert,
    CreditCard,
    Zap,
    ChevronRight,
    Search,
    PlusCircle,
    LayoutDashboard,
    Ticket,
    Settings,
    Gem,
    ArrowUpRight,
    Megaphone,
    ToggleLeft,
    Activity,
    Eye
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Stats {
    gyms: number;
    users: number;
    branches: number;
    revenue: number;
}

interface SystemActivity {
    id: string;
    accion: string;
    entidad_tipo: string;
    creado_en: string;
    perfiles?: { nombre_completo: string };
    gimnasios?: { nombre: string };
}

interface Alert {
    id: string;
    type: 'ticket' | 'payment';
    priority: string;
    message: string;
    link: string;
}

interface GymHealth {
    id: string;
    nombre: string;
    scoring_salud: number;
    fase_onboarding: string;
}

interface Announcement {
    id: string;
    titulo: string;
    contenido: string;
    tipo: string;
    destino: string;
    creado_en: string;
}

interface ChurnData {
    fecha: string;
    churn_gyms_mes: number;
}

export default function SuperAdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<SystemActivity[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [churnData, setChurnData] = useState<ChurnData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'gyms' | 'saas' | 'global'>('gyms');
    const [gymsHealth, setGymsHealth] = useState<GymHealth[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ titulo: '', contenido: '', tipo: 'info', destino: 'todos' });

    const tabs = [
        { id: 'gyms', label: 'Gestión de Red', icon: <Building2 size={16} /> },
        { id: 'saas', label: 'Econ. SaaS', icon: <TrendingUp size={16} /> },
        { id: 'global', label: 'Comandos Hub', icon: <Megaphone size={16} /> },
    ];

    const gymCards = [
        { title: 'Gimnasios en Red', value: stats?.gyms || 0, icon: <Building2 />, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/50', href: '/admin/gyms' },
        { title: 'Sedes Activas', value: stats?.branches || 0, icon: <Zap />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50', href: '/admin/gyms' },
    ];

    const saasCards = [
        { title: 'Ingresos Netos', value: `$${stats?.revenue.toLocaleString('es-AR')}`, icon: <TrendingUp />, color: 'text-green-500', bg: 'bg-green-500/10', border: 'hover:border-green-500/50', href: '/admin/finance' },
    ];

    const globalCards = [
        { title: 'Usuarios Totales', value: stats?.users || 0, icon: <Users />, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500/50', href: '/admin/users' },
        { title: 'Logs de Auditoría', value: '24h', icon: <History />, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/50', href: '/admin/audit-logs' },
    ];

    const quickActions = {
        gyms: [
            { label: 'Nuevo Gimnasio', icon: <PlusCircle size={20} />, href: '/admin/gyms/new', color: 'from-blue-600 to-cyan-500' },
            { label: 'Listado Global', icon: <LayoutDashboard size={20} />, href: '/admin/gyms', color: 'from-indigo-600 to-blue-500' },
        ],
        saas: [
            { label: 'Planes SaaS', icon: <Gem size={20} />, href: '/admin/plans', color: 'from-purple-600 to-pink-500' },
            { label: 'Métricas de Pago', icon: <CreditCard size={20} />, href: '/admin/finance/metrics', color: 'from-green-600 to-emerald-500' },
        ],
        global: [
            { label: 'Centro de Auditoría', icon: <History size={20} />, href: '/admin/audit-logs', color: 'from-amber-600 to-orange-500' },
            { label: 'Soporte Global', icon: <Ticket size={20} />, href: '/admin/reports/tickets', color: 'from-orange-600 to-red-500' },
            { label: 'Configuración', icon: <Settings size={20} />, href: '/admin/settings', color: 'from-gray-600 to-slate-500' },
        ],
    };

    useEffect(() => {
        fetchGlobalData();
    }, []);

    const fetchGlobalData = async () => {
        try {
            const res = await fetch('/api/admin/global-stats');
            const data = await res.json();
            if (res.ok) {
                setStats(data.stats);
                setActivities(data.recentActivity);
                setAlerts(data.alerts || []);
                setChurnData(data.churnHistory || []);
                setGymsHealth(data.gymsHealth || []);
                setAnnouncements(data.announcements || []);
            }
        } catch (error) {
            console.error('Error fetching global stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async (gymId: string, gymName: string) => {
        if (!confirm(`¿Estás seguro de que deseas acceder remotamente al entorno de "${gymName}"?\nEsta acción quedará registrada en el log de auditoría.`)) return;

        try {
            const res = await fetch('/api/admin/impersonate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gymId, reason: 'Acceso desde Panel de SuperAdmin' })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                // Redirect to the gym's dashboard in a new tab or same view
                window.open(data.redirectUrl, '_blank');
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error('Error al intentar el acceso remoto');
        }
    };

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.titulo || !newAnnouncement.contenido) {
            toast.error('Título y contenido son obligatorios');
            return;
        }

        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAnnouncement)
            });

            if (res.ok) {
                toast.success('Anuncio enviado exitosamente');
                setShowBroadcastModal(false);
                setNewAnnouncement({ titulo: '', contenido: '', tipo: 'info', destino: 'todos' });
                fetchGlobalData();
            } else {
                const d = await res.json();
                toast.error(d.error);
            }
        } catch (err) {
            toast.error('Error al enviar comunicado');
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Tab Selector */}
            <div className="flex p-1.5 bg-[#1c1c1e] rounded-2xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
            >
                {/* Stats Grid Dinámico */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(activeTab === 'gyms' ? gymCards : activeTab === 'saas' ? saasCards : globalCards).map((card, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => router.push(card.href)}
                            className={`bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 group ${card.border} transition-all cursor-pointer relative overflow-hidden`}
                        >
                            <div className="absolute top-4 right-6 text-white/0 group-hover:text-white/20 transition-all transform translate-x-4 group-hover:translate-x-0">
                                <ArrowUpRight size={20} />
                            </div>
                            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                {card.icon}
                            </div>
                            <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{card.title}</h3>
                            <p className="text-3xl font-black text-white mt-1 italic tracking-tighter">{card.value}</p>
                            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">
                                <span>Administrar</span>
                                <ChevronRight size={10} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions dinámicas por contexto */}
                <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <Zap size={20} className="text-red-500 fill-red-500" />
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tight">
                            {activeTab === 'gyms' ? 'Operaciones de Red' : activeTab === 'saas' ? 'Control de Negocio' : 'Infraestructura Global'}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickActions[activeTab].map((action, i) => (
                            <Link key={i} href={action.href} className="group relative h-24 overflow-hidden rounded-2xl">
                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                <div className="relative h-full flex flex-col items-center justify-center gap-2 border border-white/5 group-hover:border-white/20 transition-all rounded-2xl">
                                    <div className="p-2 bg-white/5 rounded-xl text-white group-hover:scale-110 transition-transform">
                                        {action.icon}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-white uppercase tracking-widest transition-colors">
                                        {action.label}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contenido dinámico según el Tab */}
                    {activeTab === 'gyms' && (
                        <>
                            <div className="lg:col-span-2 bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-6 tracking-tight flex items-center gap-2">
                                    <Activity size={18} className="text-blue-500" /> Salud de Gimnasios (Red)
                                </h3>
                                <div className="space-y-4">
                                    {gymsHealth.map((gym, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/[0.07] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-blue-500">
                                                    {gym.scoring_salud}%
                                                </div>
                                                <div>
                                                    <p className="text-sm text-white font-bold">{gym.nombre}</p>
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{gym.fase_onboarding}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => router.push(`/admin/gyms/${gym.id}`)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Ver Configuración">
                                                    <ToggleLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleImpersonate(gym.id, gym.nombre)}
                                                    className="p-2 bg-red-600/10 rounded-lg text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                                    title="Acceso Remoto (Impersonate)"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {gymsHealth.length === 0 && (
                                        <p className="text-xs text-center text-gray-500 py-10 uppercase font-black italic">No hay datos de salud disponibles</p>
                                    )}
                                </div>
                            </div>
                            <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Alertas de Sedes</h3>
                                <AlertList alerts={alerts.filter(a => a.type === 'ticket')} />
                            </div>
                        </>
                    )}

                    {activeTab === 'saas' && (
                        <>
                            <div className="lg:col-span-2 bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-6 tracking-tight flex items-center gap-2">
                                    <TrendingUp size={18} className="text-purple-500" /> Histórico de Churn
                                </h3>
                                <ChurnChart data={churnData} />
                            </div>
                            <div className="bg-gradient-to-br from-emerald-600/10 to-transparent border border-emerald-500/20 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight flex items-center gap-2">
                                    <CreditCard size={18} className="text-emerald-500" /> Alertas de Pago
                                </h3>
                                <AlertList alerts={alerts.filter(a => a.type === 'payment')} />
                            </div>
                        </>
                    )}

                    {activeTab === 'global' && (
                        <>
                            <div className="lg:col-span-2 bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight flex items-center gap-2">
                                        <Megaphone size={20} className="text-red-500" /> Broadcast Center
                                    </h3>
                                    <button
                                        onClick={() => setShowBroadcastModal(true)}
                                        className="px-4 py-2 bg-red-600 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Nuevo Anuncio
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {announcements.map((ann, i) => (
                                        <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.tipo === 'alerta' ? 'bg-red-500' : ann.tipo === 'mantenimiento' ? 'bg-orange-500' : 'bg-blue-600'} text-white`}>
                                                        {ann.tipo}
                                                    </span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                                                        Destino: {ann.destino === 'coaches' ? 'Profesores' : ann.destino === 'admin_gym' ? 'Admins Gym' : ann.destino}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-600 font-mono italic">{new Date(ann.creado_en).toLocaleDateString('es-AR')}</span>
                                            </div>
                                            <h4 className="text-sm text-white font-bold">{ann.titulo}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{ann.contenido}</p>
                                        </div>
                                    ))}
                                    {announcements.length === 0 && (
                                        <div className="py-20 flex flex-col items-center justify-center opacity-30">
                                            <Megaphone size={40} className="text-white mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Silencio total en la red</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                    <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight flex items-center gap-2">
                                        <ShieldAlert size={18} className="text-orange-500" /> Seguridad
                                    </h3>
                                    <div className="space-y-4">
                                        <SystemRow label="Auditoría" status="Activa" color="bg-green-500" />
                                        <SystemRow label="Remote Connect" status="Safe" color="bg-blue-500" />
                                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                                            <p className="text-[9px] font-black text-blue-400 uppercase leading-tight">
                                                Tu acceso está siendo auditado bajo cumplimiento ISO-27001.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                    <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Actividad</h3>
                                    <ActivityLog activities={activities.slice(0, 3)} />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Modal de Broadcast */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#1c1c1e] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
                    >
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-red-600/10 to-transparent">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                                <Megaphone className="text-red-500" /> Crear Comunicado
                            </h3>
                            <p className="text-gray-500 text-xs mt-1 uppercase font-bold tracking-widest">Broadcast Global Network</p>
                        </div>

                        <form onSubmit={handleBroadcast} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Título del Anuncio</label>
                                <input
                                    type="text"
                                    value={newAnnouncement.titulo}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, titulo: e.target.value })}
                                    placeholder="Ej: Mantenimiento Programado"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tipo</label>
                                    <select
                                        value={newAnnouncement.tipo}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, tipo: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none"
                                    >
                                        <option value="info">Información</option>
                                        <option value="alerta">Alerta Crítica</option>
                                        <option value="novedad">Novedad / Update</option>
                                        <option value="mantenimiento">Mantenimiento</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Destinatarios</label>
                                    <select
                                        value={newAnnouncement.destino}
                                        onChange={e => setNewAnnouncement({ ...newAnnouncement, destino: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all appearance-none"
                                    >
                                        <option value="todos">Toda la Red (Todos)</option>
                                        <option value="admin_gym">Solo Administradores</option>
                                        <option value="coaches">Solo Profesores / Coaches</option>
                                        <option value="alumnos">Solo Alumnos</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mensaje Detallado</label>
                                <textarea
                                    rows={4}
                                    value={newAnnouncement.contenido}
                                    onChange={e => setNewAnnouncement({ ...newAnnouncement, contenido: e.target.value })}
                                    placeholder="Escribe aquí el contenido del comunicado..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-all resize-none"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowBroadcastModal(false)}
                                    className="flex-1 px-6 py-4 bg-white/5 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Enviar a la Red
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

// -- Sub-componentes para mantener el orden --

function StatusRow({ label, value, color, progress }: { label: string; value: string | number; color: string; progress: number }) {
    return (
        <div>
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                <span>{label}</span>
                <span>{value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}

function SystemRow({ label, status, color }: { label: string; status: string; color: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <span className="text-[10px] font-black text-gray-400 uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse`} />
                <span className="text-[10px] font-black text-white uppercase">{status}</span>
            </div>
        </div>
    );
}

function AlertList({ alerts }: { alerts: Alert[] }) {
    if (alerts.length === 0) {
        return (
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center">
                <p className="text-[10px] font-black text-gray-500 uppercase italic">Sin alertas en este sector</p>
            </div>
        );
    }
    return (
        <div className="space-y-3">
            {alerts.map((alert) => (
                <Link key={alert.id} href={alert.link} className="block p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-white/20 transition-all">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={16} className={alert.type === 'payment' ? 'text-red-500' : 'text-amber-500'} />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-bold truncate">{alert.message}</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase">{alert.priority}</p>
                        </div>
                        <ChevronRight size={12} className="text-gray-600" />
                    </div>
                </Link>
            ))}
        </div>
    );
}

function ActivityLog({ activities }: { activities: SystemActivity[] }) {
    if (activities.length === 0) return <p className="text-gray-600 text-center py-10 italic">No hay actividad.</p>;
    return (
        <div className="space-y-4">
            {activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-600/10 text-red-500 rounded-xl flex items-center justify-center font-bold text-[8px] uppercase text-center p-1">
                            {act.entidad_tipo?.substring(0, 3)}
                        </div>
                        <div>
                            <p className="text-sm text-gray-200 font-bold">{act.accion.replace(/_/g, ' ')}</p>
                            <p className="text-[10px] text-gray-500 font-medium lowercase italic">
                                {act.perfiles?.nombre_completo || 'Sistema'} @ {act.gimnasios?.nombre || 'General'}
                            </p>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">
                        {new Date(act.creado_en).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            ))}
        </div>
    );
}

function ChurnChart({ data }: { data: ChurnData[] }) {
    if (data.length === 0) return <p className="text-gray-600 text-xs italic text-center pb-10">Sin datos históricos</p>;
    return (
        <div className="flex items-end gap-3 h-32 mb-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-white/5 rounded-t-lg relative overflow-hidden h-full flex items-end">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(d.churn_gyms_mes || 0) * 10}%` }}
                            className="w-full bg-purple-500/40 group-hover:bg-purple-500 transition-all rounded-t-sm"
                        />
                    </div>
                    <span className="text-[8px] font-black text-gray-600 uppercase">
                        {new Date(d.fecha).toLocaleDateString('es-AR', { month: 'short' })}
                    </span>
                </div>
            ))}
        </div>
    );
}
