import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/coach/routines/[id]/approve
 * 
 * Aprueba una rutina pendiente
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin']
        );

        if (error) return error;

        const { id } = await params;
        const routineId = id;

        // Obtener la rutina para saber de quién es
        const { data: routine, error: fetchError } = await supabase
            .from('rutinas')
            .select('usuario_id, nombre')
            .eq('id', routineId)
            .single();

        if (fetchError || !routine) throw fetchError || new Error('Routine not found');

        // Actualizar estado a activa
        const { error: updateError } = await supabase
            .from('rutinas')
            .update({ estado: 'activa', esta_activa: true })
            .eq('id', routineId);

        if (updateError) throw updateError;

        // Enviar mensaje de notificación al alumno
        const { data: { user: coachUser } } = await supabase.auth.getUser();
        await supabase.from('mensajes').insert({
            emisor_id: coachUser?.id,
            receptor_id: routine.usuario_id,
            contenido: `¡Tu rutina "${routine.nombre}" ha sido aprobada y ya está activa en tu dashboard! 💪`
        });

        return NextResponse.json({
            success: true,
            message: 'Rutina aprobada correctamente'
        });

    } catch (error) {
        console.error('❌ Error approving routine:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al aprobar rutina';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
