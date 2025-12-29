import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type UserGoal = Database['public']['Tables']['user_goals']['Row'];
type UserGoalInsert = Database['public']['Tables']['user_goals']['Insert'];
type UserGoalUpdate = Database['public']['Tables']['user_goals']['Update'];

/**
 * Service for managing user fitness goals
 */
export const userGoalsService = {
    /**
     * Get user's active goal
     */
    async getActiveGoal(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data as UserGoal | null;
    },

    /**
     * Get all goals for a user
     */
    async getUserGoals(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as UserGoal[];
    },

    /**
     * Get goal by ID
     */
    async getById(id: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as UserGoal;
    },

    /**
     * Create new goal
     */
    async create(goal: UserGoalInsert) {
        const supabase = await createClient();

        // If this is set as active, deactivate other goals
        if (goal.is_active) {
            await this.deactivateUserGoals(goal.user_id!);
        }

        const { data, error } = await supabase
            .from('user_goals')
            .insert(goal)
            .select()
            .single();

        if (error) throw error;
        return data as UserGoal;
    },

    /**
     * Update goal
     */
    async update(id: string, updates: UserGoalUpdate) {
        const supabase = await createClient();

        // If setting as active, deactivate other goals first
        if (updates.is_active) {
            const goal = await this.getById(id);
            await this.deactivateUserGoals(goal.user_id);
        }

        const { data, error } = await supabase
            .from('user_goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as UserGoal;
    },

    /**
     * Deactivate all goals for a user
     */
    async deactivateUserGoals(userId: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('user_goals')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
    },

    /**
     * Delete goal
     */
    async delete(id: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('user_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Add coach notes to goal
     */
    async addCoachNotes(id: string, notes: string) {
        return this.update(id, { coach_notes: notes });
    },

    /**
     * Get goals by primary goal type (for analytics)
     */
    async getByPrimaryGoal(primaryGoal: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_goals')
            .select('*')
            .eq('primary_goal', primaryGoal)
            .eq('is_active', true);

        if (error) throw error;
        return data as UserGoal[];
    },

    /**
     * Get goal statistics
     */
    async getStats() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('user_goals')
            .select('primary_goal, training_frequency_per_week, is_active');

        if (error) throw error;

        const stats = {
            total: data.length,
            active: data.filter(g => g.is_active).length,
            byPrimaryGoal: {} as Record<string, number>,
            avgFrequency: 0,
        };

        let totalFrequency = 0;
        let countWithFrequency = 0;

        data.forEach(goal => {
            // Count by primary goal
            stats.byPrimaryGoal[goal.primary_goal] = (stats.byPrimaryGoal[goal.primary_goal] || 0) + 1;

            // Calculate average frequency
            if (goal.training_frequency_per_week) {
                totalFrequency += goal.training_frequency_per_week;
                countWithFrequency++;
            }
        });

        stats.avgFrequency = countWithFrequency > 0 ? totalFrequency / countWithFrequency : 0;

        return stats;
    },
};
