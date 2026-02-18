import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/users/[id]/history
 * 
 * Obtiene el historial de cambios de perfil de un usuario.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { id } = await params;
        const userId = id;

        // Consultar historial con el nombre del que realizó el cambio
        const { data, error: historyError } = await supabase!
            .from('historial_cambios_perfil')
            .select(`
                *,
                autor:perfiles!changed_by (
                    nombre_completo,
                    correo
                )
            `)
            .eq('profile_id', userId)
            .order('created_at', { ascending: false });

        if (historyError) throw historyError;

        return NextResponse.json({
            success: true,
            history: data
        });

    } catch (error) {
        console.error('❌ Error fetching user history:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error fetching user history'
        }, { status: 500 });
    }
}
