'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VisionPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);

    const startScan = () => {
        setIsScanning(true);
        setAnalysisResult(null);

        // Simulate analysis process
        setTimeout(() => {
            setIsScanning(false);
            setAnalysisResult({
                score: 87,
                tips: [
                    "Mantén la espalda recta",
                    "Rodillas ligeramente flexionadas",
                    "Mirada al frente"
                ],
                muscle_groups: ["Espalda Baja", "Cuádriceps"]
            });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        AI Posture Vision
                    </h1>
                    <p className="text-gray-400">Análisis biomecánico en tiempo real impulsado por IA.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Scanner Area */}
                    <div className="relative aspect-[3/4] bg-gray-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center group">

                        {/* Camera Placeholder / Feed */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />

                        {!isScanning && !analysisResult && (
                            <div className="z-20 text-center p-6">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 mx-auto border border-white/10"
                                >
                                    <span className="text-4xl">📷</span>
                                </motion.div>
                                <h3 className="text-xl font-bold mb-2">Listo para analizar</h3>
                                <p className="text-gray-400 text-sm mb-6">Asegúrate de tener buena iluminación y que todo tu cuerpo sea visible.</p>
                                <button
                                    onClick={startScan}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-full font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-105"
                                >
                                    Iniciar Escaneo
                                </button>
                            </div>
                        )}

                        {/* Formatting "Scanner" Overlay */}
                        <AnimatePresence>
                            {isScanning && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                                >
                                    {/* Scanning Line */}
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                    />

                                    <div className="text-center">
                                        <div className="text-blue-400 font-mono text-sm mb-2">ANALIZANDO VECTORES...</div>
                                        <div className="flex gap-1 justify-center">
                                            {[1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: [10, 30, 10] }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                    className="w-1 bg-blue-500 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* HUD Corners */}
                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-blue-500/50 rounded-tl-lg" />
                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-blue-500/50 rounded-tr-lg" />
                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-blue-500/50 rounded-bl-lg" />
                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-blue-500/50 rounded-br-lg" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Result Overlay (In Camera View) */}
                        {analysisResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md p-6 text-center"
                            >
                                <div className="w-24 h-24 rounded-full border-4 border-green-500 flex items-center justify-center mb-4 bg-green-500/10">
                                    <span className="text-3xl font-black text-green-400">{analysisResult.score}%</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">¡Buena Forma!</h3>
                                <button
                                    onClick={() => setAnalysisResult(null)}
                                    className="mt-6 text-sm text-gray-400 hover:text-white underline"
                                >
                                    Escanear Nuevo
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Results Panel */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-gray-400 uppercase text-xs font-bold mb-4">Métricas de Análisis</h3>

                            {analysisResult ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Estabilidad de Core</span>
                                            <span className="text-green-400 font-bold">Excelente</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div className="bg-green-500 h-full w-[90%]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Alineación de Espalda</span>
                                            <span className="text-yellow-400 font-bold">Mejorable</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div className="bg-yellow-500 h-full w-[75%]" />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5">
                                        <h4 className="font-bold text-blue-400 mb-2">Tips de Corrección:</h4>
                                        <ul className="space-y-2">
                                            {analysisResult.tips.map((tip: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 py-12">
                                    <span className="text-4xl mb-4 opacity-30">📊</span>
                                    <p>Realiza un escaneo para ver métricas detalladas.</p>
                                </div>
                            )}
                        </div>

                        {/* History / Recent Scans */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                            <h3 className="text-gray-400 uppercase text-xs font-bold mb-4">Historial Reciente</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center text-lg">🏋️</div>
                                        <div>
                                            <p className="font-bold text-sm">Sentadilla</p>
                                            <p className="text-xs text-gray-500">Ayer, 14:30</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-green-400">92%</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-lg">🏃</div>
                                        <div>
                                            <p className="font-bold text-sm">Deadlift</p>
                                            <p className="text-xs text-gray-500">20 Oct, 09:15</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-yellow-400">78%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
