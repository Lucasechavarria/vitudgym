'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

import { ChatParticipant, ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
    currentUser: ChatParticipant;
    initialRecipientId?: string;
}

export default function ChatInterface({ currentUser, initialRecipientId }: ChatInterfaceProps) {
    // const [supabase] = useState(() => createClientComponentClient()); // Removed
    const [conversations, setConversations] = useState<ChatParticipant[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(initialRecipientId || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations (Users you have chattered with or potential contacts)
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                // Determine contacts based on role
                // If student -> can chat with assigned coach(es) or admins
                // If coach -> can chat with all students
                // For simplicity, we fetch all relevant profiles.
                // In production, optimize this query.

                let query = supabase.from('profiles').select('id, full_name, avatar_url, role');

                if (currentUser.role === 'member') {
                    query = query.in('role', ['coach', 'admin']);
                } else if (currentUser.role === 'coach') {
                    query = query.in('role', ['member']);
                }

                const { data, error } = await query;
                if (!error && data) {
                    setConversations(data);
                }
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        if (currentUser) fetchContacts();
    }, [currentUser]);


    // 2. Fetch Messages for Selected Recipient & Subscribe
    useEffect(() => {
        if (!selectedRecipient || !currentUser) return;

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedRecipient}),and(sender_id.eq.${selectedRecipient},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data);
            }
        };

        fetchMessages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('chat_messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUser.id}`, // Listen for incoming
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    if (newMessage.sender_id === selectedRecipient) {
                        setMessages((current) => [...current, newMessage]);
                    } else {
                        // Optional: Show notification dot for other conversations
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedRecipient, currentUser]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRecipient) return;

        const msgContent = newMessage.trim();
        setNewMessage('');

        // Optimistic update
        const tempId = Math.random().toString();
        const optimisticMsg = {
            id: tempId,
            sender_id: currentUser.id,
            receiver_id: selectedRecipient,
            content: msgContent,
            created_at: new Date().toISOString(),
            is_pending: true
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const { data, error } = await (supabase
            .from('messages') as any)
            .insert({
                sender_id: currentUser.id,
                receiver_id: selectedRecipient,
                content: msgContent
            })
            .select()
            .single();

        if (error) {
            console.error('Error sending message:', error);
            // Rollback or show error
            setMessages((prev) => prev.filter(m => m.id !== tempId));
        } else {
            // Replace optimistic with real
            setMessages((prev) => prev.map(m => m.id === tempId ? (data as ChatMessage) : m));
        }
    };

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-[#1c1c1e]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            {/* Sidebar (Contacts) */}
            <div className={`w-80 border-r border-white/10 flex flex-col ${selectedRecipient ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">Mensajes</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {conversations.map((contact) => (
                        <button
                            key={contact.id}
                            onClick={() => setSelectedRecipient(contact.id)}
                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${selectedRecipient === contact.id ? 'bg-orange-500/20 border border-orange-500/50' : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold relative overflow-hidden shrink-0">
                                {contact.avatar_url ? (
                                    <Image
                                        src={contact.avatar_url}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="40px"
                                    />
                                ) : (
                                    contact.full_name?.charAt(0)
                                )}
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-white text-sm">{contact.full_name}</p>
                                <p className="text-xs text-gray-400 capitalize">{contact.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedRecipient ? 'hidden md:flex' : 'flex'}`}>
                {selectedRecipient ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-black/20">
                            <button onClick={() => setSelectedRecipient(null)} className="md:hidden text-gray-400 mr-2">←</button>
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                                {conversations.find(c => c.id === selectedRecipient)?.full_name?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-white">
                                {conversations.find(c => c.id === selectedRecipient)?.full_name}
                            </h3>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/10">
                            {messages.map((msg) => {
                                const isMe = msg.sender_id === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${isMe
                                            ? 'bg-orange-500 text-white rounded-tr-none'
                                            : 'bg-white/10 text-gray-200 rounded-tl-none'
                                            } ${msg.is_pending ? 'opacity-70' : ''}`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
                            >
                                ➤
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>Selecciona un contacto para chatear</p>
                    </div>
                )}
            </div>
        </div>
    );
}
