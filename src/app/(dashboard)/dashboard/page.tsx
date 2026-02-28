'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';
import { StatsOverview } from '@/components/features/student/StatsOverview';
import { EvolutionCharts } from '@/components/features/student/EvolutionCharts';
import { RoutinePreview } from '@/components/features/student/RoutinePreview';
import { QuickMessages } from '@/components/features/student/QuickMessages';
import { Gamification } from '@/components/features/student/Gamification';
import { DashboardHeader } from '@/components/features/student/DashboardHeader';
import { WaiverWarning } from '@/components/features/student/WaiverWarning';
import { GoalRequestModal } from '@/components/features/student/GoalRequestModal';
import { VisionAlert } from '@/components/features/student/VisionAlert';
import { RecoveryForm } from '@/components/features/recovery/RecoveryForm';
import Paywall from '@/components/features/dashboard/Paywall';


export default function StudentDashboard() {
  const {
    data,
    loading,
    isRequesting,
    isGoalModalOpen,
    handleRequestRoutine,
    handleGoalModal,
  } = useStudentDashboard();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { progress, attendance, routine, profile } = data;
  const latestProgress = progress[progress.length - 1];

  // Membership Paywall Logic
  const membershipStatus = profile?.estado_membresia || 'inactive';
  const isBlocked = ['expired', 'inactive', 'suspended'].includes(membershipStatus);

  const membershipEndDate = profile?.fecha_fin_membresia ? new Date(profile.fecha_fin_membresia) : null;
  const isExpiringSoon = !isBlocked && membershipEndDate && (membershipEndDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;
  const daysRemaining = membershipEndDate ? Math.ceil((membershipEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  if (isBlocked) {
    return (
      <div className="p-6 space-y-12 pb-20 pt-8">
        <DashboardHeader gender={profile?.gender} itemVariants={itemVariants} />
        <Paywall status={membershipStatus} gymName={(profile as any)?.gimnasios?.nombre || 'tu gimnasio'} />
      </div>
    );
  }

  const chartData = progress.length > 0 ? progress.map((p: any) => ({
    week: p.registrado_en ? new Date(p.registrado_en).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }) : '--/--',
    peso: p.peso,
    grasa: p.grasa_corporal,
    musculo: p.masa_muscular
  })) : [];

  const stats = [
    { label: 'Peso Actual', value: `${latestProgress?.peso || '--'} kg`, icon: '⚖️', trend: 'Objetivo Personal', color: 'from-blue-600 to-cyan-500' },
    { label: 'Clases Asistidas', value: attendance.reduce((acc: number, curr: { rate: number }) => acc + (curr.rate || 0), 0).toString(), icon: '🗓️', trend: 'Total Histórico', color: 'from-purple-600 to-indigo-500' },
    { label: 'Grasa Corporal', value: `${latestProgress?.grasa_corporal || '--'}%`, icon: '💧', trend: 'Bajo Control', color: 'from-orange-600 to-red-500' },
    { label: 'Músculo', value: `${latestProgress?.masa_muscular || '--'} kg`, icon: '💪', trend: 'En Aumento', color: 'from-emerald-600 to-teal-500' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      <DashboardHeader gender={profile?.gender} itemVariants={itemVariants} />

      <WaiverWarning waiverAccepted={profile?.exencion_aceptada} />

      {isExpiringSoon && (
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 border border-red-500/30 rounded-[2rem] p-6 flex items-center justify-between backdrop-blur-3xl"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="text-white font-black uppercase tracking-widest text-xs">Aviso de Membresía</p>
              <p className="text-red-400 text-sm font-medium mt-1">
                Quedan {daysRemaining} días para el vencimiento.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/payments"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20"
          >
            Renovar Ahora
          </Link>
        </motion.div>
      )}

      {/* New Vision Analysis Alert */}
      <VisionAlert itemVariants={itemVariants} />

      <StatsOverview stats={stats} itemVariants={itemVariants} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Recovery Form Section */}
          <motion.div variants={itemVariants}>
            <RecoveryForm />
          </motion.div>

          <EvolutionCharts
            chartData={chartData}
            attendance={attendance}
            volumeData={data.volume}
            itemVariants={itemVariants}
          />

          <motion.div variants={itemVariants} className="bg-zinc-900 border border-white/5 rounded-[3rem] p-2 shadow-2xl overflow-hidden relative">
            <div className="p-10 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em]">Hall of Fame</span>
              </div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-8">
                🏆 Logros & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">Ranking Elite</span>
              </h3>
            </div>
            <Gamification />
          </motion.div>
        </div>

        <div className="space-y-12">
          <RoutinePreview
            routine={routine}
            handleGoalModal={handleGoalModal}
            isRequesting={isRequesting}
            itemVariants={itemVariants}
          />
          <QuickMessages itemVariants={itemVariants} />
        </div>
      </div>

      <GoalRequestModal
        isOpen={isGoalModalOpen}
        onClose={() => handleGoalModal(false)}
        onSubmit={handleRequestRoutine}
        isSubmitting={isRequesting}
      />

      {/* Floating Report Button */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-10 right-10 z-50">
        <Link
          href="/dashboard/report-issue"
          className="flex items-center justify-center w-16 h-16 bg-zinc-900 border border-white/10 rounded-full shadow-2xl text-white hover:scale-110 transition-all duration-300 group backdrop-blur-3xl"
        >
          <span className="text-3xl group-hover:animate-bounce">🔔</span>
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </motion.div>
    </motion.div>
  );
}
