'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import ChatInterface from '@/components/features/chat/ChatInterface';

export default function CoachMessagesPage() {
    const [user, setUser] = useState<any>(null);
    // const supabase = createClientComponentClient(); 

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUser(profile);
            }
        };
        getUser();
    }, [supabase]);

    if (!user) return <div className="p-8 text-white">Cargando chat...</div>;

    return (
        <div className="h-full">
            <h1 className="text-3xl font-black text-white mb-6">Mensajes de Alumnos</h1>
            <ChatInterface currentUser={user} />
        </div>
    );
}
