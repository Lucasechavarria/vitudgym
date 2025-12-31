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

export default function StudentDashboard() {
  const { data, loading, isRequesting, handleRequestRoutine, handleGoalModal } = useStudentDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const { progress, attendance, routine, profile } = data;
  const latestProgress = progress[progress.length - 1];

  // Membership Expiration Logic
  const membershipEndDate = profile?.membership_end_date ? new Date(profile.membership_end_date) : null;
  const isExpiringSoon = membershipEndDate && (membershipEndDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;
  const daysRemaining = membershipEndDate ? Math.ceil((membershipEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  const chartData = progress.length > 0 ? progress.map((p: any) => ({
    week: new Date(p.recorded_at).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
    peso: p.weight,
    grasa: p.body_fat,
    musculo: p.muscle_mass
  })) : [];

  const stats = [
    { label: 'Peso Actual', value: `${latestProgress?.weight || '--'} kg`, icon: '⚖️', trend: 'Objetivo: 75kg', color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400' },
    { label: 'Clases Asistidas', value: attendance.reduce((acc: number, curr: any) => acc + (curr.rate || 0), 0).toString(), icon: '🗓️', trend: 'Total Histórico', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400' },
    { label: 'Grasa Corporal', value: `${latestProgress?.body_fat || '--'}%`, icon: '💧', trend: 'Bajo Control', color: 'from-orange-500/20 to-orange-600/5 border-orange-500/30 text-orange-400' },
    { label: 'Músculo', value: `${latestProgress?.muscle_mass || '--'} kg`, icon: '💪', trend: 'En Aumento', color: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      <DashboardHeader gender={profile?.gender} itemVariants={itemVariants} />

      <WaiverWarning waiverAccepted={profile?.waiver_accepted} />

      {isExpiringSoon && (
        <motion.div
          variants={itemVariants}
          className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-white font-bold">Tu membresía vence pronto</p>
              <p className="text-red-400 text-sm">
                {daysRemaining! <= 0
                  ? 'Tu membresía ha vencido. Por favor, realiza el pago para continuar.'
                  : `Quedan ${daysRemaining} días para el vencimiento.`}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/payments"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            Renovar Ahora
          </Link>
        </motion.div>
      )}

      <StatsOverview stats={stats} itemVariants={itemVariants} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EvolutionCharts
            chartData={chartData}
            attendance={attendance}
            itemVariants={itemVariants}
          />

          <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-1 shadow-xl overflow-hidden">
            <div className="p-6 pb-0">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                🏆 Logros y Ranking
              </h3>
            </div>
            <Gamification />
          </motion.div>
        </div>

        <div className="space-y-8">
          <RoutinePreview
            routine={routine}
            handleRequestRoutine={handleRequestRoutine}
            handleGoalModal={handleGoalModal}
            isRequesting={isRequesting}
            itemVariants={itemVariants}
          />
          <QuickMessages itemVariants={itemVariants} />
        </div>
      </div>

      <GoalRequestModal
        isOpen={data.isGoalModalOpen}
        onClose={() => handleGoalModal(false)}
        onSubmit={handleRequestRoutine}
        isSubmitting={isRequesting}
      />

      {/* Floating Report Button */}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="fixed bottom-6 right-6 z-50">
        <Link
          href="/dashboard/report-issue"
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/30 text-white hover:scale-110 transition-all duration-300 group"
        >
          <span className="text-2xl group-hover:animate-bounce">🔔</span>
        </Link>
      </motion.div>
    </motion.div>
  );
}