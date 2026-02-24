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

        // 1. Obtener datos del gimnasio y su plan
        const { data: gym, error: dbError } = await adminClient
            .from('gimnasios')
            .select(`
                *,
                planes_suscripcion (*)
            `)
            .eq('id', profile.gimnasio_id)
            .single();

        if (dbError) throw dbError;

        // 2. Obtener conteos actuales
        const [
            { count: studentsCount },
            { count: branchesCount }
        ] = await Promise.all([
            adminClient.from('perfiles').select('*', { count: 'exact', head: true }).eq('gimnasio_id', profile.gimnasio_id).eq('rol', 'member'),
            adminClient.from('sucursales').select('*', { count: 'exact', head: true }).eq('gimnasio_id', profile.gimnasio_id)
        ]);

        return NextResponse.json({
            gym: {
                ...gym,
                stats: {
                    students: studentsCount || 0,
                    branches: branchesCount || 0
                }
            }
        });

    } catch (error: any) {
        console.error('❌ Error fetching current gym:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
