'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, Weight, Target } from 'lucide-react';
import { ItemVariants } from '@/types/student-components';

interface Stat {
    label: string;
    value: string;
    icon: string;
    trend: string;
    color: string;
}

interface StatsOverviewProps {
    stats: Stat[];
    itemVariants: ItemVariants;
}

export function StatsOverview({ stats, itemVariants }: StatsOverviewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="relative group h-full"
                >
                    <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 h-full shadow-2xl backdrop-blur-3xl overflow-hidden flex flex-col justify-between transition-colors hover:border-white/10">
                        {/* Background Highlight */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="p-4 bg-black/40 rounded-2xl border border-white/5 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{stat.icon}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                        <TrendingUp size={10} className="text-emerald-500" />
                                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.trend}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value.split(' ')[0]}</p>
                                    <p className="text-xs font-bold text-zinc-500 uppercase">{stat.value.split(' ')[1] || ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar Indicator */}
                        <div className={`mt-6 h-1 w-12 bg-gradient-to-r ${stat.color} rounded-full opacity-50 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
