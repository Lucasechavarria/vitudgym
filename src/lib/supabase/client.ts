import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Helper to get the current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Helper to get user profile
export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) throw error;
    return data;
};

// Helper to check user role
export const checkUserRole = async (userId: string, allowedRoles: string[]) => {
    const profile = await getUserProfile(userId);
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
};

