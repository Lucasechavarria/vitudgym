import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/gyms/current
 * Retorna los datos del gimnasio actual basado en el perfil del usuario.
 */
export async function GET(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError) return authError;

        const adminClient = createAdminClient() as any;

        const { data: gym, error: dbError } = await adminClient
            .from('gimnasios')
            .select('*')
            .eq('id', profile.gimnasio_id)
            .single();

        if (dbError) throw dbError;

        return NextResponse.json({ gym });

    } catch (error: any) {
        console.error('❌ Error fetching current gym:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
