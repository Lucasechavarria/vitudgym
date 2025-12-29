'use client';

import React from 'react';

export default function GamificationCard() {
    const points = 1250;
    const nextLevel = 2000;
    const progress = (points / nextLevel) * 100;
    const streak = 12;

    return (
        <div className="bg-gradient-to-br from-[#1c1c1e] to-black border border-[#3a3a3c] rounded-2xl p-6 shadow-xl relative overflow-hidden group h-full flex flex-col justify-between">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-all"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-gray-400 font-medium text-sm uppercase tracking-wider">Tu Nivel</h3>
                    <p className="text-3xl font-black text-white mt-1">ATLETA PRO</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-5xl font-bold text-orange-500">{streak}🔥</span>
                    <span className="text-xs text-gray-500 uppercase font-bold mt-1">Días de Racha</span>
                </div>
            </div>

            <div className="relative z-10">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white font-bold">{points} XP</span>
                    <span className="text-gray-500">Próximo: {nextLevel} XP</span>
                </div>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                    ¡Estás a {nextLevel - points} XP de convertirte en TITÁN!
                </p>
            </div>
        </div>
    );
}
