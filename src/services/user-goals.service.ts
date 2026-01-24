import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type UserGoal = Database['public']['Tables']['objetivos_del_usuario']['Row'];
type UserGoalInsert = Database['public']['Tables']['objetivos_del_usuario']['Insert'];
type UserGoalUpdate = Database['public']['Tables']['objetivos_del_usuario']['Update'];

/**
 * Service for managing user fitness goals
 */
export const userGoalsService = {
    /**
     * Get user's active goal
     */
    async getActiveGoal(userId: string) {
        const supabase: any = await createClient();
        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .select('*')
            .eq('usuario_id', userId)
            .eq('esta_activo', true)
            .order('creado_en', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data as UserGoal | null;
    },

    /**
     * Get all goals for a user
     */
    async getUserGoals(userId: string) {
        const supabase: any = await createClient();
        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .select('*')
            .eq('usuario_id', userId)
            .order('creado_en', { ascending: false });

        if (error) throw error;
        return data as UserGoal[];
    },

    /**
     * Get goal by ID
     */
    async getById(id: string) {
        const supabase: any = await createClient();
        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
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
        const supabase: any = await createClient();

        // If this is set as active, deactivate other goals
        if (goal.esta_activo) {
            await this.deactivateUserGoals(goal.usuario_id!);
        }

        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .insert(goal as any)
            .select()
            .single();

        if (error) throw error;
        return data as UserGoal;
    },

    /**
     * Update goal
     */
    async update(id: string, updates: UserGoalUpdate) {
        const supabase: any = await createClient();

        // If setting as active, deactivate other goals first
        const updatesAny = updates as any;
        if (updatesAny.esta_activo) {
            const goal = await this.getById(id);
            await this.deactivateUserGoals(goal.usuario_id!);
        }

        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .update(updates as any)
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
        const supabase: any = await createClient();
        const { error } = await supabase
            .from('objetivos_del_usuario' as any)
            .update({ esta_activo: false } as any)
            .eq('usuario_id', userId)
            .eq('esta_activo', true);

        if (error) throw error;
    },

    /**
     * Delete goal
     */
    async delete(id: string) {
        const supabase: any = await createClient();
        const { error } = await supabase
            .from('objetivos_del_usuario' as any)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Add coach notes to goal
     */
    async addCoachNotes(id: string, notes: string) {
        return this.update(id, { notas_entrenador: notes } as any);
    },

    /**
     * Get goals by primary goal type (for analytics)
     */
    async getByPrimaryGoal(primaryGoal: string) {
        const supabase: any = await createClient();
        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .select('*')
            .eq('objetivo_principal', primaryGoal)
            .eq('esta_activo', true);

        if (error) throw error;
        return data as UserGoal[];
    },

    /**
     * Get goal statistics
     */
    async getStats() {
        const supabase: any = await createClient();

        // Optimización: Pedir solo campos mínimos
        const { data, error } = await supabase
            .from('objetivos_del_usuario' as any)
            .select('objetivo_principal, frecuencia_entrenamiento_por_semana, esta_activo') as any;

        if (error) throw error;

        const stats = {
            total: data.length,
            active: data.filter((g: any) => g.esta_activo).length,
            byPrimaryGoal: {} as Record<string, number>,
            avgFrequency: 0,
        };

        let totalFrequency = 0;
        let countWithFrequency = 0;

        data.forEach((goal: any) => {
            const goalAny = goal;
            stats.byPrimaryGoal[goalAny.objetivo_principal] = (stats.byPrimaryGoal[goalAny.objetivo_principal] || 0) + 1;

            if (goalAny.frecuencia_entrenamiento_por_semana) {
                totalFrequency += goalAny.frecuencia_entrenamiento_por_semana;
                countWithFrequency++;
            }
        });

        stats.avgFrequency = countWithFrequency > 0 ? totalFrequency / countWithFrequency : 0;

        return stats;
    },
};
