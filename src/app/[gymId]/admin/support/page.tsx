'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Building2,
    Send,
    Filter,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SupportTicket {
    id: string;
    asunto: string;
    prioridad: string;
    estado: string;
    creado_en: string;
    actualizado_en: string;
    perfiles: { nombre_completo: string };
    gimnasios: { nombre: string };
}

interface Message {
    id: string;
    mensaje: string;
    es_del_staff_saas: boolean;
    creado_en: string;
    perfiles: { nombre_completo: string, rol: string };
}

export default function SuperAdminSupportPage() {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const res = await fetch('/api/saas/support');
            const data = await res.json();
            if (res.ok) setTickets(data.tickets || []);
        } catch (_error) {
            toast.error('Error al cargar tickets');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (ticketId: string) => {
        try {
            const res = await fetch(`/api/saas/support/${ticketId}/messages`);
            const data = await res.json();
            if (res.ok) setMessages(data.messages || []);
        } catch (_error) {
            toast.error('Error al cargar mensajes');
        }
    };

    const handleSelectTicket = (ticket: SupportTicket) => {
        setSelectedTicket(ticket);
        fetchMessages(ticket.id);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;

        setSending(true);
        try {
            const res = await fetch(`/api/saas/support/${selectedTicket.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: newMessage })
            });
            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedTicket.id);
            }
        } catch (_error) {
            toast.error('Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6 p-4 md:p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                    🎫 Soporte Multi-Tenant
                </h1>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Tickets List */}
                <div className={`w-full lg:w-96 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bandeja de Entrada</span>
                        <Filter size={16} className="text-gray-500" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl" />)}
                            </div>
                        ) : tickets.length === 0 ? (
                            <p className="text-center text-gray-600 italic py-10">No hay tickets pendientes.</p>
                        ) : tickets.map((ticket) => (
                            <button
                                key={ticket.id}
                                onClick={() => handleSelectTicket(ticket)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTicket?.id === ticket.id
                                    ? 'bg-red-600 border-red-500 shadow-lg shadow-red-900/20'
                                    : 'bg-white/2 border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-black uppercase italic tracking-tight truncate flex-1">
                                        {ticket.asunto}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full mt-1 ml-2 ${ticket.estado === 'abierto' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                </div>
                                <div className="flex justify-between text-[10px] items-center">
                                    <span className={selectedTicket?.id === ticket.id ? 'text-red-100' : 'text-gray-500'}>
                                        {ticket.gimnasios.nombre}
                                    </span>
                                    <span className={selectedTicket?.id === ticket.id ? 'text-red-200' : 'text-gray-600'}>
                                        {new Date(ticket.creado_en).toLocaleDateString()}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 bg-[#1c1c1e] rounded-[2.5rem] border border-white/5 flex flex-col overflow-hidden ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
                    {selectedTicket ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-6 bg-black/20 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-2 hover:bg-white/10 rounded-full text-gray-400">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center text-red-500">
                                        <Building2 size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{selectedTicket.asunto}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedTicket.gimnasios.nombre} • {selectedTicket.perfiles.nombre_completo}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Prioridad: {selectedTicket.prioridad}
                                    </span>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.es_del_staff_saas ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${msg.es_del_staff_saas ? 'bg-red-600 text-white rounded-l-3xl rounded-tr-3xl' : 'bg-white/5 text-gray-200 rounded-r-3xl rounded-tl-3xl'} p-4 shadow-xl`}>
                                            <p className="text-sm leading-relaxed">{msg.mensaje}</p>
                                            <div className="flex justify-between items-center mt-2 opacity-60">
                                                <span className="text-[9px] font-black uppercase tracking-widest">{msg.perfiles.nombre_completo}</span>
                                                <span className="text-[9px]">{new Date(msg.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="p-6 bg-black/20 border-t border-white/5 flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Escribe tu respuesta como STAFF..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <Send size={24} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-gray-700 mb-6">
                                <MessageSquare size={40} />
                            </div>
                            <h3 className="text-xl font-black text-gray-500 italic uppercase">Selecciona un ticket</h3>
                            <p className="text-gray-600 text-sm mt-2 max-w-xs">
                                Revisa y responde a las consultas de los administradores de gimnasios.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
