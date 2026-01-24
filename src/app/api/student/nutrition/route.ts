import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/student/nutrition
 * 
 * Obtiene el plan nutricional activo del alumno
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['member']
        );

        if (error) return error;

        // Obtener plan nutricional activo
        const { data: plan, error: planError } = await supabase
            .from('planes_nutricionales')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('esta_activo', true)
            .single();

        if (planError && planError.code !== 'PGRST116') {
            throw planError;
        }

        return NextResponse.json({
            success: true,
            plan: plan || null
        });

    } catch (error) {
        console.error('❌ Error loading nutrition plan:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar plan nutricional';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
