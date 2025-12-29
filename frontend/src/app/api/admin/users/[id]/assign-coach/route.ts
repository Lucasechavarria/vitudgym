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

        const { id: studentId } = await params;
        const { coachId } = await request.json();

        // Si coachId es null, se desasigna el coach
        const { error: updateError } = await supabase!
            .from('profiles')
            .update({ assigned_coach_id: coachId })
            .eq('id', studentId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, message: 'Coach asignado correctamente' });

    } catch (error: any) {
        console.error('Error assigning coach:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
