'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Database } from '@/types/supabase';

type UserGoalInsert = Database['public']['Tables']['user_goals']['Insert'];

/**
 * Create a new user goal (Server Action)
 */
export async function createUserGoal(goalData: Omit<UserGoalInsert, 'user_id' | 'updated_at'>) {
    const supabase = await createClient();

    // Ensure the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error('User not authenticated');
    }

    // Set user_id from the session to ensure security (trust the session, not the client input for user_id)
    const dataToInsert = {
        ...goalData,
        user_id: user.id,
        updated_at: new Date().toISOString() // Ensure updated_at is set
    };

    // If active, deactivate others (logic from service)
    if (dataToInsert.is_active) {
        await supabase
            .from('user_goals')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true);
    }

    const { data, error } = await supabase
        .from('user_goals')
        .insert(dataToInsert)
        .select()
        .single();

    if (error) {
        console.error('Error creating goal:', error);
        throw new Error('Failed to create goal');
    }

    // Revalidate relevant paths if needed
    revalidatePath('/onboarding');
    revalidatePath('/dashboard');

    return data;
}
