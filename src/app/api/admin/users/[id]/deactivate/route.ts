import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/users/[id]/deactivate
 * 
 * Desactiva o revierte la membresía de un usuario.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { id } = await params;
        const userId = id;

        // Actualizar perfil a inactivo
        const { error: updateError } = await supabase!
            .from('perfiles')
            .update({
                estado_membresia: 'inactive',
                fecha_fin_membresia: null
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return NextResponse.json({
            success: true,
            message: 'Membresía desactivada/revertida correctamente'
        });

    } catch (error) {
        console.error('❌ Error deactivating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error deactivating user';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
