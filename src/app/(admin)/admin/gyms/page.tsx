'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Building2,
    Plus,
    MapPin,
    Users,
    ChevronRight,
    Settings,
    MoreVertical,
    CheckCircle2,
    XCircle
} from 'lucide-react';

interface Sucursal {
    id: string;
    nombre: string;
    direccion: string;
    creado_en: string;
}

interface Gimnasio {
    id: string;
    nombre: string;
    slug: string;
    logo_url: string;
    es_activo: boolean;
    sucursales: Sucursal[];
    creado_en: string;
}

export default function GymsManagementPage() {
    const [gyms, setGyms] = useState<Gimnasio[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGyms();
    }, []);

    const fetchGyms = async () => {
        try {
            const res = await fetch('/api/admin/gyms/list');
            const data = await res.json();
            if (res.ok) {
                setGyms(data.gyms || []);
            } else {
                toast.error(data.error || 'Error al cargar gimnasios');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 p-4 md:p-8">
            {/* Header section with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-red-500">
                        🏢 Gestión de Red (SaaS)
                    </h1>
                    <p className="text-gray-400 mt-2 font-medium">
                        Administra múltiples gimnasios y sucursales desde un solo lugar.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toast.success('Módulo de creación en desarrollo para V2')}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                >
                    <Plus size={20} />
                    Sumar Nuevo Gimnasio
                </motion.button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Gimnasios</p>
                        <p className="text-2xl font-black text-white">{gyms.length}</p>
                    </div>
                </div>
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sucursales Activas</p>
                        <p className="text-2xl font-black text-white">
                            {gyms.reduce((acc, g) => acc + (g.sucursales?.length || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-[#1c1c1e] p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Status del Sistema</p>
                        <p className="text-2xl font-black text-white">Saludable</p>
                    </div>
                </div>
            </div>

            {/* Gyms List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                        <p className="text-gray-500 animate-pulse font-bold text-xs uppercase tracking-widest">Escaneando red de gimnasios...</p>
                    </div>
                ) : gyms.length === 0 ? (
                    <div className="bg-[#1c1c1e] rounded-[3rem] p-20 border border-dashed border-white/10 text-center">
                        <p className="text-gray-500">No hay gimnasios registrados en el sistema global.</p>
                    </div>
                ) : (
                    gyms.map((gym, idx) => (
                        <motion.div
                            key={gym.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 overflow-hidden group hover:border-red-500/30 transition-all duration-500"
                        >
                            <div className="p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                {/* Gym Logo/Icon */}
                                <div className="w-20 h-20 bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] rounded-[2rem] border border-white/10 flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-6 transition-transform">
                                    {gym.logo_url ? (
                                        <img src={gym.logo_url} alt={gym.nombre} className="w-12 h-12 object-contain" />
                                    ) : (
                                        "🏢"
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{gym.nombre}</h2>
                                        {gym.es_activo ? (
                                            <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Activo
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <XCircle size={10} /> Inactivo
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 font-mono text-xs">SLUG: {gym.slug} | ID: {gym.id}</p>

                                    {/* Sucursales Mini-List */}
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {gym.sucursales?.map(s => (
                                            <div key={s.id} className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs text-gray-400 flex items-center gap-2 hover:bg-white/10 transition-colors pointer-events-none">
                                                <MapPin size={12} className="text-red-500" /> {s.nombre}
                                            </div>
                                        ))}
                                        <button className="px-3 py-2 rounded-xl border border-dashed border-white/10 text-[10px] font-bold text-gray-500 hover:border-red-500/50 hover:text-red-400 transition-all">
                                            + Agregar Sucursal
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-3 w-full lg:w-auto">
                                    <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95">
                                        Configuración Global
                                    </button>
                                    <button className="px-8 py-3 bg-white/5 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all">
                                        Ver Estadísticas
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pro Tips / SaaS Logic */}
            <div className="mt-12 p-8 bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 rounded-[3rem]">
                <h3 className="text-xl font-bold text-white mb-2 italic">Vision SaaS 360°</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Como Superadmin, tenés el "Master Key" del sistema. Cada gimnasio que sumes es un entorno aislado
                    donde el Admin de ese gimnasio solo podrá ver a sus profesores y alumnos.
                    <br /><br />
                    En la siguiente actualización, podrás gestionar los planes de suscripción de cada gimnasio y
                    personalizar la App para cada marca (White Label).
                </p>
            </div>
        </div>
    );
}
