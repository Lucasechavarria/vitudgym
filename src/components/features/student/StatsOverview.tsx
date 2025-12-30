'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Stat {
    label: string;
    value: string;
    icon: string;
    trend: string;
    color: string;
}

import { ItemVariants } from '@/types/student-components';

interface StatsOverviewProps {
    stats: Stat[];
    itemVariants: ItemVariants;
}

export function StatsOverview({ stats, itemVariants }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl border rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl cursor-default`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl bg-black/20 p-2 rounded-lg">{stat.icon}</span>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70 bg-black/20 px-2 py-1 rounded-full">{stat.trend}</span>
                    </div>
                    <div>
                        <p className="text-sm text-gray-300 font-medium mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
