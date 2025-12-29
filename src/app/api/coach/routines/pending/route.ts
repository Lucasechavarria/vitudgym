import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/coach/routines/pending
 * 
 * Obtiene rutinas pendientes de aprobación
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin', 'superadmin']
        );

        if (error) return error;

        // Obtener rutinas con status pending_approval
        const { data: routines, error: routinesError } = await supabase
            .from('routines')
            .select(`
                id,
                name,
                user_id,
                created_at,
                duration_weeks,
                difficulty,
                nutrition_plan_id,
                profiles!routines_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .eq('status', 'pending_approval')
            .order('created_at', { ascending: false });

        if (routinesError) throw routinesError;

        // Contar ejercicios por rutina
        const routinesWithCounts = await Promise.all(
            (routines || []).map(async (routine) => {
                const { count } = await supabase
                    .from('exercises')
                    .select('*', { count: 'exact', head: true })
                    .eq('routine_id', routine.id);

                return {
                    ...routine,
                    student_name: routine.profiles?.full_name || 'Sin nombre',
                    student_email: routine.profiles?.email || '',
                    exercises_count: count || 0
                };
            })
        );

        return NextResponse.json({
            success: true,
            routines: routinesWithCounts
        });

    } catch (error: any) {
        console.error('Error loading pending routines:', error);
        return NextResponse.json({
            error: error.message || 'Error loading pending routines'
        }, { status: 500 });
    }
}
