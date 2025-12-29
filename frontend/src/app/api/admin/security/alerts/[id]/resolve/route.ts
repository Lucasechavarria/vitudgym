import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/security/alerts/[id]/resolve
 * 
 * Marca una alerta como resuelta
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        const { id } = await params;
        const alertId = id;

        // Actualizar el log para marcarlo como resuelto
        // (Agregar campo resolved a la tabla si no existe)
        const { error: updateError } = await supabase
            .from('routine_access_logs')
            .update({
                resolved: true,
                resolved_at: new Date().toISOString()
            })
            .eq('id', alertId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Alerta marcada como resuelta'
        });

    } catch (error: any) {
        console.error('Error resolving alert:', error);
        return NextResponse.json({
            error: error.message || 'Error resolving alert'
        }, { status: 500 });
    }
}
