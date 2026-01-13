'use client';

import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['perfiles']['Row'];

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            // Debugging auth state changes
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔐 Auth State Change: ${event}`, session?.user?.email);
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return {
        user,
        profile,
        session,
        loading,
        signOut,
        isAuthenticated: !!user,
        isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
        isCoach: profile?.role === 'coach' || profile?.role === 'admin' || profile?.role === 'superadmin',
    };
}
