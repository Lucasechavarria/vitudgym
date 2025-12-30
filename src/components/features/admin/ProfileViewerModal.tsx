'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { SupabaseUserProfile } from '@/types/user';

interface ProfileViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: SupabaseUserProfile | null;
}

export default function ProfileViewerModal({ isOpen, onClose, user }: ProfileViewerModalProps) {
    if (!isOpen || !user) return null;

    // Helper to safely access JSON fields
    const medical = user.medical_info || {};
    const emergency = user.emergency_contact || {};

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#1c1c1e] w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl pointer-events-auto flex flex-col">
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center sticky top-0 bg-[#1c1c1e]/95 backdrop-blur-xl z-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                                            {user.name?.charAt(0) || user.full_name?.charAt(0) || 'U'}
                                        </span>
                                        {user.name || user.full_name || user.email}
                                    </h2>
                                    <p className="text-gray-400 text-sm mt-1 ml-14">Ficha Técnica Digital</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-8">
                                {/* Section 1: Personal Data */}
                                <section>
                                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                                        👤 Datos Personales
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">D.N.I</p>
                                            <p className="text-white font-medium">{user.dni || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Género</p>
                                            <p className="text-white font-medium capitalize">
                                                {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Femenino' : user.gender === 'other' ? 'Otro' : user.gender === 'prefer_not_to_say' ? 'Prefiero no decir' : '--'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Género</p>
                                            <p className="text-white font-medium capitalize">
                                                {user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Femenino' : user.gender === 'other' ? 'Otro' : 'Prefiero no decir'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Fecha Nacimiento</p>
                                            <p className="text-white font-medium">
                                                {user.date_of_birth || user.birth_date ? new Date(user.date_of_birth || user.birth_date).toLocaleDateString() : 'No registrada'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                                            <p className="text-white font-medium">{user.phone || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Email</p>
                                            <p className="text-white font-medium">{user.email}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs text-gray-500 uppercase">Dirección</p>
                                            <p className="text-white font-medium">
                                                {user.address} {user.city ? `(${user.city})` : ''}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2: Medical Data */}
                                <section>
                                    <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                                        🩺 Ficha Médica
                                    </h3>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-4">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Grupo Sanguíneo</p>
                                                <p className="text-white font-medium">{medical.blood_type || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Presión</p>
                                                <p className="text-white font-medium">{medical.blood_pressure || '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Peso</p>
                                                <p className="text-white font-medium">{medical.weight ? `${medical.weight}kg` : '--'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase">Fuma</p>
                                                <p className="text-white font-medium">{medical.is_smoker ? 'Sí' : 'No'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Lesiones</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.injuries || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Alergias</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.allergies || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Enfermedades Crónicas</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.chronic_diseases || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Patologías</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.pathologies || 'Ninguna declarada'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-400 mb-1">Antecedentes</p>
                                                <p className="text-white text-sm bg-white/5 p-2 rounded-lg">{medical.background || '--'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3: Emergency Contact */}
                                <section>
                                    <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2">
                                        🚑 Contacto de Emergencia
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Nombre</p>
                                            <p className="text-white font-medium">{emergency.full_name || '--'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Relación</p>
                                            <p className="text-white font-medium">{emergency.relationship || '--'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Teléfono</p>
                                            <a href={`tel:${emergency.phone}`} className="text-blue-400 hover:underline font-medium">
                                                {emergency.phone || '--'}
                                            </a>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase">Dirección</p>
                                            <p className="text-white font-medium">{emergency.address || '--'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Section 4: Legal */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-400 mb-4 flex items-center gap-2">
                                        📋 Deslinde Legal
                                    </h3>
                                    <div className={`p-4 rounded-xl border ${user.waiver_accepted ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} flex justify-between items-center`}>
                                        <div>
                                            <p className={`font-bold ${user.waiver_accepted ? 'text-green-400' : 'text-red-400'}`}>
                                                {user.waiver_accepted ? '✓ Deslinde Firmado y Aceptado' : '⚠ Pendiente de Firma'}
                                            </p>
                                            {user.waiver_accepted && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Firmado digitalmente el: {new Date(user.waiver_date).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>

                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/5 bg-[#1c1c1e] sticky bottom-0 rounded-b-3xl">
                                <button
                                    onClick={onClose}
                                    className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cerrar Ficha
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
