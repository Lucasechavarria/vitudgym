import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/plans/update
 * Actualiza los beneficios o precio de un plan SaaS.
 */
export async function POST(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const { id, nombre, precio_mensual, limite_sucursales, limite_usuarios, caracteristicas } = await request.json();

        const adminClient = createAdminClient();

        const { error } = await adminClient
            .from('planes_suscripcion')
            .update({
                nombre,
                precio_mensual,
                limite_sucursales,
                limite_usuarios,
                caracteristicas
            })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
