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
    Search
} from 'lucide-react';

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

    const cards = [
        { title: 'Gimnasios en Red', value: stats?.gyms || 0, icon: <Building2 />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Usuarios Totales', value: stats?.users || 0, icon: <Users />, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: 'Sedes Activas', value: stats?.branches || 0, icon: <Zap />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Ingresos Netos', value: `$${stats?.revenue.toLocaleString('es-AR')}`, icon: <TrendingUp />, color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    return (
        <div className="space-y-8">
            {/* Master Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 group hover:border-red-500/30 transition-all cursor-default"
                    >
                        <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            {card.icon}
                        </div>
                        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">{card.title}</h3>
                        <p className="text-3xl font-black text-white mt-1 italic tracking-tighter">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Log */}
                <div className="lg:col-span-2 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <History size={20} className="text-red-500" />
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Registro de Auditoría</h3>
                        </div>
                        <button
                            onClick={() => window.location.href = '/admin/security'}
                            className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Ver historial completo
                        </button>
                    </div>

                    <div className="space-y-4">
                        {activities.length === 0 ? (
                            <p className="text-gray-600 text-center py-10 italic">No hay actividad registrada recientemente.</p>
                        ) : (
                            activities.map((act) => (
                                <div key={act.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-600/10 text-red-500 rounded-xl flex items-center justify-center font-bold text-xs uppercase text-center p-1 leading-none">
                                            {act.entidad_tipo?.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-200 font-bold">
                                                {act.accion.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-medium lowercase">
                                                {act.perfiles?.nombre_completo || 'Sistema'} @ {act.gimnasios?.nombre || 'General'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-mono">
                                        {new Date(act.creado_en).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* SaaS Performance & Status */}
                <div className="space-y-6">
                    <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-black text-white italic uppercase mb-6 tracking-tight flex items-center gap-2">
                            <TrendingUp size={18} className="text-purple-500" /> Churn Global
                        </h3>
                        <div className="flex items-end gap-3 h-32 mb-4">
                            {churnData.length === 0 ? (
                                <p className="text-gray-600 text-xs italic w-full text-center pb-10">Sin datos históricos</p>
                            ) : (
                                churnData.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="w-full bg-white/5 rounded-t-lg relative overflow-hidden h-full flex items-end">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${(d.churn_gyms_mes || 0) * 10}%` }}
                                                className="w-full bg-purple-500/40 group-hover:bg-purple-500 transition-all rounded-t-sm"
                                            />
                                            {d.churn_gyms_mes > 0 && (
                                                <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {d.churn_gyms_mes}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[8px] font-black text-gray-600 uppercase">
                                            {new Date(d.fecha).toLocaleDateString('es-AR', { month: 'short' })}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 leading-tight">
                            Total de gimnasios que se dieron de baja en los últimos 6 meses.
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Rendimiento Red</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Salud de la Base</span>
                                    <span>Óptima</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[100%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 mb-2">
                                    <span>Tasa de Disponibilidad</span>
                                    <span>99.99%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[99.99%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1c1c1e] border border-white/5 rounded-[2.5rem] p-8">
                        <h3 className="text-lg font-black text-white italic uppercase mb-4 tracking-tight">Alertas Críticas</h3>

                        <div className="space-y-3">
                            {alerts.length === 0 ? (
                                <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-3">
                                    <Zap size={20} className="text-green-500" />
                                    <p className="text-[10px] font-black text-green-500 uppercase">Sin Alertas Críticas</p>
                                </div>
                            ) : (
                                alerts.map((alert) => (
                                    <motion.div
                                        key={alert.id}
                                        whileHover={{ x: 5 }}
                                        onClick={() => window.location.href = alert.link}
                                        className={`p-4 rounded-2xl flex items-center gap-3 border cursor-pointer transition-all ${alert.type === 'payment'
                                            ? 'bg-red-500/10 border-red-500/20'
                                            : 'bg-amber-500/10 border-amber-500/20'
                                            }`}
                                    >
                                        <ShieldAlert size={20} className={alert.type === 'payment' ? 'text-red-500' : 'text-amber-500'} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${alert.type === 'payment' ? 'text-red-500' : 'text-amber-500'}`}>
                                                {alert.type === 'payment' ? 'Falla en Cobro' : 'Soporte Vital'}
                                            </p>
                                            <p className="text-xs text-white/80 font-medium leading-tight truncate">
                                                {alert.message}
                                            </p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-600" />
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
