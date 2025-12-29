import React from 'react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
    gender: string | null;
    itemVariants: any;
}

export function DashboardHeader({ gender, itemVariants }: DashboardHeaderProps) {
    const greeting = gender === 'female' ? 'Campeona' : gender === 'male' ? 'Campeón' : 'Campeón/a';

    return (
        <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            <div className="relative z-10">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
                    Hola, {greeting} 👋
                </h1>
                <p className="text-blue-100 text-sm sm:text-lg">
                    "La disciplina es el puente entre metas y logros." ¡Vamos por más!
                </p>
            </div>
        </motion.div>
    );
}
