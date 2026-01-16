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
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin']);
        if (error) return error;

        const { id: userId } = await params;
        const { coachId } = await request.json();

        // 1. Demote any existing primary coach for this user
        // We update all active primary relationships to be non-primary
        const { error: demoteError } = await supabase!
            .from('relacion_alumno_coach')
            .update({ is_primary: false })
            .eq('user_id', userId)
            .eq('is_primary', true);

        if (demoteError) throw demoteError;

        // 2. Assign new coach (if provided)
        if (coachId) {
            // Upsert: Create new or update existing relationship to be primary and active
            const { error: assignError } = await supabase!
                .from('relacion_alumno_coach')
                .upsert({
                    user_id: userId,
                    coach_id: coachId,
                    is_primary: true,
                    is_active: true,
                    assigned_at: new Date().toISOString()
                }, { onConflict: 'user_id, coach_id' });

            if (assignError) throw assignError;
        }

        return NextResponse.json({ success: true, message: 'Coach asignado correctamente' });

    } catch (error) {
        console.error('❌ Error assigning coach:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error assigning coach';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
