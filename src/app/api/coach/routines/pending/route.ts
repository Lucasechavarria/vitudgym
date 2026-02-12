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
            ['coach', 'admin']
        );

        if (error) return error;

        // Obtener rutinas con estado detailed_plan_generated
        const { data: routines, error: routinesError } = await supabase
            .from('rutinas')
            .select(`
                id,
                nombre,
                usuario_id,
                creado_en,
                duracion_semanas,
                nivel_dificultad,
                plan_nutricional_id,
                estado,
                perfiles!rutinas_usuario_id_fkey (
                    nombre_completo,
                    email
                )
            `)
            .eq('estado', 'detailed_plan_generated') // Or whatever status means "AI done, waiting approval"
            .order('creado_en', { ascending: false });

        if (routinesError) throw routinesError;

        // Transform data
        const routinesWithCounts = (routines || []).map((routine: { id: string; nombre: string; objetivo?: string; perfiles?: { nombre_completo: string; email: string }; creado_en: string; estado: string }) => ({
            id: routine.id,
            name: routine.nombre,
            goal: routine.objetivo,
            student_name: routine.perfiles?.nombre_completo || 'Sin nombre',
            student_email: routine.perfiles?.email || '',
            created_at: routine.creado_en,
            status: routine.estado
        }));

        return NextResponse.json({
            success: true,
            routines: routinesWithCounts
        });

    } catch (_error) {
        console.error('❌ Error loading pending routines:', _error);
        const errorMessage = _error instanceof Error ? _error.message : 'Error al cargar rutinas pendientes';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
