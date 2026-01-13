import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

export const createClient = () => {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ) as any;
};

// Singleton instance for client-side usage
export const supabase = createClient();

// Helper to get the current user
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

// Helper to get user profile
export const getUserProfile = async (userId: string): Promise<Database['public']['Tables']['perfiles']['Row'] | null> => {
    const { data, error } = await supabase
        .from('perfiles')
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

