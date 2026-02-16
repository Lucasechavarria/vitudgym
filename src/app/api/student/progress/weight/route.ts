import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/student/progress/weight
 * 
 * Registra un nuevo peso del alumno
 */
export async function POST(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['member']
        );

        if (error) return error;

        const body = await request.json();
        const { weight } = body;

        if (!weight || weight <= 0) {
            return NextResponse.json({
                error: 'Peso inválido'
            }, { status: 400 });
        }

        // Guardar en tabla mediciones
        const { error: insertError } = await supabase
            .from('mediciones')
            .insert({
                usuario_id: user.id,
                peso: weight,
                registrado_en: new Date().toISOString(),
                // Otros campos como grasa_corporal podrían agregarse si se extiende el form
            });

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            message: 'Peso registrado correctamente'
        });

    } catch (error) {
        console.error('❌ Error logging weight:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al registrar peso';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
