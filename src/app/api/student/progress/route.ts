import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/student/progress
 * 
 * Obtiene datos de progreso del alumno
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['member', 'coach', 'admin']
        );

        if (error) return error;

        // 1. Obtener mediciones reales para el historial de peso y métricas
        const { data: measurements } = await supabase
            .from('mediciones')
            .select('*')
            .eq('usuario_id', user.id)
            .order('registrado_en', { ascending: true });

        // 2. Obtener estadísticas de sesiones de entrenamiento
        const { data: sessions } = await supabase
            .from('sesiones_de_entrenamiento')
            .select('estado, hora_inicio')
            .eq('usuario_id', user.id);

        const completedWorkouts = sessions?.filter(s => s.estado === 'completed').length || 0;
        const totalWorkouts = sessions?.length || 0;

        // 3. Obtener racha desde gamificación
        const { data: gamification } = await supabase
            .from('gamificacion_del_usuario')
            .select('racha_actual, racha_mas_larga')
            .eq('usuario_id', user.id)
            .single();

        // 4. Mapear historial de peso
        const weightHistory = (measurements || [])
            .filter(m => m.peso)
            .map(m => ({
                fecha: m.registrado_en,
                peso: m.peso
            }));

        const progress = {
            historial_peso: weightHistory,
            entrenamientos_completados: completedWorkouts,
            entrenamientos_totales: totalWorkouts,
            racha_actual: gamification?.racha_actual || 0,
            mejor_racha: gamification?.racha_mas_larga || 0,
            mediciones: measurements || []
        };

        return NextResponse.json({
            success: true,
            progress
        });

    } catch (error) {
        console.error('❌ Error loading progress:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar progreso';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
