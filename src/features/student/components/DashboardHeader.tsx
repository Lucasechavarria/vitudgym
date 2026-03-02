import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, MessageSquare, Bell } from 'lucide-react';
import { ItemVariants } from '@/types/student-components';
import Link from 'next/link';

interface DashboardHeaderProps {
    gender: string | null;
    itemVariants: ItemVariants;
}

export function DashboardHeader({ gender, itemVariants }: DashboardHeaderProps) {
    const greeting = gender === 'female' ? 'Campeona' : gender === 'male' ? 'Campeón' : 'Campeón/a';

    return (
        <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-[3rem] bg-zinc-900 border border-white/5 p-10 sm:p-12 shadow-2xl group"
        >
            {/* Brand Decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-600/20 to-zinc-500/10 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full ml-12 mb-8 opacity-50" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner group-hover:rotate-12 transition-transform">
                            <Zap size={20} className="text-orange-500 fill-orange-500" />
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Central Intelligence v2.0</span>
                    </div>

                    <div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white italic tracking-tighter uppercase leading-tight">
                            Status: <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">{greeting}</span>
                        </h1>
                        <p className="text-zinc-500 text-sm sm:text-lg font-medium max-w-xl italic mt-2 opacity-80 decoration-orange-500/30 underline underline-offset-8">
                            "La disciplina Virtud es el único camino hacia el dominio táctico de tu cuerpo."
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Link href="/dashboard/chat">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 bg-orange-500 text-black px-6 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/20 group/btn relative overflow-hidden"
                        >
                            <MessageSquare size={16} />
                            <span>Enlace Táctico</span>
                            <div className="ml-2 w-5 h-5 bg-black text-orange-500 rounded-full flex items-center justify-center text-[8px] border border-orange-500/50">3</div>
                        </motion.button>
                    </Link>

                    <div className="hidden lg:flex items-center gap-4 bg-black/40 px-6 py-4 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">Canal Seguro</p>
                            <p className="text-xs font-bold text-orange-400 uppercase mt-1">SISTEMA ONLINE</p>
                        </div>
                        <Activity className="text-orange-500 animate-pulse" size={24} />
                    </div>
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[2px] w-full animate-scanline pointer-events-none opacity-20" />
        </motion.div>
    );
}
