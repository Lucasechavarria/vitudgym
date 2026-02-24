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
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Stats {
    gyms: number;
    users: number;
    branches: number;
    revenue: number;
}

interface Activity {
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

export default function SuperAdminOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [churnData, setChurnData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'gyms' | 'saas' | 'global'>('gyms');

    const tabs = [
        { id: 'gyms', label: 'Gestión de Red', icon: <Building2 size={16} /> },
        { id: 'saas', label: 'Economía SaaS', icon: <TrendingUp size={16} /> },
        { id: 'global', label: 'Control Global', icon: <History size={16} /> },
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
    ];

    const quickActions = {
        gyms: [
            { label: 'Nuevo Gimnasio', icon: <PlusCircle size={20} />, href: '/admin/gyms?action=new', color: 'from-blue-600 to-cyan-500' },
            { label: 'Listado Global', icon: <LayoutDashboard size={20} />, href: '/admin/gyms', color: 'from-indigo-600 to-blue-500' },
        ],
        saas: [
            { label: 'Planes SaaS', icon: <Gem size={20} />, href: '/admin/plans', color: 'from-purple-600 to-pink-500' },
            { label: 'Métricas de Pago', icon: <CreditCard size={20} />, href: '/admin/finance/metrics', color: 'from-green-600 to-emerald-500' },
        ],
        global: [
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
            }
        } catch (error) {
            console.error('Error fetching global stats:', error);
        } finally {
            setLoading(false);
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
                        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/20 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Rendimiento Operativo</h3>
                                <div className="space-y-6">
                                    <StatusRow label="Salud de la Red" value="Estable" color="bg-green-500" progress={95} />
                                    <StatusRow label="Disponibilidad Sedes" value="99.9%" color="bg-blue-500" progress={99.9} />
                                </div>
                            </div>
                            <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Alertas de Sedes</h3>
                                <AlertList alerts={alerts.filter(a => a.type === 'ticket')} />
                            </div>
                        </div>
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
                                    <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Log de Auditoría Global</h3>
                                    <Link href="/admin/security" className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white">Ver Todo</Link>
                                </div>
                                <ActivityLog activities={activities} />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                                    <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Sistema</h3>
                                    <div className="space-y-4">
                                        <SystemRow label="Base de Datos" status="Perfect" color="bg-green-500" />
                                        <SystemRow label="Edge Functions" status="Active" color="bg-blue-500" />
                                        <SystemRow label="Auth Service" status="Stable" color="bg-green-500" />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// -- Sub-componentes para mantener el orden --

function StatusRow({ label, value, color, progress }: any) {
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

function SystemRow({ label, status, color }: any) {
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

function ActivityLog({ activities }: { activities: Activity[] }) {
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

function ChurnChart({ data }: { data: any[] }) {
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
