'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket,
    Search,
    Filter,
    ChevronLeft,
    Clock,
    User,
    Building2,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface TicketSaaS {
    id: string;
    asunto: string;
    descripcion: string;
    prioridad: 'baja' | 'media' | 'alta' | 'critica';
    estado: 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';
    categoria: string;
    creado_en: string;
    gimnasio: { nombre: string; logo_url: string | null };
    perfil: { nombre_completo: string; correo: string; url_avatar: string | null };
}

export default function SaaSSupportPage() {
    const [tickets, setTickets] = useState<TicketSaaS[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todo');
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/admin/tickets');
            const data = await res.json();
            if (res.ok) {
                setTickets(data.tickets);
            }
        } catch (error) {
            toast.error('Error al cargar tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/tickets/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: newStatus })
            });

            if (res.ok) {
                toast.success('Ticket actualizado');
                fetchTickets();
            }
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.gimnasio.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'todo' || t.estado === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group"
                    >
                        <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-600/20 rounded-2xl flex items-center justify-center text-orange-500 border border-orange-500/20">
                            <Ticket size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                                Centro de <span className="text-orange-500">Soporte</span>
                            </h1>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Gestión de Incidencias SaaS</p>
                        </div>
                    </div>
                </div>

                <div className="flex bg-[#1c1c1e] p-1.5 rounded-2xl border border-white/5">
                    {['todo', 'abierto', 'en_progreso', 'resuelto'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="bg-[#1c1c1e] border border-dashed border-white/5 rounded-[3rem] py-32 flex flex-col items-center justify-center">
                        <Ticket size={48} className="text-gray-800 mb-6" />
                        <h3 className="text-xl font-black text-gray-700 italic uppercase">Bandeja de entrada vacía</h3>
                        <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-2">Todo el ecosistema está en calma</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket, i) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 group hover:border-orange-500/30 transition-all flex flex-col md:flex-row gap-6 items-center"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-black text-[10px] uppercase leading-none p-2 shrink-0 ${ticket.prioridad === 'critica' ? 'bg-red-600/20 text-red-500 border-red-500/30' :
                                    ticket.prioridad === 'alta' ? 'bg-orange-600/20 text-orange-500 border-orange-500/30' :
                                        'bg-blue-600/20 text-blue-500 border-blue-500/30'
                                }`}>
                                <Zap size={18} className="mb-1" />
                                <span>{ticket.prioridad}</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${ticket.estado === 'abierto' ? 'bg-emerald-500/20 text-emerald-500' :
                                            ticket.estado === 'en_progreso' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-gray-500/20 text-gray-500'
                                        }`}>
                                        {ticket.estado}
                                    </span>
                                    <h3 className="text-white font-black italic uppercase tracking-tight truncate">{ticket.asunto}</h3>
                                </div>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Building2 size={12} className="text-orange-500" />
                                    {ticket.gimnasio.nombre}
                                    <span className="opacity-20">•</span>
                                    <Clock size={12} />
                                    {new Date(ticket.creado_en).toLocaleString()}
                                </p>
                                <p className="text-gray-400 text-xs mt-3 line-clamp-1 opacity-70 italic">"{ticket.descripcion}"</p>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-black text-white uppercase">{ticket.perfil.nombre_completo}</p>
                                    <p className="text-[9px] font-bold text-gray-600">{ticket.perfil.correo}</p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(ticket.id, 'en_progreso')}
                                        className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                        title="Marcar en progreso"
                                    >
                                        <MessageSquare size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(ticket.id, 'resuelto')}
                                        className="p-3 bg-white/5 rounded-xl text-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                        title="Resolver"
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
