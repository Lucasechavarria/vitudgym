'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

interface Message {
    id: string;
    remitente_id: string;
    receptor_id: string;
    contenido: string;
    creado_en: string;
}

interface QuickMessagesProps {
    itemVariants: any;
}

export function QuickMessages({ itemVariants }: QuickMessagesProps) {
    const [latestMessage, setLatestMessage] = useState<Message | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // Fetch latest message
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .or(`remitente_id.eq.${user.id},receptor_id.eq.${user.id}`)
                .order('creado_en', { ascending: false })
                .limit(1)
                .single();

            if (!error && data) {
                setLatestMessage(data);
            }
            setLoading(false);

            // Subscribe to real-time updates
            const channel = supabase
                .channel('dashboard_latest_message')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'mensajes',
                        filter: `receptor_id=eq.${user.id}`,
                    },
                    (payload) => {
                        setLatestMessage(payload.new as Message);
                        toast('Nuevo mensaje recibido', { icon: '💬' });
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        init();
    }, []);

    if (loading) {
        return (
            <div className="animate-pulse bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-48" />
        );
    }

    return (
        <motion.div variants={itemVariants} className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Mensajes</h3>
                <Link href="/dashboard/messages" className="text-xs text-blue-400 hover:text-blue-300">Ver todo</Link>
            </div>

            <AnimatePresence mode="wait">
                {latestMessage ? (
                    <motion.div
                        key={latestMessage.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-black/20 rounded-2xl p-4 mb-4 border border-white/5"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-lg">
                                {latestMessage.remitente_id === userId ? 'Yo' : 'C'}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">
                                    {latestMessage.remitente_id === userId ? 'Tu último mensaje' : 'Tu Coach'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                    {latestMessage.contenido}
                                </p>
                                <p className="text-[10px] text-gray-600 mt-1">
                                    {latestMessage.creado_en ? new Date(latestMessage.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="bg-black/20 rounded-2xl p-6 mb-4 border border-white/5 text-center">
                        <p className="text-gray-500 text-sm">No hay mensajes recientes</p>
                    </div>
                )}
            </AnimatePresence>

            <Link
                href="/dashboard/messages"
                className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all group"
            >
                <span>Ir al Chat</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
        </motion.div>
    );
}
