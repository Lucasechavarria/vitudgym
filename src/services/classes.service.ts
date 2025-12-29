import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/supabase';

type Class = Database['public']['Tables']['class_schedules']['Row'];
type ClassInsert = Database['public']['Tables']['class_schedules']['Insert'];
type ClassUpdate = Database['public']['Tables']['class_schedules']['Update'];
type ClassWithAvailability = Database['public']['Views']['classes_with_availability']['Row'];

/**
 * Service for managing classes
 */
export const classesService = {
    /**
     * Get all active classes with availability info
     */
    async getAllWithAvailability() {
        const { data, error } = await supabase
            .from('classes_with_availability')
            .select('*')
            .order('day_of_week')
            .order('start_time');

        if (error) throw error;
        return data as ClassWithAvailability[];
    },

    /**
     * Get classes by day of week
     */
    async getByDay(dayOfWeek: number) {
        const { data, error } = await supabase
            .from('classes_with_availability')
            .select('*')
            .eq('day_of_week', dayOfWeek)
            .order('start_time');

        if (error) throw error;
        return data as ClassWithAvailability[];
    },

    /**
     * Get classes by activity
     */
    async getByActivity(activityId: string) {
        const { data, error } = await supabase
            .from('classes_with_availability')
            .select('*')
            .eq('activity_id', activityId)
            .order('day_of_week')
            .order('start_time');

        if (error) throw error;
        return data as ClassWithAvailability[];
    },

    /**
     * Get classes by coach
     */
    async getByCoach(coachId: string) {
        const { data, error } = await supabase
            .from('class_schedules')
            .select(`
        *,
        activity:activities(*)
      `)
            .eq('coach_id', coachId)
            .eq('is_active', true)
            .order('day_of_week')
            .order('start_time');

        if (error) throw error;
        return data;
    },

    /**
     * Get class by ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('class_schedules')
            .select(`
        *,
        activity:activities(*),
        coach:profiles(id, full_name, avatar_url)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Create new class (coach/admin only)
     */
    async create(classData: ClassInsert) {
        const { data, error } = await (supabase
            .from('class_schedules') as any)
            .insert(classData)
            .select()
            .single();

        if (error) throw error;
        return data as Class;
    },

    /**
     * Update class (coach/admin only)
     */
    async update(id: string, updates: ClassUpdate) {
        const { data, error } = await (supabase
            .from('class_schedules') as any)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Class;
    },

    /**
     * Delete class (admin only)
     */
    async delete(id: string) {
        const { error } = await (supabase
            .from('class_schedules') as any)
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * Check if class has available spots
     */
    async hasAvailableSpots(classId: string) {
        const { data, error } = await supabase
            .from('class_schedules')
            .select('max_capacity, current_capacity')
            .eq('id', classId)
            .single() as { data: any; error: any };

        if (error) throw error;
        if (!data) throw new Error('Class not found');
        return data.current_capacity < data.max_capacity;
    },
};
