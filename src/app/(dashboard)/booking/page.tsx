'use client';

import React from 'react';
import { motion } from 'framer-motion';

const mockClasses = [
    { id: 1, name: 'CrossFit WOD', time: '06:00', coach: 'Pablo', spots: 3, total: 15 },
    { id: 2, name: 'Yoga Flow', time: '08:00', coach: 'María', spots: 8, total: 12 },
    { id: 3, name: 'Funcional', time: '18:00', coach: 'Carlos', spots: 0, total: 20 },
    { id: 4, name: 'Boxing', time: '19:30', coach: 'Ana', spots: 5, total: 10 },
];

export default function BookingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6">
            <motion.div
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Header */}
                <motion.header
                    className="mb-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl font-black mb-2">Reservá tu Clase</h1>
                    <p className="text-gray-400">Elegí tu horario y asegurá tu lugar</p>
                </motion.header>

                {/* Day Selector */}
                <motion.div
                    className="flex gap-3 mb-8 overflow-x-auto pb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {['Hoy', 'Mañana', 'Miércoles', 'Jueves', 'Viernes'].map((day, idx) => (
                        <motion.button
                            key={day}
                            className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap ${idx === 1
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                    : 'bg-[#1c1c1e] text-gray-400 border border-[#3a3a3c]'
                                }`}
                            whileHover={{ scale: 1.05, borderColor: '#FF5722' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {day}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Classes Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {mockClasses.map((clase) => (
                        <motion.div
                            key={clase.id}
                            className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl p-6 relative overflow-hidden group"
                            variants={cardVariants}
                            whileHover={{ scale: 1.03, borderColor: '#FF5722' }}
                        >
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-orange-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity"
                            />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold mb-1">{clase.name}</h3>
                                        <p className="text-sm text-gray-400">Coach {clase.coach}</p>
                                    </div>
                                    <motion.div
                                        className="text-3xl font-black text-orange-500"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        {clase.time}
                                    </motion.div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            className={`w-3 h-3 rounded-full ${clase.spots > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <span className="text-sm text-gray-400">
                                            {clase.spots > 0 ? `${clase.spots} lugares` : 'Lista de espera'}
                                        </span>
                                    </div>

                                    <motion.button
                                        className={`px-6 py-2 rounded-xl font-bold ${clase.spots > 0
                                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                                : 'bg-gray-700 text-gray-400'
                                            }`}
                                        whileHover={{ scale: clase.spots > 0 ? 1.1 : 1 }}
                                        whileTap={{ scale: clase.spots > 0 ? 0.95 : 1 }}
                                        disabled={clase.spots === 0}
                                    >
                                        {clase.spots > 0 ? 'Reservar' : 'Lleno'}
                                    </motion.button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#3a3a3c]">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Capacidad</span>
                                        <span>{clase.total - clase.spots}/{clase.total}</span>
                                    </div>
                                    <motion.div
                                        className="w-full bg-[#2c2c2e] rounded-full h-2 mt-2 overflow-hidden"
                                    >
                                        <motion.div
                                            className="bg-gradient-to-r from-orange-600 to-red-600 h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((clase.total - clase.spots) / clase.total) * 100}%` }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        </div>
    );
}
