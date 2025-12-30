'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    MessageSquare,
    User,
    Mail,
    Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Ticket {
    id: string;
    title: string;
    description: string;
    type: string;
    status: 'pending' | 'in_progress' | 'resolved';
    admin_response?: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

const STATUS_CONFIG = {
    pending: { label: 'Pendiente', color: 'orange', icon: <Clock size={16} /> },
    in_progress: { label: 'En Proceso', color: 'blue', icon: <AlertCircle size={16} /> },
    resolved: { label: 'Resuelto', color: 'green', icon: <CheckCircle2 size={16} /> },
};

export default function AdminTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [response, setResponse] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/admin/reports/tickets');
            if (!res.ok) throw new Error('Error al cargar tickets');
            const data = await res.json();
            setTickets(data);
        } catch (_error) {
            toast.error('Ocurrió un error al cargar los tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch('/api/admin/reports/tickets', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status: newStatus,
                    admin_response: response
                }),
            });

            if (!res.ok) throw new Error();

            toast.success('Ticket actualizado correctamente');
            setSelectedTicket(null);
            setResponse('');
            fetchTickets();
        } catch (_error) {
            toast.error('Error al actualizar el ticket');
        } finally {
            setUpdating(false);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesFilter = filter === 'all' || t.status === filter;
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Cargando incidencias...</div>;
    }

    return (
        <div className="p-8 space-y-8 min-h-screen bg-[#09090b]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button
                        onClick={() => router.push('/admin/reports')}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-sm mb-2 transition-colors"
                    >
                        <ChevronLeft size={16} /> Volver a Analytics
                    </button>
                    <h1 className="text-4xl font-black text-white">Gestión de Tickets</h1>
                    <p className="text-gray-400">Resuelve las dudas e incidencias de tus alumnos</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por título o alumno..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white text-sm focus:border-purple-500 transition-colors outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 p-1 bg-[#1c1c1e] w-fit rounded-xl border border-white/5">
                {['all', 'pending', 'in_progress', 'resolved'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {f === 'all' ? 'Todos' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG].label}
                    </button>
                ))}
            </div>

            {/* Tickets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredTickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={() => {
                                setSelectedTicket(ticket);
                                setResponse(ticket.admin_response || '');
                            }}
                            className="bg-[#1c1c1e] border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${ticket.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                        ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-green-500/20 text-green-400'}`}>
                                    {STATUS_CONFIG[ticket.status].icon}
                                    {STATUS_CONFIG[ticket.status].label}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                    {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                {ticket.title}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-4 h-10">
                                {ticket.description}
                            </p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold border border-purple-500/30">
                                        {ticket.profiles?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="text-xs">
                                        <p className="text-gray-300 font-medium">{ticket.profiles?.full_name}</p>
                                        <p className="text-gray-500">{ticket.type}</p>
                                    </div>
                                </div>
                                <MessageSquare size={16} className="text-gray-600 group-hover:text-purple-500 transition-colors" />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedTicket && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-[#1c1c1e] w-full max-w-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-start bg-gradient-to-r from-purple-900/10 to-transparent">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase
                                            ${selectedTicket.status === 'pending' ? 'bg-orange-500 text-white' :
                                                selectedTicket.status === 'in_progress' ? 'bg-blue-500 text-white' :
                                                    'bg-green-500 text-white'}`}>
                                            {STATUS_CONFIG[selectedTicket.status].label}
                                        </span>
                                        <span className="text-xs text-gray-500">#{selectedTicket.id.slice(0, 8)}</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white">{selectedTicket.title}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Alumno</label>
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-purple-500" />
                                            <span className="text-white text-sm font-medium">{selectedTicket.profiles.full_name}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">Contacto</label>
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-purple-500" />
                                            <span className="text-white text-sm font-medium">{selectedTicket.profiles.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Mensaje del Alumno</label>
                                    <div className="bg-white/5 p-5 rounded-2xl text-gray-300 text-sm leading-relaxed border border-white/5 italic">
                                        "{selectedTicket.description}"
                                    </div>
                                </div>

                                {/* Manage Status */}
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block">Respuesta de Administración</label>
                                    <textarea
                                        value={response}
                                        onChange={(e) => setResponse(e.target.value)}
                                        placeholder="Escribe la respuesta o resolución aquí..."
                                        className="w-full bg-[#09090b] border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:border-purple-500 outline-none transition-all h-32 resize-none"
                                    />

                                    <div className="flex gap-4">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                                                disabled={updating || selectedTicket.status === 'in_progress'}
                                                className="py-3 px-4 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                En Proceso
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                                                disabled={updating || selectedTicket.status === 'resolved'}
                                                className="py-3 px-4 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                                            >
                                                Resolver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {filteredTickets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600 space-y-4">
                    <div className="text-6xl">📥</div>
                    <p className="text-xl font-medium">No se encontraron tickets con los filtros actuales</p>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3a3a3c;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #48484a;
                }
            `}</style>
        </div>
    );
}
