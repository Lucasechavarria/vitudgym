'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Building2,
    Plus,
    MapPin,
    Users,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import Image from 'next/image';

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
    const [creating, setCreating] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        slug: '',
        sucursal_nombre: 'Casa Central',
        direccion: '',
        logo_url: ''
    });

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
        } catch (_error) {
            console.error(_error);
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch('/api/admin/gyms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('¡Gimnasio creado con éxito!');
                setShowCreateModal(false);
                setFormData({ nombre: '', slug: '', sucursal_nombre: 'Casa Central', direccion: '', logo_url: '' });
                fetchGyms();
            } else {
                toast.error(data.error || 'Error al crear');
            }
        } catch (_error) {
            toast.error('Error de red');
        } finally {
            setCreating(false);
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
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all"
                >
                    <Plus size={20} />
                    Sumar Nuevo Gimnasio
                </motion.button>
            </div>

            {/* Modal de Creación */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1c1c1e] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 relative z-10 shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-white italic mb-6 uppercase tracking-tight">Nueva Entidad Gym</h2>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nombre Comercial</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: PowerBox S.A."
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none transition-all"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Identificador (Slug)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="ej: powerbox"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none transition-all font-mono text-sm"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nombre Sede Inicial</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none transition-all"
                                        value={formData.sucursal_nombre}
                                        onChange={e => setFormData({ ...formData, sucursal_nombre: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Dirección</label>
                                    <input
                                        type="text"
                                        placeholder="Calle 123, Ciudad"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-red-500 outline-none transition-all"
                                        value={formData.direccion}
                                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={creating}
                                        className="flex-1 px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-900/40 disabled:opacity-50 transition-all border border-red-500/20"
                                    >
                                        {creating ? 'Creando...' : 'Confirmar Registro'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                <div className="w-20 h-20 bg-gradient-to-br from-[#2c2c2e] to-[#1c1c1e] rounded-[2rem] border border-white/10 flex items-center justify-center text-3xl shadow-2xl group-hover:rotate-6 transition-transform relative overflow-hidden">
                                    {gym.logo_url ? (
                                        <Image src={gym.logo_url} alt={gym.nombre} fill className="object-contain p-4" />
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
