'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Participant {
    user_id: string;
    full_name: string;
    current_score: string;
    status: string;
}

interface Challenge {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    points_reward: number; // Updated name
    participants_count?: number;
    participants?: Participant[];
}

export default function AdminChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

    // Form state
    const [newChallenge, setNewChallenge] = useState({
        title: '',
        description: '',
        rules: '',
        type: 'open',
        points_prize: 100, // We keep this in state for the form
        end_date: ''
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await fetch('/api/admin/challenges');
            const data = await res.json();
            if (data.challenges) setChallenges(data.challenges);
        } catch (error) {
            toast.error('Error al cargar desafíos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const toastId = toast.loading('Creando desafío...');
        try {
            const payload = {
                ...newChallenge,
                end_date: newChallenge.end_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                rules: newChallenge.rules || 'Reglas estándar del gimnasio'
            };

            const res = await fetch('/api/admin/challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Desafío creado', { id: toastId });
                setShowCreate(false);
                fetchChallenges();
            } else {
                throw new Error(data.error || 'Error al crear desafío');
            }
        } catch (error: any) {
            console.error('Create challenge error:', error);
            toast.error(error.message || 'Error al crear desafío', { id: toastId });
        }
    };

    const handleJudge = async (challengeId: string, winnerId: string, status: string = 'finished') => {
        const confirmMsg = status === 'active'
            ? '¿Quieres reiniciar este desafío? El ganador actual será borrado y todos los participantes podrán competir de nuevo.'
            : (winnerId ? '¿Confirmar ganador y otorgar puntos?' : '¿Finalizar este desafío sin un ganador?');

        if (!confirm(confirmMsg)) return;

        try {
            const res = await fetch(`/api/admin/challenges/${challengeId}/judge`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winnerId, status })
            });

            if (res.ok) {
                toast.success(status === 'active' ? 'Desafío reiniciado' : 'Arbitraje completado');
                fetchChallenges();
                setSelectedChallenge(null);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Error en la operación');
            }
        } catch (error) {
            toast.error('Error al arbitrar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">⚔️ Arbitraje de Desafíos</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold transition-all"
                >
                    + Nuevo Desafío
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((c) => (
                    <div key={c.id} className="bg-[#2c2c2e] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-white">{c.title}</h3>
                            <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-black ${c.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                {c.status}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">{c.description}</p>
                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                            <span>Premio: {c.points_reward} XP</span>
                            <span>Tipo: {c.type === 'open' ? '🌎 Abierto' : '⚔️ Duelo'}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedChallenge(c)}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-all"
                            >
                                {c.status === 'finished' ? 'Ver Resultados' : 'Participantes & Arbitraje'}
                            </button>
                            {c.status === 'finished' && (
                                <button
                                    onClick={() => handleJudge(c.id, '', 'active')}
                                    className="px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-bold hover:bg-purple-600 hover:text-white transition-all"
                                    title="Reiniciar Desafío"
                                >
                                    🔄
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Participantes / Arbitraje */}
            <AnimatePresence>
                {selectedChallenge && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1c1c1e] max-w-2xl w-full rounded-2xl border border-white/10 p-8"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-white">
                                    {selectedChallenge.status === 'finished' ? 'Resultados del Desafío' : 'Mesa de Arbitraje'}: {selectedChallenge.title}
                                </h2>
                                {selectedChallenge.status === 'finished' && (
                                    <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-xs font-black uppercase">Finalizado</span>
                                )}
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                <p className="text-gray-500 text-sm">
                                    {selectedChallenge.status === 'finished' ? 'Atletas que participaron:' : 'Lista de atletas compitiendo:'}
                                </p>
                                <div className="space-y-2">
                                    {selectedChallenge.participants && selectedChallenge.participants.length > 0 ? (
                                        selectedChallenge.participants.map((p: any) => (
                                            <div key={p.user_id} className={`p-4 rounded-xl border flex justify-between items-center group transition-all ${p.status === 'winner'
                                                    ? 'bg-yellow-600/20 border-yellow-500/50'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                }`}>
                                                <div>
                                                    <span className="text-white font-bold flex items-center gap-2">
                                                        {p.user?.full_name || 'Atleta Anónimo'}
                                                        {p.status === 'winner' && <span className="text-yellow-500 text-sm">🏆 Ganador</span>}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono">Score: {p.current_score || '0'}</span>
                                                </div>
                                                {selectedChallenge.status === 'active' && (
                                                    <button
                                                        onClick={() => handleJudge(selectedChallenge.id, p.user_id)}
                                                        className="px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all"
                                                    >
                                                        Declarar Ganador 🏆
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center text-gray-500 italic">
                                            Sin participantes registrados aún
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => setSelectedChallenge(null)}
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold"
                                >
                                    Cerrar
                                </button>
                                {selectedChallenge.status === 'active' && (
                                    <button
                                        onClick={() => handleJudge(selectedChallenge.id, '')}
                                        className="flex-1 py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl font-bold"
                                    >
                                        Finalizar sin Ganador
                                    </button>
                                )}
                                {selectedChallenge.status === 'finished' && (
                                    <button
                                        onClick={() => handleJudge(selectedChallenge.id, '', 'active')}
                                        className="flex-1 py-3 bg-purple-600 rounded-xl text-white font-bold"
                                    >
                                        Reiniciar Desafío 🔄
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Crear Desafío */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1c1c1e] max-w-md w-full rounded-2xl border border-white/10 p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Nuevo Desafío</h2>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <input
                                    required
                                    placeholder="Título del desafío"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                    onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                                />
                                <textarea
                                    placeholder="Descripción corta"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white h-24"
                                    onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        placeholder="Premio XP"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        onChange={(e) => setNewChallenge({ ...newChallenge, points_prize: parseInt(e.target.value) })}
                                    />
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white"
                                        onChange={(e) => setNewChallenge({ ...newChallenge, type: e.target.value })}
                                    >
                                        <option value="open">Abierto</option>
                                        <option value="individual">Duelo</option>
                                    </select>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreate(false)}
                                        className="flex-1 py-3 bg-white/5 rounded-xl text-gray-400 font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-purple-600 rounded-xl text-white font-bold"
                                    >
                                        Lanzar Desafío
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
