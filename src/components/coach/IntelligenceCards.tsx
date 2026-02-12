'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, Activity, Target, AlertTriangle } from 'lucide-react';

interface IntelligenceCardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
    subtitle?: string;
}

export function IntelligenceCard({ title, value, trend, icon, color, subtitle }: IntelligenceCardProps) {
    const colorMap = {
        blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
        green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        orange: 'from-orange-500/20 to-amber-500/20 border-orange-500/30',
        red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
        purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    };

    const iconColorMap = {
        blue: 'text-blue-400',
        green: 'text-green-400',
        orange: 'text-orange-400',
        red: 'text-red-400',
        purple: 'text-purple-400',
    };

    return (
        <motion.div
            className={`bg-gradient-to-br ${colorMap[color]} rounded-3xl p-6 border relative overflow-hidden group`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Background Icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <div className={`${iconColorMap[color]} scale-[3]`}>{icon}</div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${iconColorMap[color]}`}>
                        {icon}
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        {title}
                    </span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <h3 className="text-4xl font-black text-white mb-1">{value}</h3>
                        {subtitle && (
                            <p className="text-xs text-zinc-500">{subtitle}</p>
                        )}
                    </div>

                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend >= 0 ? (
                                <TrendingUp size={16} />
                            ) : (
                                <TrendingDown size={16} />
                            )}
                            <span className="text-sm font-bold">{Math.abs(trend)}%</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

interface AnalyticsData {
    totalStudents: number;
    activeStudents: number;
    averageAttendance: number;
    totalSessions: number;
    atRiskStudents: string[];
}

export function IntelligenceCardsGrid({ analytics }: { analytics: AnalyticsData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <IntelligenceCard
                title="Alumnos Activos"
                value={analytics.activeStudents}
                trend={12}
                icon={<Users size={20} />}
                color="blue"
                subtitle={`de ${analytics.totalStudents} totales`}
            />

            <IntelligenceCard
                title="Asistencia Promedio"
                value={`${analytics.averageAttendance}%`}
                trend={5}
                icon={<Activity size={20} />}
                color="green"
                subtitle="últimos 30 días"
            />

            <IntelligenceCard
                title="Sesiones Totales"
                value={analytics.totalSessions}
                trend={-3}
                icon={<Target size={20} />}
                color="purple"
                subtitle="este mes"
            />

            <IntelligenceCard
                title="Alumnos en Riesgo"
                value={analytics.atRiskStudents.length}
                icon={<AlertTriangle size={20} />}
                color="orange"
                subtitle="requieren atención"
            />
        </div>
    );
}
