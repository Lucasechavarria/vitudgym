import { createClient } from '@/lib/supabase/server';

import { Database } from '@/types/supabase';

type GymEquipment = Database['public']['Tables']['gym_equipment']['Row'];
type GymEquipmentInsert = Database['public']['Tables']['gym_equipment']['Insert'];
type GymEquipmentUpdate = Database['public']['Tables']['gym_equipment']['Update'];

/**
 * Service for managing gym equipment inventory
 */
export const gymEquipmentService = {
    /**
     * Get all gym equipment
     */
    async getAll(filters?: {
        category?: string;
        isAvailable?: boolean;
        search?: string;
    }) {
        const supabase = await createClient();
        let query = supabase
            .from('gym_equipment')
            .select('*')
            .order('name');

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }

        if (filters?.isAvailable !== undefined) {
            query = query.eq('is_available', filters.isAvailable);
        }

        if (filters?.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as GymEquipment[];
    },

    /**
     * Get equipment by ID
     */
    async getById(id: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as GymEquipment;
    },

    /**
     * Get equipment by category
     */
    async getByCategory(category: string) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .select('*')
            .eq('category', category)
            .eq('is_available', true)
            .order('name');

        if (error) throw error;
        return data as GymEquipment[];
    },

    /**
     * Get available equipment (for routine generation)
     */
    async getAvailable() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .select('*')
            .eq('is_available', true)
            .order('category', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;
        return data as GymEquipment[];
    },

    /**
     * Create new equipment
     */
    async create(equipment: GymEquipmentInsert) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .insert(equipment)
            .select()
            .single();

        if (error) throw error;
        return data as GymEquipment;
    },

    /**
     * Update equipment
     */
    async update(id: string, updates: GymEquipmentUpdate) {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as GymEquipment;
    },

    /**
     * Delete equipment
     */
    async delete(id: string) {
        const supabase = await createClient();
        const { error } = await supabase
            .from('gym_equipment')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Update equipment availability
     */
    async updateAvailability(id: string, isAvailable: boolean) {
        return this.update(id, { is_available: isAvailable });
    },

    /**
     * Update equipment condition
     */
    async updateCondition(id: string, condition: 'excellent' | 'good' | 'fair' | 'needs_repair') {
        return this.update(id, { condition });
    },

    /**
     * Get equipment statistics
     */
    async getStats() {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('gym_equipment')
            .select('category, is_available, condition');

        if (error) throw error;

        const stats = {
            total: data.length,
            available: data.filter(e => e.is_available).length,
            byCategory: {} as Record<string, number>,
            byCondition: {} as Record<string, number>,
        };

        data.forEach(equipment => {
            // Count by category
            stats.byCategory[equipment.category] = (stats.byCategory[equipment.category] || 0) + 1;

            // Count by condition
            if (equipment.condition) {
                stats.byCondition[equipment.condition] = (stats.byCondition[equipment.condition] || 0) + 1;
            }
        });

        return stats;
    },
};
