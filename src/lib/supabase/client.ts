import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Lazy initialization to avoid build-time errors
let supabaseInstance: SupabaseClient<Database> | null = null;

const getSupabaseClient = (): SupabaseClient<Database> => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('⚠️ Missing Supabase environment variables - running in stub mode');
        // Return a Proxy that throws meaningful errors when accessed
        return new Proxy({} as SupabaseClient<Database>, {
            get: (_target, prop) => {
                throw new Error(
                    `Supabase client not initialized. Attempted to access property '${String(prop)}'. ` +
                    `Please check valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.`
                );
            }
        });
    }

    supabaseInstance = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabaseInstance;
};

// Export as getter - call getSupabaseClient() to get the instance
export const supabase = getSupabaseClient();

// Helper to get the current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Helper to get user profile
export const getUserProfile = async (userId: string): Promise<Database['public']['Tables']['profiles']['Row'] | null> => {
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

