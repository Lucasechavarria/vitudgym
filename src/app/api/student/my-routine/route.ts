import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/student/my-routine
 * 
 * Obtiene la rutina activa del alumno
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['member', 'coach', 'admin', 'superadmin']
        );

        if (error) return error;

        // Obtener rutina activa
        const { data: routine, error: routineError } = await supabase
            .from('rutinas')
            .select(`
                *,
                coach:perfiles(full_name, email)
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .eq('status', 'approved')
            .single();

        if (routineError || !routine) {
            return NextResponse.json({
                success: false,
                error: 'No active routine'
            }, { status: 404 });
        }

        // Obtener ejercicios de la rutina
        const { data: exercises, error: exercisesError } = await supabase
            .from('ejercicios')
            .select('*')
            .eq('routine_id', routine.id)
            .order('day_number', { ascending: true })
            .order('order_in_day', { ascending: true });

        if (exercisesError) throw exercisesError;

        // Incrementar contador de vistas
        await supabase
            .from('rutinas')
            .update({
                view_count: (routine.view_count || 0) + 1,
                last_viewed_at: new Date().toISOString()
            } as any)
            .eq('id', routine.id);

        return NextResponse.json({
            success: true,
            routine,
            exercises,
            userId: user.id
        });

    } catch (error) {
        console.error('❌ Error loading routine:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar rutina';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
