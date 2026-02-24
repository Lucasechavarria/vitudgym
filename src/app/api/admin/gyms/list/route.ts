import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/gyms/list
 * Devuelve todos los gimnasios y sus sucursales. Solo Superadmin.
 */
export async function GET(request: Request) {
    try {
        // Solo superadmin puede ver la lista global de gimnasios
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient();

        const { data: gyms, error: dbError } = await adminClient
            .from('gimnasios')
            .select(`
                *,
                sucursales (*)
            `)
            .order('creado_en', { ascending: false });

        if (dbError) throw dbError;

        return NextResponse.json({ gyms });
    } catch (error: any) {
        console.error('❌ Error fetching gyms:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
