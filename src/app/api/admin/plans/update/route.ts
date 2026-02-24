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

        const adminClient = createAdminClient() as any;

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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
