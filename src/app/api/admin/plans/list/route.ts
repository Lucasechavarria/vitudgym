import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/plans/list
 * Retorna todos los niveles de suscripción disponibles.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin', 'admin']);
        if (authError) return authError;

        const adminClient = createAdminClient() as any;

        const { data: plans, error: dbError } = await adminClient
            .from('planes_suscripcion')
            .select('*')
            .order('precio_mensual', { ascending: true });

        if (dbError) throw dbError;

        return NextResponse.json({ plans });

    } catch (error: any) {
        console.error('❌ Error listing plans:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
