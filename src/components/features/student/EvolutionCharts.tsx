'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';

import { EvolutionChartData, AttendanceChartData, ItemVariants } from '@/types/student-components';

interface EvolutionChartsProps {
    chartData: EvolutionChartData[];
    attendance: AttendanceChartData[];
    volumeData?: Array<{ week: string; volume: number }>;
    itemVariants: ItemVariants;
}

export function EvolutionCharts({ chartData, attendance, volumeData = [], itemVariants }: EvolutionChartsProps) {
    const [activeTab, setActiveTab] = useState<'progress' | 'attendance' | 'strength'>('progress');

    return (
        <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    📊 Tu Evolución
                </h3>
                <div className="flex bg-black/40 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                    {[
                        { id: 'progress', label: 'Progreso', icon: '📈' },
                        { id: 'strength', label: 'Fuerza', icon: '⚡' },
                        { id: 'attendance', label: 'Asistencia', icon: '📅' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="h-[300px] w-full">
                {activeTab === 'progress' && (
                    chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="week" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px' }} />
                                <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#4ade80" strokeWidth={3} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="musculo" name="Músculo (kg)" stroke="#fb923c" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState icon="📉" message="Aún no hay datos de pesaje." />
                    )
                )}

                {activeTab === 'strength' && (
                    volumeData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="week" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="volume" name="Tonelaje Total (kg)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState icon="🏋️" message="Completa sesiones para ver tu fuerza." />
                    )
                )}

                {activeTab === 'attendance' && (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px' }} />
                            <Bar dataKey="rate" name="Clases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </motion.div>
    );
}

function EmptyState({ icon, message }: { icon: string, message: string }) {
    return (
        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 mx-4">
            <span className="text-4xl mb-4">{icon}</span>
            <p className="text-gray-400 font-medium text-center px-4">{message}</p>
        </div>
    );
}
