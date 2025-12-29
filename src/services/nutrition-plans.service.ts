import { createClient } from '@/lib/supabase/server';

import { Database } from '@/types/supabase';

type NutritionPlan = Database['public']['Tables']['nutrition_plans']['Row'];
type NutritionPlanInsert = Database['public']['Tables']['nutrition_plans']['Insert'];
type NutritionPlanUpdate = Database['public']['Tables']['nutrition_plans']['Update'];

/**
 * Service for managing nutrition plans
 */
export const nutritionPlansService = {
    /**
     * Get user's active nutrition plan
     */
    async getActiveForUser(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('nutrition_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as NutritionPlan | null;
    },

    /**
     * Get all nutrition plans for a user
     */
    async getUserPlans(userId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('nutrition_plans')
            .select(`
                *,
                coach:coach_id(id, full_name, avatar_url)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Get nutrition plan by ID
     */
    async getById(id: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('nutrition_plans')
            .select(`
                *,
                user:user_id(id, full_name, email),
                coach:coach_id(id, full_name, email)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Get nutrition plan by routine ID
     */
    async getByRoutineId(routineId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('nutrition_plans')
            .select('*')
            .eq('routine_id', routineId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data as NutritionPlan | null;
    },

    /**
     * Create nutrition plan
     */
    async create(plan: NutritionPlanInsert) {
        const supabase = await createClient();

        // If this is set as active, deactivate other plans for the user
        if (plan.is_active) {
            await this.deactivateUserPlans(plan.user_id!);
        }

        const { data, error } = await supabase
            .from('nutrition_plans')
            .insert(plan)
            .select()
            .single();

        if (error) throw error;
        return data as NutritionPlan;
    },

    /**
     * Update nutrition plan
     */
    async update(id: string, updates: NutritionPlanUpdate) {
        const supabase = await createClient();

        // If setting as active, deactivate other plans first
        if (updates.is_active) {
            const plan = await this.getById(id);
            await this.deactivateUserPlans(plan.user_id);
        }

        const { data, error } = await supabase
            .from('nutrition_plans')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as NutritionPlan;
    },

    /**
     * Deactivate all nutrition plans for a user
     */
    async deactivateUserPlans(userId: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('nutrition_plans')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

        if (error) throw error;
    },

    /**
     * Delete nutrition plan
     */
    async delete(id: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('nutrition_plans')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Get plans created by coach
     */
    async getByCoach(coachId: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('nutrition_plans')
            .select(`
                *,
                user:user_id(id, full_name, email)
            `)
            .eq('coach_id', coachId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * Update meals
     */
    async updateMeals(id: string, meals: Database['public']['Tables']['nutrition_plans']['Update']['meals']) {
        return this.update(id, { meals });
    },

    /**
     * Update supplements
     */
    async updateSupplements(id: string, supplements: Database['public']['Tables']['nutrition_plans']['Update']['supplements']) {
        return this.update(id, { supplements });
    },

    /**
     * Update macros
     */
    async updateMacros(id: string, macros: {
        daily_calories?: number;
        protein_grams?: number;
        carbs_grams?: number;
        fats_grams?: number;
    }) {
        return this.update(id, macros);
    },
};
