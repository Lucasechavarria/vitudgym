'use client';

import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const VOLUME_DATA = [
    { week: 'Sem 1', kg: 12000, rpe: 7 },
    { week: 'Sem 2', kg: 13500, rpe: 7.5 },
    { week: 'Sem 3', kg: 15000, rpe: 8 },
    { week: 'Sem 4', kg: 11000, rpe: 6 }, // Descarga
    { week: 'Sem 5', kg: 16000, rpe: 8.5 },
    { week: 'Sem 6', kg: 17500, rpe: 9 },
];

const SKILLS_DATA = [
    { subject: 'Fuerza', A: 120, fullMark: 150 },
    { subject: 'Cardio', A: 98, fullMark: 150 },
    { subject: 'Movilidad', A: 86, fullMark: 150 },
    { subject: 'Potencia', A: 99, fullMark: 150 },
    { subject: 'Resistencia', A: 85, fullMark: 150 },
    { subject: 'Técnica', A: 65, fullMark: 150 },
];

const PROGRESS_DATA = [
    { name: 'Ene', squat: 100, deadlift: 120, bench: 80 },
    { name: 'Feb', squat: 110, deadlift: 130, bench: 85 },
    { name: 'Mar', squat: 115, deadlift: 135, bench: 87.5 },
    { name: 'Abr', squat: 125, deadlift: 145, bench: 92.5 },
    { name: 'May', squat: 130, deadlift: 155, bench: 95 },
    { name: 'Jun', squat: 140, deadlift: 165, bench: 100 },
];

export default function MetricsDashboard() {
    const [activeTab, setActiveTab] = useState<'volume' | 'skills' | 'progress'>('volume');

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit">
                {['volume', 'skills', 'progress'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'volume' | 'skills' | 'progress')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all relative ${activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        {activeTab === tab && (
                            <motion.div
                                layoutId="activeMeta"
                                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl shadow-lg"
                            />
                        )}
                        <span className="relative z-10">
                            {tab === 'volume' ? 'Carga Total' : tab === 'skills' ? 'Perfil Atleta' : 'Progresión 1RM'}
                        </span>
                    </button>
                ))}
            </div>

            {/* Charts Area */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'volume' && (
                        <motion.div
                            key="volume"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Volumen Semanal (Kg Totales)</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <AreaChart data={VOLUME_DATA}>
                                    <defs>
                                        <linearGradient id="colorKg" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="week" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '12px' }}
                                        labelStyle={{ color: '#aaa' }}
                                    />
                                    <Area type="monotone" dataKey="kg" stroke="#f97316" fillOpacity={1} fill="url(#colorKg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {activeTab === 'skills' && (
                        <motion.div
                            key="skills"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Perfil de Rendimiento</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <RadarChart outerRadius="80%" data={SKILLS_DATA}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#333" />
                                    <Radar name="Alumnos Promedio" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '12px' }} />
                                    <Legend />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}

                    {activeTab === 'progress' && (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full h-full"
                        >
                            <h3 className="text-xl font-bold text-white mb-2">Evolución de Fuerza (1RM Estimado)</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={PROGRESS_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" />
                                    <YAxis stroke="#666" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: '1px solid #333', borderRadius: '12px' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="squat" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Sentadilla" />
                                    <Line type="monotone" dataKey="deadlift" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} name="Peso Muerto" />
                                    <Line type="monotone" dataKey="bench" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Banca" />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Volumen Total', value: '45.2 Ton', trend: '+12%', color: 'text-orange-500' },
                    { label: 'Asistencia Promedio', value: '88%', trend: '+5%', color: 'text-green-500' },
                    { label: 'PRs este mes', value: '24', trend: 'Nuevo Récord', color: 'text-purple-500' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[#1c1c1e]/40 p-6 rounded-2xl border border-white/5"
                    >
                        <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                        <p className={`text-xs font-bold ${stat.color} mt-2`}>{stat.trend}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
