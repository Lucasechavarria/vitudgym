import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'react-hot-toast';

export type Message = {
    id: string;
    contenido: string;
    remitente_id: string;
    receptor_id: string;
    creado_en: string;
    esta_leido: boolean;
};

export function useChat(conversacionId: string | null) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        if (!conversacionId) return;

        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('mensajes')
                .select('*')
                .eq('conversacion_id', conversacionId)
                .order('creado_en', { ascending: true });

            if (error) {
                toast.error('Error al cargar mensajes');
                console.error(error);
            } else {
                setMessages(data as Message[]);
            }
            setLoading(false);
        };

        fetchMessages();

        // Realtime subscription
        const channel = supabase
            .channel(`chat:${conversacionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'mensajes',
                    filter: `conversacion_id=eq.${conversacionId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversacionId, supabase]);

    const sendMessage = async (content: string, userId: string, receiverId: string) => {
        if (!content.trim() || !conversacionId) return;

        const { error } = await supabase.from('mensajes').insert({
            contenido: content,
            conversacion_id: conversacionId,
            remitente_id: userId,
            receptor_id: receiverId,
        });

        if (error) {
            toast.error('Error al enviar mensaje');
            console.error(error);
            return false;
        }
        return true;
    };

    return { messages, loading, sendMessage };
}
