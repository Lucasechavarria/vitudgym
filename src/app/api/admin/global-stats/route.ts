import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/global-stats
 * Retorna las métricas globales para el Superadmin sumando todos los gyms.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient() as any;

        // 1. Conteo de Entidades Globales
        const [
            { count: totalGyms },
            { count: totalUsers },
            { count: totalBranches },
            { data: revenueData }
        ] = await Promise.all([
            adminClient.from('gimnasios').select('*', { count: 'exact', head: true }),
            adminClient.from('perfiles').select('*', { count: 'exact', head: true }),
            adminClient.from('sucursales').select('*', { count: 'exact', head: true }),
            adminClient.from('payments').select('amount').eq('status', 'approved')
        ]);

        // 2. Calcular Ganancias Totales de la Red
        const totalRevenue = revenueData?.reduce((acc: any, curr: any) => acc + Number(curr.amount), 0) || 0;

        // 3. Obtener Actividad Reciente Cruzada (Auditoría)
        const { data: recentActivity } = await adminClient
            .from('auditoria_global')
            .select(`
                *,
                perfiles (nombre_completo),
                gimnasios (nombre)
            `)
            .order('creado_en', { ascending: false })
            .limit(10);

        return NextResponse.json({
            stats: {
                gyms: totalGyms || 0,
                users: totalUsers || 0,
                branches: totalBranches || 0,
                revenue: totalRevenue
            },
            recentActivity: recentActivity || []
        });

    } catch (error: any) {
        console.error('❌ Error in global-stats API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
