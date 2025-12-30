'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function LoadingSpinner() {
    return (
        <div className="fixed inset-0 bg-[#1c1c1e] z-50 flex flex-col items-center justify-center">
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-32 h-32 md:w-48 md:h-48"
            >
                <Image
                    src="/logos/Logo-Fondo-Negro.png"
                    alt="Cargando..."
                    fill
                    className="object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                    priority
                />
            </motion.div>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-white/50 text-sm font-medium tracking-widest uppercase"
            >
                Cargando Experiencia...
            </motion.p>
        </div>
    );
}
