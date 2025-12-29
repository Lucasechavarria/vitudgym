'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReportsPanel } from '@/components/features/coach/ReportsPanel';
import { toast } from 'react-hot-toast';
import { CoachAttendanceWidget } from '@/components/features/coach/CoachAttendanceWidget';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function CoachDashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>({
        stats: { activeStudents: 0 },
        upcomingClasses: [],
        recentReports: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/coach/dashboard');
                if (!res.ok) throw new Error('Error al cargar datos');
                const dashboardData = await res.json();
                setData(dashboardData);
            } catch (error) {
                console.error('Error fetching coach dashboard:', error);
                // Optionally toast.error specific message
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const nextClass = data.upcomingClasses[0];

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 relative z-10"
        >
            <motion.h2
                variants={item}
                className="text-4xl font-black mb-6 drop-shadow-sm"
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
                    Hola, Coach
                </span>{' '}
                <span className="inline-block" style={{ filter: 'none' }}>👋</span>
            </motion.h2>

            {/* Próxima Clase Highlight */}
            <Link href="/coach/classes">
                <motion.div
                    variants={item}
                    whileHover={{ scale: 1.02, rotateX: 2 }}
                    className="bg-gradient-to-br from-orange-600 to-red-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl border border-orange-500/20 group cursor-pointer"
                >
                    <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay"></div>
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-orange-400/30 rounded-full blur-3xl group-hover:bg-orange-400/40 transition-colors duration-500"></div>

                    <div className="relative z-10">
                        {loading ? (
                            <div className="animate-pulse flex flex-col gap-4">
                                <div className="h-6 w-32 bg-white/20 rounded-full"></div>
                                <div className="h-12 w-64 bg-white/20 rounded-lg"></div>
                                <div className="h-6 w-48 bg-white/20 rounded-lg"></div>
                            </div>
                        ) : nextClass ? (
                            <>
                                <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4 inline-block border border-white/10 shadow-lg">
                                    {new Date(nextClass.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <h3 className="text-5xl font-black text-white mb-2 tracking-tight">{nextClass.activities?.name || 'Clase'}</h3>
                                <p className="text-orange-100 text-xl font-medium flex items-center gap-2">
                                    <span>📍 Sala Principal</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-300"></span>
                                    <span>👥 {nextClass.bookings?.[0]?.count || 0} Alumnos</span>
                                </p>
                            </>
                        ) : (
                            <>
                                <span className="bg-black/40 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-4 inline-block border border-white/10 shadow-lg">
                                    Sin clases cercanas
                                </span>
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Todo despejado hoy</h3>
                                <p className="text-orange-100 text-xl font-medium">
                                    Aprovecha para revisar rutinas o descansar.
                                </p>
                            </>
                        )}
                    </div>
                </motion.div>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alumnos Recientes / Reportes */}
                <motion.div variants={item} className="bg-[#1c1c1e]/60 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🔔</span> Alumnos con Dudas
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-gray-400 text-sm">Cargando reportes...</p>
                        ) : data.recentReports?.length > 0 ? (
                            data.recentReports.map((report: any) => (
                                <StudentCard
                                    key={report.id}
                                    name={report.profiles?.full_name || 'Alumno'}
                                    status={report.title || 'Nuevo reporte'}
                                    delay={0.1}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>🎉 No hay reportes pendientes</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Acciones Rápidas y Asistencia */}
                <div className="space-y-8">
                    <CoachAttendanceWidget />

                    <motion.div variants={item} className="grid grid-cols-2 gap-4">
                        <ActionCard label="Crear Rutina" icon="📝" href="/coach/routines" delay={0.4} />
                        <ActionCard label="Ver Asistencia" icon="✅" href="/coach/classes" delay={0.5} />
                        <ActionCard label="Agenda" icon="📅" href="/coach/classes" delay={0.6} />
                        <ActionCard label={`Alumnos (${data.stats.activeStudents})`} icon="👥" href="/coach/students" delay={0.7} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

function StudentCard({ name, status, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center font-bold text-white shadow-lg group-hover:ring-2 ring-orange-500/50 transition-all">
                    {name.charAt(0)}
                </div>
                <div>
                    <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{name}</h4>
                    <p className="text-xs text-orange-400/80 font-medium">{status}</p>
                </div>
            </div>
            <button className="text-xs font-bold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-all border border-white/5">
                Ver
            </button>
        </motion.div>
    )
}

function ActionCard({ label, icon, href, delay }: { label: string, icon: string, href?: string, delay?: number }) {
    const content = (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center justify-center p-6 bg-[#1c1c1e]/80 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-orange-500/20 hover:border-orange-500/50 transition-all group h-full w-full shadow-lg hover:shadow-orange-500/20"
        >
            <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{icon}</span>
            <span className="font-bold text-gray-300 group-hover:text-white transition-colors">{label}</span>
        </motion.div>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {content}
            </Link>
        );
    }

    return (
        <button className="block h-full w-full text-left">
            {content}
        </button>
    );
}
