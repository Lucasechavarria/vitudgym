'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StudentActionProps {
    icon: string;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export function StudentAction({ icon, label, onClick, variant = 'secondary' }: StudentActionProps) {
    const getColors = () => {
        switch (variant) {
            case 'primary': return 'bg-orange-500/20 text-orange-500 border-orange-500/50 hover:bg-orange-500 hover:text-white';
            case 'danger': return 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500 hover:text-white';
            default: return 'bg-white/10 text-gray-300 border-white/10 hover:bg-white/20 hover:text-white';
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-300 ${getColors()}`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </motion.button>
    );
}
