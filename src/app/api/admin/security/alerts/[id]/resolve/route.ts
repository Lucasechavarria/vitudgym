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
            ['admin']
        );

        if (error) return error;

        const { id } = await params;
        const alertId = id;

        // Actualizar el log para marcarlo como resuelto
        // (Agregar campo fue_resuelto a la tabla si no existe)
        const { error: updateError } = await supabase
            .from('registros_acceso_rutina')
            .update({
                fue_resuelto: true,
                resuelto_en: new Date().toISOString()
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
