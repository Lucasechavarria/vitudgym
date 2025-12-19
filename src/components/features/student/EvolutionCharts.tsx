'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer
} from 'recharts';

interface EvolutionChartsProps {
    chartData: any[];
    attendance: any[];
    itemVariants: any;
}

export function EvolutionCharts({ chartData, attendance, itemVariants }: EvolutionChartsProps) {
    const [activeTab, setActiveTab] = useState<'progress' | 'attendance'>('progress');

    return (
        <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    📊 Tu Evolución
                </h3>
                <div className="flex bg-black/40 p-1 rounded-xl">
                    {[
                        { id: 'progress', label: 'Progreso', icon: '📈' },
                        { id: 'attendance', label: 'Asistencia', icon: '📅' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === tab.id
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

            {activeTab === 'progress' && (
                <div className="h-[250px] sm:h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="week"
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fill: '#888', fontSize: 10 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', fontSize: '12px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Line type="monotone" dataKey="peso" name="Peso" stroke="#4ade80" strokeWidth={3} dot={{ r: 3, fill: '#1c1c1e', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="musculo" name="Músculo" stroke="#fb923c" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 mx-4">
                            <span className="text-4xl mb-4">📉</span>
                            <p className="text-gray-400 font-medium text-center px-4">Aún no hay suficientes datos para mostrar gráficas.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'attendance' && (
                <div className="h-[250px] sm:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={attendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px', fontSize: '12x' }}
                            />
                            <Bar dataKey="rate" name="Clases" fill="url(#colorView)" radius={[6, 6, 0, 0]}>
                                <defs>
                                    <linearGradient id="colorView" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    </linearGradient>
                                </defs>
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </motion.div>
    );
}
