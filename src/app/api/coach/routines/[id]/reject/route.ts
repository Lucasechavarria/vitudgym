import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/coach/routines/[id]/reject
 * 
 * Rechaza una rutina pendiente
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin', 'superadmin']
        );

        if (error) return error;

        const routineId = params.id;

        // Actualizar status a rejected
        const { error: updateError } = await supabase
            .from('routines')
            .update({ status: 'rejected' })
            .eq('id', routineId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Rutina rechazada correctamente'
        });

    } catch (error: any) {
        console.error('Error rejecting routine:', error);
        return NextResponse.json({
            error: error.message || 'Error rejecting routine'
        }, { status: 500 });
    }
}
