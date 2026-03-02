'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar, Utensils, Send, Info } from 'lucide-react';

interface GoalRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { goal: string; frequency: number; includeNutrition: boolean }) => void;
    isSubmitting: boolean;
}

export function GoalRequestModal({ isOpen, onClose, onSubmit, isSubmitting }: GoalRequestModalProps) {
    const [goal, setGoal] = useState('');
    const [frequency, setFrequency] = useState(3);
    const [includeNutrition, setIncludeNutrition] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ goal, frequency, includeNutrition });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-[#1c1c1e] w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl relative"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-orange-600/20 to-purple-600/20 pointer-events-none" />

                        <div className="p-8 relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500">
                                        <Target size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white">Nueva Rutina IA</h2>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Personaliza tu objetivo</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Goal Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-orange-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Info size={12} /> ¿Cuál es tu objetivo?
                                    </label>
                                    <textarea
                                        required
                                        value={goal}
                                        onChange={(e) => setGoal(e.target.value)}
                                        placeholder="Ej: Bajar de peso centrándome en cardio, o ganar masa muscular en piernas..."
                                        className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-4 text-white outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all min-h-[120px] resize-none placeholder:text-gray-600 shadow-inner"
                                    />
                                </div>

                                {/* Frequency Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-orange-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <Calendar size={12} /> Frecuencia Semanal
                                    </label>
                                    <div className="flex justify-between gap-2 p-1 bg-white/5 rounded-[2rem] border border-white/10">
                                        {[2, 3, 4, 5, 6].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setFrequency(num)}
                                                className={`flex-1 py-3 px-2 rounded-[1.5rem] font-bold text-sm transition-all ${frequency === num
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20 scale-105'
                                                        : 'text-gray-500 hover:text-white'
                                                    }`}
                                            >
                                                {num} <span className="text-[10px] opacity-60">días</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Nutrition Toggle */}
                                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-500/5 to-transparent rounded-3xl border border-orange-500/10 hover:border-orange-500/20 transition-all group cursor-pointer"
                                    onClick={() => setIncludeNutrition(!includeNutrition)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl transition-all ${includeNutrition ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-500'
                                            }`}>
                                            <Utensils size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">Plan Nutricional</p>
                                            <p className="text-xs text-gray-500">Incluir recomendaciones de comidas</p>
                                        </div>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-colors ${includeNutrition ? 'bg-orange-600' : 'bg-white/10'
                                        }`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${includeNutrition ? 'left-7' : 'left-1'
                                            }`} />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !goal.trim()}
                                    className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-[2rem] font-black text-lg transition-all shadow-2xl shadow-orange-900/40 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            ¡GENERAR AHORA!
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
