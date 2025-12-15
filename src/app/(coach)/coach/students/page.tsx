'use client';

import React from 'react';
import StudentsGrid from '@/components/features/coach/StudentsGrid';

export default function CoachStudentsPage() {
    return (
        <div className="space-y-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-2 tracking-tight">
                        Mis Alumnos
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                        Gestiona el progreso y rutinas de tus atletas de elite.
                    </p>
                </div>

                <div className="flex gap-2">
                    <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-xl text-orange-500 font-bold text-sm">
                        32 Activos
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-blue-500 font-bold text-sm">
                        5 Nuevos
                    </div>
                </div>
            </div>

            <StudentsGrid />
        </div>
    );
}
