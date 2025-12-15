'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Line, Bar } from 'recharts';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Gamification } from '@/components/features/student/Gamification';
import { toast } from 'react-hot-toast';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'progress' | 'attendance' | 'nutrition'>('progress');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    progress: [],
    attendance: [],
    routine: null
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/student/dashboard');
        if (!res.ok) throw new Error('Error cargando datos');
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar tu progreso');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { progress, attendance, routine } = data;

  // Transform progress for charts if needed
  const chartData = progress.length > 0 ? progress.map((p: any) => ({
    week: new Date(p.recorded_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
    peso: p.weight,
    grasa: p.body_fat,
    musculo: p.muscle_mass
  })) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white mb-2">
            Hola, Campeón 👋
          </h1>
          <p className="text-blue-100 text-lg">
            "La disciplina es el puente entre metas y logros." ¡Vamos por más!
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Peso Actual',
            value: progress[progress.length - 1]?.weight ? `${progress[progress.length - 1].weight}kg` : '--',
            trend: 'Ver histórico',
            icon: '⚖️',
            color: 'from-green-500/20 to-green-600/5 border-green-500/30 text-green-400'
          },
          {
            label: 'Clases Asistidas',
            value: attendance.reduce((acc: number, curr: any) => acc + curr.rate, 0),
            trend: 'Total',
            icon: '🔥',
            color: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400'
          },
          {
            label: '% Grasa',
            value: progress[progress.length - 1]?.body_fat ? `${progress[progress.length - 1].body_fat}%` : '--',
            trend: 'Última medición',
            icon: '📉',
            color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400'
          },
          {
            label: 'Músculo',
            value: progress[progress.length - 1]?.muscle_mass ? `${progress[progress.length - 1].muscle_mass}kg` : '--',
            trend: 'Masa Muscular',
            icon: '💪',
            color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400'
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl border rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl cursor-default`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl bg-black/20 p-2 rounded-lg">{stat.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70 bg-black/20 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">

          {/* Charts with Tabs */}
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

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="#666"
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#666"
                        tick={{ fill: '#888', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#fff', fontWeight: 600 }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="#4ade80" strokeWidth={3} dot={{ r: 4, fill: '#1c1c1e', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="musculo" name="Músculo (kg)" stroke="#fb923c" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl bg-white/5 mx-4">
                    <span className="text-4xl mb-4">📉</span>
                    <p className="text-gray-400 font-medium">Aún no hay suficientes datos para mostrar gráficas.</p>
                    <p className="text-gray-600 text-sm mt-2">Completa tus entrenamientos para ver tu progreso.</p>
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="month" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(20, 20, 22, 0.9)', border: 'none', borderRadius: '12px' }}
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

          {/* Gamification Section */}
          <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🏆 Logros y Ranking
              </h3>
            </div>
            <Gamification />
          </motion.div>

        </div>

        {/* Sidebar Column (Routine & Chat) */}
        <div className="space-y-8">

          {/* Mi Rutina Widget */}
          <motion.div variants={itemVariants} className="bg-gradient-to-b from-[#1c1c1e] to-[#151515] border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-xl font-bold text-white">💪 Rutina Actual</h3>
                <p className="text-gray-400 text-sm mt-1">{routine?.goal || 'Sin objetivo definido'}</p>
              </div>
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <span className="text-2xl">⚡</span>
              </div>
            </div>

            {routine ? (
              <div className="relative z-10 space-y-4">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-colors group-hover:bg-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-bold text-lg">{routine.name}</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Activa</span>
                  </div>

                  <div className="space-y-2 mt-4">
                    {routine.exercises?.slice(0, 3).map((exercise: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span className="flex-1 truncate">{exercise.name}</span>
                        <span className="text-gray-500">{exercise.sets}x{exercise.reps}</span>
                      </div>
                    ))}
                    {routine.exercises?.length > 3 && (
                      <p className="text-xs text-gray-500 pl-4">+ {routine.exercises.length - 3} ejercicios más</p>
                    )}
                  </div>
                </div>

                <Link
                  href="/dashboard/routine"
                  className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-center transition-all shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ver Rutina Completa
                </Link>
              </div>
            ) : (
              <div className="text-center py-8 relative z-10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  📝
                </div>
                <p className="text-gray-400 mb-6">Tu coach está diseñando tu plan a medida.</p>
                <button className="w-full border border-white/10 hover:bg-white/5 text-white py-3 rounded-xl transition-all text-sm font-bold">
                  Solicitar Rutina
                </button>
              </div>
            )}

            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
          </motion.div>

          {/* Quick Chat Widget */}
          <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Mensajes</h3>
              <Link href="/dashboard/messages" className="text-xs text-blue-400 hover:text-blue-300">Ver todo</Link>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 mb-4 border border-white/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                  C
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Tu Coach</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">Recuerda registrar tus pesos de hoy para ajustar las cargas de la próxima semana.</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/messages"
              className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all group"
            >
              <span>Ir al Chat</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Floating Report Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link
          href="/dashboard/report-issue"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/30 text-white hover:scale-110 hover:shadow-orange-500/50 transition-all duration-300"
        >
          <span className="text-2xl">🔔</span>
        </Link>
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/80 text-white text-xs px-3 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Reportar problema
        </div>
      </motion.div>

    </motion.div>
  );
}