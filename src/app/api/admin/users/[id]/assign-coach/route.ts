import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * PUT /api/admin/users/[id]/assign-coach
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { id: userId } = await params;
        const body = await request.json();
        const { coachId } = body;

        console.log(`🤖 Intentando asignar coach: User=${userId}, Coach=${coachId}`);

        // 1. Demote any existing primary coach for this user
        const { error: demoteError } = await supabase!
            .from('relacion_alumno_coach')
            .update({ is_primary: false })
            .eq('user_id', userId)
            .eq('is_primary', true);

        if (demoteError) {
            console.error('❌ Error demoting old coach:', demoteError);
            throw new Error(`Error quitando coach anterior: ${demoteError.message}`);
        }

        // 2. Assign new coach (if provided)
        if (coachId) {
            const { error: assignError } = await supabase!
                .from('relacion_alumno_coach')
                .upsert({
                    user_id: userId,
                    coach_id: coachId,
                    is_primary: true,
                    is_active: true,
                    assigned_at: new Date().toISOString()
                }, { onConflict: 'user_id,coach_id' }); // Sin espacios por seguridad

            if (assignError) {
                console.error('❌ Error in upsert:', assignError);
                throw new Error(`Error en upsert: ${assignError.message}`);
            }
        }

        return NextResponse.json({ success: true, message: 'Coach asignado correctamente' });

    } catch (error) {
        console.error('❌ Error assigning coach (CATCH):', error);
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
