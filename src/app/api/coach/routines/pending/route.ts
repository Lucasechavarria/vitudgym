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
            .from('rutinas')
            .select(`
                id,
                name,
                user_id,
                created_at,
                duration_weeks,
                difficulty,
                nutrition_plan_id,
                perfiles!routines_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .eq('status', 'detailed_plan_generated') // Or whatever status means "AI done, waiting approval"
            .order('created_at', { ascending: false });

        if (routinesError) throw routinesError;

        // Transform data
        const routinesWithCounts = (routines || []).map((routine: any) => ({
            id: routine.id,
            name: routine.name,
            goal: routine.goal,
            student_name: routine.perfiles?.full_name || 'Sin nombre',
            student_email: routine.perfiles?.email || '',
            created_at: routine.created_at,
            status: routine.status
        }));

        return NextResponse.json({
            success: true,
            routines: routinesWithCounts
        });

    } catch (error) {
        console.error('❌ Error loading pending routines:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar rutinas pendientes';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
