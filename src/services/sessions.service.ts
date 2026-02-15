
import { createClient } from '@/lib/supabase/server';

export interface ExercisePerformance {
    ejercicio_id: string;
    series_reales?: number;
    repeticiones_reales?: string;
    peso_real?: number;
    segundos_descanso_real?: number;
    fue_completado?: boolean;
    puntuacion_dificultad?: number;
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
                usuario_id: userId,
                rutina_id: routineId,
                estado: 'active',
                hora_inicio: new Date().toISOString()
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
                sesion_id: sessionId,
                ejercicio_id: performance.ejercicio_id,
                series_reales: performance.series_reales,
                repeticiones_reales: performance.repeticiones_reales,
                peso_real: performance.peso_real,
                fue_completado: performance.fue_completado,
                puntuacion_dificultad: performance.puntuacion_dificultad
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
                estado: 'completed',
                hora_fin: new Date().toISOString(),
                puntos_totales: totalPoints,
                puntuacion_animo: moodRating,
                notas: notes
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
                routine:rutinas(nombre),
                logs:registros_de_ejercicio(*)
            `)
            .eq('usuario_id', userId)
            .order('hora_inicio', { ascending: false })
            .limit(limit);

        return { sessions: data, error };
    }
}
