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

        // 4. Obtener Alertas Críticas (Tickets abiertos de alta prioridad)
        const { data: criticalTickets } = await adminClient
            .from('tickets_soporte')
            .select(`
                *,
                gimnasios (nombre)
            `)
            .eq('estado', 'abierto')
            .in('prioridad', ['critica', 'alta'])
            .limit(3);

        // 5. Gimnasios con problemas de pago
        const { data: gymsWithIssues } = await adminClient
            .from('gimnasios')
            .select('nombre, estado_pago_saas')
            .neq('estado_pago_saas', 'active')
            .limit(3);

        return NextResponse.json({
            stats: {
                gyms: totalGyms || 0,
                users: totalUsers || 0,
                branches: totalBranches || 0,
                revenue: totalRevenue
            },
            recentActivity: recentActivity || [],
            alerts: [
                ...(criticalTickets || []).map((t: any) => ({
                    id: t.id,
                    type: 'ticket',
                    priority: t.prioridad,
                    message: `${t.asunto} (${t.gimnasios?.nombre || 'General'})`,
                    link: `/admin/reports/tickets`
                })),
                ...(gymsWithIssues || []).map((g: any) => ({
                    id: `gym-${g.nombre}`,
                    type: 'payment',
                    priority: 'alta',
                    message: `Gimnasio "${g.nombre}" tiene estado: ${g.estado_pago_saas}`,
                    link: `/admin/finance/metrics`
                }))
            ].slice(0, 5)
        });

    } catch (error: any) {
        console.error('❌ Error in global-stats API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
