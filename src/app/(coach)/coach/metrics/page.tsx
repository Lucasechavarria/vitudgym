'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for metrics
const MOCK_STUDENT_METRICS = {
    attendance: [
        { month: 'Ene', rate: 85 },
        { month: 'Feb', rate: 90 },
        { month: 'Mar', rate: 88 },
        { month: 'Abr', rate: 92 },
        { month: 'May', rate: 87 },
        { month: 'Jun', rate: 95 },
    ],
    performance: [
        { exercise: 'Sentadilla', current: 100, target: 120 },
        { exercise: 'Press Banca', current: 80, target: 90 },
        { exercise: 'Peso Muerto', current: 120, target: 140 },
        { exercise: 'Press Militar', current: 50, target: 60 },
    ],
    bodyMetrics: [
        { week: 'S1', peso: 75, grasa: 18 },
        { week: 'S2', peso: 74.5, grasa: 17.8 },
        { week: 'S3', peso: 74, grasa: 17.5 },
        { week: 'S4', peso: 73.5, grasa: 17.2 },
        { week: 'S5', peso: 73, grasa: 17 },
        { week: 'S6', peso: 72.5, grasa: 16.8 },
    ],
};

export default function CoachMetricsPage() {
    const [viewMode, setViewMode] = useState<'individual' | 'group' | 'class'>('individual');
    const [selectedStudent, setSelectedStudent] = useState('Juan Pérez');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-400 mb-2">
                        📊 Métricas de Rendimiento
                    </h1>
                    <p className="text-gray-400">Análisis de progreso y estadísticas.</p>
                </div>

                {/* View Mode Selector */}
                <div className="flex gap-2">
                    {[
                        { id: 'individual', label: '👤 Individual', desc: 'Por alumno' },
                        { id: 'group', label: '👥 Grupal', desc: 'Todos mis alumnos' },
                        { id: 'class', label: '🏋️ Por Clase', desc: 'Por clase' },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${viewMode === mode.id
                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                            title={mode.desc}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Student Selector (Individual Mode) */}
            {viewMode === 'individual' && (
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <label className="block text-gray-300 mb-2 font-bold">Seleccionar Alumno:</label>
                    <select
                        value={selectedStudent}
                        onChange={(e) => setSelectedStudent(e.target.value)}
                        className="w-full md:w-64 bg-[#0a0a0a] text-white border border-white/10 rounded-lg p-3"
                    >
                        <option>Juan Pérez</option>
                        <option>María García</option>
                        <option>Carlos López</option>
                    </select>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Asistencia',
                        value: viewMode === 'individual' ? '92%' : viewMode === 'group' ? '88%' : '95%',
                        icon: '✅',
                        color: 'text-green-400'
                    },
                    {
                        label: viewMode === 'class' ? 'Alumnos Presentes' : 'Días Entrenados',
                        value: viewMode === 'individual' ? '18/20' : viewMode === 'group' ? '145/160' : '24/25',
                        icon: '💪',
                        color: 'text-blue-400'
                    },
                    {
                        label: viewMode === 'class' ? 'Intensidad Prom.' : 'Progreso 1RM',
                        value: viewMode === 'individual' ? '+15kg' : viewMode === 'group' ? '+8.5kg' : '85%',
                        icon: '📈',
                        color: 'text-purple-400'
                    },
                    {
                        label: viewMode === 'class' ? 'Calorías Prom.' : 'Índice Grasa',
                        value: viewMode === 'individual' ? '16.8%' : viewMode === 'group' ? '18.2%' : '450',
                        icon: '🎯',
                        color: 'text-orange-400'
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={`${viewMode}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{stat.icon}</span>
                            <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
                        </div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Chart */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">📅 Asistencia Mensual</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={MOCK_STUDENT_METRICS.attendance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                            <XAxis dataKey="month" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Performance Chart */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">💪 Progreso 1RM</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={MOCK_STUDENT_METRICS.performance}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                            <XAxis dataKey="exercise" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Bar dataKey="current" fill="#8b5cf6" name="Actual" />
                            <Bar dataKey="target" fill="#3b82f6" name="Objetivo" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Body Metrics Chart */}
                <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 lg:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">📉 Evolución Corporal</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={MOCK_STUDENT_METRICS.bodyMetrics}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3c" />
                            <XAxis dataKey="week" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ background: '#1c1c1e', border: '1px solid #3a3a3c', borderRadius: '8px' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="peso" stroke="#f59e0b" strokeWidth={3} name="Peso (kg)" />
                            <Line type="monotone" dataKey="grasa" stroke="#ef4444" strokeWidth={3} name="% Grasa" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔥 Actividad Reciente</h3>
                <div className="space-y-3">
                    {[
                        { date: 'Hoy, 10:00', activity: 'Completó rutina Tren Superior', badge: 'Excelente forma' },
                        { date: 'Ayer, 18:30', activity: 'Nuevo PR en Sentadilla: 120kg', badge: '+10kg' },
                        { date: '12 Dic, 09:00', activity: 'Asistió a clase de HIIT', badge: '95% asistencia' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                            <div>
                                <p className="text-white font-medium">{item.activity}</p>
                                <p className="text-xs text-gray-400">{item.date}</p>
                            </div>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">
                                {item.badge}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
