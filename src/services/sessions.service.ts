
import { createClient } from '@/lib/supabase/server';

export interface ExercisePerformance {
    exercise_id: string;
    actual_sets?: number;
    actual_reps?: string;
    actual_weight?: number;
    rest_time_seconds?: number;
    is_completed?: boolean;
    difficulty_rating?: number;
}

export class SessionsService {
    /**
     * Inicia una nueva sesión de entrenamiento
     */
    static async startSession(userId: string, routineId: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('sesiones_de_entrenamiento')
            .insert({
                user_id: userId,
                routine_id: routineId,
                status: 'active',
                start_time: new Date().toISOString()
            })
            .select()
            .single();

        return { session: data, error };
    }

    /**
     * Registra el rendimiento de un ejercicio específico en una sesión
     */
    static async logExercisePerformance(sessionId: string, performance: ExercisePerformance) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('registros_de_ejercicio')
            .insert({
                session_id: sessionId,
                ...performance
            })
            .select()
            .single();

        return { log: data, error };
    }

    /**
     * Finaliza una sesión de entrenamiento y calcula puntos
     */
    static async completeSession(sessionId: string, totalPoints: number, moodRating?: number, notes?: string) {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('sesiones_de_entrenamiento')
            .update({
                status: 'completed',
                end_time: new Date().toISOString(),
                total_points: totalPoints,
                mood_rating: moodRating,
                notes: notes
            })
            .eq('id', sessionId)
            .select()
            .single();

        return { session: data, error };
    }

    /**
     * Obtiene el historial de sesiones de un usuario
     */
    static async getUserSessionHistory(userId: string, limit = 10, supabaseClient?: any) {
        const supabase = supabaseClient || await createClient();

        const { data, error } = await supabase
            .from('sesiones_de_entrenamiento')
            .select(`
                *,
                routine:rutinas(name),
                logs:registros_de_ejercicio(*)
            `)
            .eq('user_id', userId)
            .order('start_time', { ascending: false })
            .limit(limit);

        return { sessions: data, error };
    }
}
