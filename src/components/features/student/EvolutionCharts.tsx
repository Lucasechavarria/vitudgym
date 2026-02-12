'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { TrendingUp, Activity, Calendar, Zap, BarChart3 } from 'lucide-react';

import { EvolutionChartData, AttendanceChartData, ItemVariants } from '@/types/student-components';

interface EvolutionChartsProps {
    chartData: EvolutionChartData[];
    attendance: AttendanceChartData[];
    volumeData?: Array<{ week: string; volume: number }>;
    itemVariants: ItemVariants;
}

export function EvolutionCharts({ chartData, attendance, volumeData = [], itemVariants }: EvolutionChartsProps) {
    const [activeTab, setActiveTab] = useState<'progress' | 'attendance' | 'strength'>('progress');

    const tabs = [
        { id: 'progress', label: 'Antropometría', icon: TrendingUp, color: 'text-emerald-500' },
        { id: 'strength', label: 'Capacidad de Carga', icon: Zap, color: 'text-orange-500' },
        { id: 'attendance', label: 'Despliegue Mensual', icon: BarChart3, color: 'text-blue-500' },
    ];

    return (
        <motion.div
            variants={itemVariants}
            className="bg-zinc-900 border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
        >
            {/* Background Highlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

            <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 mb-12 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Analytics Engine v1.0</span>
                    </div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                        Bio-Métricas & <span className="text-blue-500">Rendimiento</span>
                    </h3>
                </div>

                <div className="flex bg-black/40 p-1.5 rounded-[1.5rem] border border-white/5 w-full xl:w-auto overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 xl:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white/10 text-white shadow-xl border border-white/10'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon size={14} className={activeTab === tab.id ? tab.color : 'text-zinc-700'} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[350px] w-full relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="h-full w-full"
                    >
                        {activeTab === 'progress' && (
                            chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="week" stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#161618', border: '1px solid #ffffff10', borderRadius: '1.5rem', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: '#555', marginTop: '20px' }} />
                                        <Area type="monotone" dataKey="peso" name="Peso Corporall" stroke="#10b981" fillOpacity={1} fill="url(#colorPeso)" strokeWidth={3} />
                                        <Line type="monotone" dataKey="musculo" name="Masa Muscular" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState icon={<TrendingUp size={32} />} message="Esperando registros antropométricos..." />
                            )
                        )}

                        {activeTab === 'strength' && (
                            volumeData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                        <XAxis dataKey="week" stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#161618', border: '1px solid #ffffff10', borderRadius: '1.5rem', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="volume" name="Tonelaje Total (kg)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#000' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <EmptyState icon={<Zap size={32} />} message="Completa sesiones para habilitar el motor de fuerza." />
                            )
                        )}

                        {activeTab === 'attendance' && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendance}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis dataKey="month" stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#333" tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#161618', border: '1px solid #ffffff10', borderRadius: '1.5rem' }} />
                                    <Bar dataKey="rate" name="Clases" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

function EmptyState({ icon, message }: { icon: React.ReactNode, message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[2.5rem] bg-black/20 group">
            <div className="text-zinc-800 mb-6 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px] text-center px-8 italic">{message}</p>
        </div>
    );
}
