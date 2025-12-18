'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import ChatInterface from '@/components/features/chat/ChatInterface';

import Link from 'next/link';

export default function StudentMessagesPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUser(profile);
            }
        };
        getUser();
    }, []);

    if (!user) return <div className="p-8 text-white">Cargando chat...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-3xl font-black text-white">Mensajes con tu Coach</h1>
            </div>

            <div className="flex-1 min-h-0">
                <ChatInterface currentUser={user} />
            </div>
        </div>
    );
}
