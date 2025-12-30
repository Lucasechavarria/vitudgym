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
            ['coach', 'admin', 'superadmin']
        );

        if (error) return error;

        const { id } = await params;
        const routineId = id;

        // Obtener la rutina para saber de quién es
        const { data: routine, error: fetchError } = await supabase
            .from('routines')
            .select('user_id, name')
            .eq('id', routineId)
            .single();

        if (fetchError || !routine) throw fetchError || new Error('Routine not found');

        // Actualizar status a active
        const { error: updateError } = await supabase
            .from('routines')
            .update({ status: 'active', is_active: true })
            .eq('id', routineId);

        if (updateError) throw updateError;

        // Enviar mensaje de notificación al alumno
        const { data: { user: coachUser } } = await supabase.auth.getUser();
        await supabase.from('messages').insert({
            sender_id: coachUser?.id,
            receiver_id: routine.user_id,
            content: `¡Tu rutina "${routine.name}" ha sido aprobada y ya está activa en tu dashboard! 💪`
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
