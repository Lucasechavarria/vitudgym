'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getRankByPoints, getNextRank } from '@/lib/constants/gamification';

// Mock Challenges (keep mock for now as API/DB for challenges is not fully implemented)
const CHALLENGES = [
    {
        id: 1,
        name: 'Desafío Sentadilla ⚔️',
        description: 'Mayor peso en 1RM (Aprobado por Coach)',
        participants: 8,
        endsIn: '2 días',
        prize: '🏆 Badge exclusivo',
        status: 'active',
        type: 'open',
        leader: 'Carlos Ruiz - 150kg',
    },
    {
        id: 2,
        name: 'Duelo de Plancha ⏱️',
        description: 'Reto personal: Quién aguanta más tiempo.',
        participants: 2,
        endsIn: '5 días',
        prize: '⭐ 200 puntos',
        status: 'active',
        type: 'individual',
        opponent: 'Ana Martínez',
        leader: 'Tú - 4:20 min',
    },
];

interface Achievement {
    id: number;
    unlocked_at: string;
    achievements: {
        icon: string;
        name: string;
        description: string;
    };
}

interface LeaderboardUser {
    name: string;
    points: number;
    streak: number;
}

export function Gamification() {
    const [view, setView] = useState<'ranking' | 'achievements' | 'challenges'>('ranking');
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [challengeType, setChallengeType] = useState<'open' | 'individual'>('open');
    const [targetStudent, setTargetStudent] = useState('');
    const [loading, setLoading] = useState(true);

    // State populated from API
    const [myStats, setMyStats] = useState({ points: 0, current_streak: 0, level: 1 });
    const [myAchievements, setMyAchievements] = useState<Achievement[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

    useEffect(() => {
        fetchGamificationData();
    }, []);

    const fetchGamificationData = async () => {
        try {
            const res = await fetch('/api/gamification');
            const data = await res.json();

            if (data.stats) setMyStats(data.stats);
            if (data.achievements) setMyAchievements(data.achievements);
            if (data.leaderboard) setLeaderboard(data.leaderboard);
        } catch (error) {
            console.error(error);
            toast.error('Error cargando datos de gamificación');
        } finally {
            setLoading(false);
        }
    };

    // Derived State
    const currentRank = getRankByPoints(myStats.points);
    const nextRank = getNextRank(currentRank);
    const progress = nextRank
        ? ((myStats.points - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100
        : 100;

    // Combine current user into leaderboard for display logic if needed or use API leaderboard
    // The API sends top 10. We display them.

    if (loading) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando perfil gamer...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Panel de Estado del Usuario (Hero Section) */}
            <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${currentRank.color} shadow-lg shadow-black/20 text-white`}>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
                    {/* Info Rango */}
                    <div className="flex items-center gap-4">
                        <div className="text-6xl bg-white/20 backdrop-blur-md rounded-2xl w-24 h-24 flex items-center justify-center shadow-inner border border-white/30">
                            {currentRank.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium opacity-90 uppercase tracking-widest">Rango Actual</p>
                            <h2 className="text-4xl font-black tracking-tight">{currentRank.name}</h2>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {currentRank.benefits.map((b, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm">
                                        ✨ {b}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="w-full md:max-w-md space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="flex items-center gap-2">
                                <span className="text-xl">📈</span>
                                {myStats.points.toLocaleString()} XP
                            </span>
                            <span>{nextRank ? `Próximo: ${nextRank.name}` : '¡Nivel Máximo!'}</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10 relative">
                            <motion.div
                                className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, progress)}%` }}
                                transition={{ type: "spring", bounce: 0, duration: 1 }}
                            />
                        </div>
                        <div className="flex justify-between text-xs opacity-75 font-mono">
                            <span>{currentRank.minPoints} XP</span>
                            <div className="flex items-center gap-1">
                                {nextRank && (
                                    <span className="bg-black/20 px-2 py-0.5 rounded-full text-[9px]">
                                        🎁 Próximo: {nextRank.benefits[0]}
                                    </span>
                                )}
                                <span>{nextRank ? `${nextRank.minPoints} XP` : '∞'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            </div>

            {/* View Selector */}
            <div className="flex gap-2 bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-xl p-2 sticky top-4 z-20 shadow-xl">
                {[
                    { id: 'ranking', label: '🏆 Ranking', },
                    { id: 'achievements', label: '🎖️ Logros', },
                    { id: 'challenges', label: '⚔️ Desafíos', },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as 'ranking' | 'achievements' | 'challenges')}
                        className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all text-sm md:text-base ${view === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Ranking View */}
            {view === 'ranking' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-white px-2">🏆 HONOR Y GLORIA</h3>
                    </div>

                    {/* Podium (Top 3) */}
                    <div className="flex items-end justify-center gap-2 md:gap-4 mb-8 pt-6">
                        {/* 2nd Place */}
                        {leaderboard[1] && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-gray-400 overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
                                        <div className={`w-full h-full bg-gradient-to-br ${getRankByPoints(leaderboard[1].points).color} flex items-center justify-center text-white font-bold text-lg`}>
                                            {leaderboard[1].name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-400 rounded-full flex items-center justify-center font-black text-white text-xs sm:text-base md:text-lg shadow-lg">2</div>
                                </div>
                                <p className="mt-3 font-bold text-gray-300 text-sm md:text-base truncate max-w-[80px] md:max-w-none">{leaderboard[1].name.split(' ')[0]}</p>
                                <p className="text-gray-500 text-xs font-mono">{leaderboard[1].points.toLocaleString()} XP</p>
                                <div className="h-16 md:h-20 w-16 md:w-24 bg-gray-400/20 backdrop-blur-sm rounded-t-2xl mt-4 border-x border-t border-white/10" />
                            </motion.div>
                        )}

                        {/* 1st Place */}
                        {leaderboard[0] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center z-10 group cursor-pointer"
                            >
                                <div className="relative">
                                    <motion.div
                                        animate={{ y: [0, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 3 }}
                                        className="absolute -top-8 sm:-top-10 left-1/2 -translate-x-1/2 text-2xl sm:text-4xl drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                                    >
                                        👑
                                    </motion.div>
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform bg-[#0a0a0a]">
                                        <div className={`w-full h-full bg-gradient-to-br ${getRankByPoints(leaderboard[0].points).color} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl`}>
                                            {leaderboard[0].name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 bg-yellow-500 rounded-full flex items-center justify-center font-black text-white text-base sm:text-xl md:text-2xl shadow-xl border-4 border-yellow-600">1</div>
                                </div>
                                <p className="mt-4 font-black text-white text-base md:text-xl uppercase tracking-tighter drop-shadow-md">{leaderboard[0].name.split(' ')[0]}</p>
                                <p className="text-yellow-500 font-black font-mono text-sm md:text-base">{leaderboard[0].points.toLocaleString()} XP</p>
                                <div className="h-28 md:h-36 w-24 md:w-32 bg-yellow-500/20 backdrop-blur-md rounded-t-2xl mt-4 border-x border-t border-yellow-500/30 flex flex-col items-center pt-2">
                                    <span className="text-yellow-500 text-sm font-bold tracking-widest uppercase mb-1">MVP</span>
                                    <span className="text-2xl">🔥</span>
                                </div>
                            </motion.div>
                        )}

                        {/* 3rd Place */}
                        {leaderboard[2] && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-col items-center group cursor-pointer"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700 overflow-hidden shadow-xl group-hover:scale-110 transition-transform">
                                        <div className={`w-full h-full bg-gradient-to-br ${getRankByPoints(leaderboard[2].points).color} flex items-center justify-center text-white font-bold text-lg`}>
                                            {leaderboard[2].name.charAt(0)}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-amber-700 rounded-full flex items-center justify-center font-black text-white text-xs sm:text-base md:text-lg shadow-lg">3</div>
                                </div>
                                <p className="mt-3 font-bold text-gray-400 text-sm md:text-base truncate max-w-[80px] md:max-w-none">{leaderboard[2].name.split(' ')[0]}</p>
                                <p className="text-gray-500 text-xs font-mono">{leaderboard[2].points.toLocaleString()} XP</p>
                                <div className="h-12 md:h-16 w-16 md:w-24 bg-amber-700/20 backdrop-blur-sm rounded-t-2xl mt-4 border-x border-t border-white/10" />
                            </motion.div>
                        )}
                    </div>

                    {/* Rest of the List (4-10) */}
                    <div className="space-y-2 bg-black/20 rounded-2xl p-2 border border-white/5">
                        {leaderboard.length === 0 && <p className="text-gray-500 text-center py-4">Aún no hay datos en el ranking.</p>}
                        {leaderboard.slice(3).map((user, index) => {
                            const actualIndex = index + 3;
                            const userRank = getRankByPoints(user.points);
                            return (
                                <motion.div
                                    key={actualIndex}
                                    layout
                                    className="p-3 rounded-xl border bg-white/5 border-white/5 hover:bg-white/10 transition-all flex items-center gap-4"
                                >
                                    <div className="text-lg font-black w-8 text-center text-gray-500 font-mono">
                                        #{actualIndex + 1}
                                    </div>

                                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${userRank.color} flex items-center justify-center text-white font-bold shadow-lg border border-white/10`}>
                                        {user.name.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-200 truncate">{user.name}</p>
                                            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full text-gray-400 uppercase tracking-tighter">{userRank.name}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-lg font-black text-gray-100 tabular-nums leading-none">
                                            {user.points.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">XP</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4 flex items-center gap-4 group cursor-help transition-all hover:bg-white/5">
                        <div className="text-2xl group-hover:scale-125 transition-transform duration-500">💎</div>
                        <p className="text-gray-400 text-xs">
                            <span className="text-blue-400 font-bold">PRO TIP:</span> Los primeros 3 puestos del ranking desbloquean <strong>Beneficios Legendarios</strong> al finalizar el mes. ¡Mantené tu racha viva! 🔥
                        </p>
                    </div>
                </div>
            )}

            {/* Achievements View */}
            {view === 'achievements' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">🎖️ VITRINA DE TROFEOS</h3>
                        <span className="text-xs font-bold text-gray-500 uppercase">{myAchievements.length} DESBLOQUEADOS</span>
                    </div>

                    {myAchievements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <span className="text-6xl mb-4 opacity-20">🏆</span>
                            <p className="text-gray-500 font-bold">Tu vitrina está vacía.</p>
                            <p className="text-gray-600 text-sm">Entrená duro para ganar tu primera medalla.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {myAchievements.map((ua, i) => (
                                <motion.div
                                    key={ua.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -10, rotate: [0, -2, 2, 0] }}
                                    className="relative group"
                                >
                                    <div className="p-6 rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 flex flex-col items-center text-center shadow-2xl h-full backdrop-blur-sm overflow-hidden">
                                        {/* Glow effect */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="text-6xl mb-4 relative z-10 drop-shadow-2xl filter saturate-150">
                                            {ua.achievements.icon}
                                        </div>
                                        <h4 className="font-black text-white text-sm md:text-base uppercase tracking-tight mb-1 relative z-10 leading-none">
                                            {ua.achievements.name}
                                        </h4>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium relative z-10 line-clamp-2">
                                            {ua.achievements.description}
                                        </p>

                                        <div className="mt-4 pt-4 border-t border-white/5 w-full">
                                            <p className="text-[9px] text-gray-600 font-mono uppercase">
                                                Obtenido: {new Date(ua.unlocked_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Reflection overlay */}
                                    <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-[2rem] pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/20 flex gap-4 items-center">
                            <span className="text-3xl">🔥</span>
                            <div>
                                <p className="text-orange-500 font-black text-xs uppercase">Racha Actual</p>
                                <p className="text-white font-bold text-sm">{myStats.current_streak} Días Imparable</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex gap-4 items-center">
                            <span className="text-3xl">🎯</span>
                            <div>
                                <p className="text-blue-500 font-black text-xs uppercase">Próximo Desafío</p>
                                <p className="text-white font-bold text-sm">Completá 5 clases este mes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Challenges View */}
            {view === 'challenges' && (
                <div className="space-y-4">
                    {/* Keep existing UI for Challenges from previous version but static for now */}
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-white">⚔️ Desafíos Activos</h3>
                        <button
                            onClick={() => setShowCreateChallenge(true)}
                            className="px-3 py-2 text-sm md:px-4 md:py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transition-all"
                        >
                            + Crear Desafío
                        </button>
                    </div>

                    <div className="space-y-4">
                        {CHALLENGES.map((challenge) => (
                            <div key={challenge.id} className="p-6 rounded-xl border bg-white/5 border-white/10 hover:border-purple-500/50 transition-all relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${challenge.type === 'open' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                                        }`}>
                                        {challenge.type === 'open' ? '🌎 Abierto' : '⚔️ Duelo Personal'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-1">{challenge.name}</h4>
                                        <p className="text-sm text-gray-400">{challenge.description}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Participantes</p>
                                        <p className="text-white font-bold">{challenge.participants}</p>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Líder Actual</p>
                                        <p className="text-white font-bold truncate text-xs">{challenge.leader}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 bg-purple-500/10 hover:bg-purple-500 text-purple-300 hover:text-white rounded-lg transition-all font-bold text-sm">
                                        Ver Progreso de Todos
                                    </button>
                                    {challenge.type === 'open' && (
                                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg transition-all font-bold text-sm">
                                            Unirse
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create Challenge Modal */}
            <AnimatePresence>
                {showCreateChallenge && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateChallenge(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1c1c1e] rounded-2xl border border-white/10 max-w-md w-full p-8 text-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Crear Nuevo Desafío ⚔️
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Reta a tus compañeros y sube en el ranking.</p>

                            <form className="space-y-4" onSubmit={(e) => {
                                e.preventDefault();
                                const msg = challengeType === 'individual'
                                    ? `¡Duelo enviado a ${targetStudent || 'tu compañero'}! Esperando aceptación.`
                                    : '¡Desafío propuesto! Todos podrán unirse una vez el coach lo apruebe.';
                                toast.success(msg);
                                setShowCreateChallenge(false);
                            }}>
                                <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5 mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setChallengeType('open')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all ${challengeType === 'open' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500'}`}
                                    >
                                        🌍 Abierto
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setChallengeType('individual')}
                                        className={`py-2 text-xs font-bold rounded-lg transition-all ${challengeType === 'individual' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500'}`}
                                    >
                                        ⚔️ Individual
                                    </button>
                                </div>

                                {challengeType === 'individual' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Seleccionar Oponente</label>
                                        <select
                                            required
                                            value={targetStudent}
                                            onChange={(e) => setTargetStudent(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-white"
                                        >
                                            <option value="" className="bg-[#1c1c1e]">Elegir compañero...</option>
                                            {leaderboard.map(u => (
                                                <option key={u.name} value={u.name} className="bg-[#1c1c1e]">{u.name}</option>
                                            ))}
                                        </select>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre del Desafío</label>
                                    <input
                                        required
                                        placeholder={challengeType === 'individual' ? "Ej: Duelo de dominadas" : "Ej: Desafío mensual de asistencia"}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Reglas / Meta</label>
                                    <textarea
                                        required
                                        placeholder="Define cómo se gana..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-all h-24 resize-none text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Duración (días)</label>
                                        <input type="number" defaultValue={7} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Premio sugerido (XP)</label>
                                        <input type="number" defaultValue={500} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateChallenge(false)}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-all text-sm"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20 text-sm"
                                    >
                                        {challengeType === 'individual' ? 'Enviar Duelo' : 'Crear Desafío'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
