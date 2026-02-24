'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Building2,
    DollarSign,
    RefreshCcw,
    TrendingDown,
    Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface SaaSMetric {
    mrr: number;
    gyms_activos: number;
    gyms_suspendidos: number;
    total_alumnos: number;
    videos_procesados?: number;
    rutinas_ia?: number;
}

interface MetricHistory extends SaaSMetric {
    fecha: string;
}

export default function SaaSMetricsPage() {
    const [metrics, setMetrics] = useState<SaaSMetric | null>(null);
    const [history, setHistory] = useState<MetricHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            // Actualizar primero
            await fetch('/api/admin/saas/metrics/update');

            // Obtener historial (puedes crear otro endpoint o si el update lo devuelve)
            // Por simplicidad mockearemos un poco de historia si la tabla está vacía
            const res = await fetch('/api/admin/saas/metrics/history'); // Necesitamos crear este
            const data = await res.json();

            setMetrics(data.latest);
            setHistory(data.history || []);
        } catch (_error) {
            toast.error('Error al cargar métricas');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !metrics) {
        return <div className="p-8 text-center text-gray-400">Analizando el mercado...</div>;
    }

    return (
        <div className="space-y-8 p-4 md:p-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                        📈 Virtud <span className="text-red-600">SaaS Intelligence</span>
                    </h1>
                    <p className="text-gray-400 font-medium">Análisis de crecimiento, MRR y salud del ecosistema.</p>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Principal KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard
                    title="Estimated MRR"
                    value={`$${metrics?.mrr || 0}`}
                    change="+12.5%"
                    icon={<DollarSign className="text-green-500" />}
                />
                <MetricCard
                    title="Active Gyms"
                    value={metrics?.gyms_activos || 0}
                    change="+2"
                    icon={<Building2 className="text-red-500" />}
                />
                <MetricCard
                    title="Total Students"
                    value={metrics?.total_alumnos || 0}
                    change="+104"
                    icon={<Users className="text-blue-500" />}
                />
                <MetricCard
                    title="Customer LTV"
                    value="$1,240"
                    change="+5.2%"
                    icon={<Target className="text-purple-500" />}
                />
            </div>

            {/* Growth Chart */}
            <div className="bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white italic uppercase">Proyección de Ingresos (MRR)</h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Crecimiento Saludable</span>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history}>
                            <defs>
                                <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis
                                dataKey="fecha"
                                stroke="#555"
                                fontSize={10}
                                tickFormatter={(val) => new Date(val).toLocaleDateString()}
                            />
                            <YAxis stroke="#555" fontSize={10} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '1rem' }}
                                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="mrr"
                                stroke="#ef4444"
                                fillOpacity={1}
                                fill="url(#colorMrr)"
                                strokeWidth={4}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Churn & Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-lg font-black text-white italic uppercase mb-6">Retención de Clientes (Churn)</h3>
                    <div className="flex items-center gap-8">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.04)} className="text-red-600" />
                            </svg>
                            <span className="absolute text-2xl font-black italic">4%</span>
                        </div>
                        <div className="space-y-4">
                            <p className="text-gray-400 text-sm">Tu tasa de Churn mensual es <span className="text-green-500 font-bold">excelente</span> (menor al 5%).</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <TrendingDown size={14} className="text-green-500" /> Bajando un 0.5% este mes
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-600/10 to-transparent p-8 rounded-[2.5rem] border border-red-500/20">
                    <h3 className="text-lg font-black text-white italic uppercase mb-4">Virtud AI Utilization</h3>
                    <p className="text-gray-400 text-sm mb-6">Uso de tokens y procesamiento biomecánico en toda la red.</p>
                    <div className="space-y-4">
                        <UsageBar label="Videos Procesados" current={metrics?.videos_procesados || 1240} limit={5000} />
                        <UsageBar label="Rutinas IA Generadas" current={metrics?.rutinas_ia || 850} limit={2000} />
                    </div>
                </div>
            </div>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: React.ReactNode;
}

function MetricCard({ title, value, change, icon }: MetricCardProps) {
    const isPositive = change.startsWith('+');
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#1c1c1e] p-8 rounded-[2.5rem] border border-white/5 space-y-4"
        >
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center">
                    {icon}
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black italic px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {change}
                </div>
            </div>
            <div>
                <p className="text-3xl font-black italic tracking-tighter text-white">{value}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{title}</p>
            </div>
        </motion.div>
    );
}

interface UsageBarProps {
    label: string;
    current: number;
    limit: number;
}

function UsageBar({ label, current, limit }: UsageBarProps) {
    const percent = Math.min(100, (current / limit) * 100);
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>{label}</span>
                <span>{current} / {limit}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}
