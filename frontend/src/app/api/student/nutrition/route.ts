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
            .from('nutrition_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        if (planError && planError.code !== 'PGRST116') {
            throw planError;
        }

        return NextResponse.json({
            success: true,
            plan: plan || null
        });

    } catch (error: any) {
        console.error('Error loading nutrition plan:', error);
        return NextResponse.json({
            error: error.message || 'Error loading nutrition plan'
        }, { status: 500 });
    }
}
