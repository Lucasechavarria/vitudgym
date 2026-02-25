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

        const adminClient = createAdminClient();

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
            adminClient.from('pagos').select('monto').eq('estado', 'aprobado')
        ]);

        // 2. Calcular Ganancias Totales de la Red
        const totalRevenue = (revenueData as { monto: number }[] | null)?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

        // 3. Obtener Actividad Reciente Cruzada (Auditoría)
        const { data: auditData } = await adminClient
            .from('audit_logs')
            .select(`
                id,
                operacion,
                tabla,
                creado_en,
                perfiles:usuario_id (
                    nombre_completo,
                    gimnasios:gimnasio_id (nombre)
                )
            `)
            .order('creado_en', { ascending: false })
            .limit(10);

        const recentActivity = (auditData as any[])?.map(log => ({
            id: log.id,
            accion: log.operacion,
            entidad_tipo: log.tabla,
            creado_en: log.creado_en,
            perfiles: { nombre_completo: log.perfiles?.nombre_completo },
            gimnasios: { nombre: log.perfiles?.gimnasios?.nombre || 'SaaS Core' }
        }));

        // 4. Obtener Alertas Críticas (Tickets abiertos de alta prioridad)
        const { data: criticalTickets } = await adminClient
            .from('tickets_soporte_saas')
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

        // 6. Obtener métricas de Churn (Histórico últimos 6 meses)
        const { data: churnData } = await adminClient
            .from('saas_metrics')
            .select('fecha, churn_gyms_mes')
            .order('fecha', { ascending: true })
            .limit(6);

        // 7. NEW: Salud de Gimnasios
        const { data: gymsHealth } = await adminClient
            .from('gimnasios')
            .select('id, nombre, scoring_salud, fase_onboarding')
            .order('scoring_salud', { ascending: false })
            .limit(10);

        // 8. NEW: Anuncios Globales
        const { data: announcements } = await adminClient
            .from('anuncios_globales')
            .select('*')
            .eq('activo', true)
            .order('creado_en', { ascending: false })
            .limit(5);

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
            ].slice(0, 5),
            churnHistory: churnData || [],
            gymsHealth: gymsHealth || [],
            announcements: announcements || []
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error in global-stats API:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
