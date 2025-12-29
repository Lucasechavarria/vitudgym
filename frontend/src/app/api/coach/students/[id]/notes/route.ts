import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * PUT /api/coach/students/[id]/notes
 * 
 * Actualiza las notas del coach sobre un alumno
 */
export async function PUT(
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
        const studentId = id;
        const body = await request.json();
        const { notes } = body;

        // Actualizar notas del coach
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ coach_observations: notes })
            .eq('id', studentId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Notas actualizadas correctamente'
        });

    } catch (error: any) {
        console.error('Error updating notes:', error);
        return NextResponse.json({
            error: error.message || 'Error updating notes'
        }, { status: 500 });
    }
}
