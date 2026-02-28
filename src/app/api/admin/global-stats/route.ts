import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/global-stats
 * Retorna las métricas globales para el Superadmin sumando todos los gyms.
 * Q2: Ahora incluye MRR real desde saas_mrr_actual + desglose por plan.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient();

        // ══════════════════════════════════════════════════════
        // 1. Conteo de Entidades + MRR Real en paralelo
        // ══════════════════════════════════════════════════════
        const [
            { count: totalGyms },
            { count: totalUsers },
            { count: totalBranches },
            { count: activeGyms },
            { data: mrrData },
            { data: revenueData },
            { data: gymsByPlan }
        ] = await Promise.all([
            adminClient.from('gimnasios').select('*', { count: 'exact', head: true }),
            adminClient.from('perfiles').select('*', { count: 'exact', head: true }),
            adminClient.from('sucursales').select('*', { count: 'exact', head: true }),
            adminClient.from('gimnasios').select('*', { count: 'exact', head: true }).eq('es_activo', true),
            // MRR real desde la vista calculada
            adminClient.from('saas_mrr_actual').select('*').single(),
            // Revenue de pagos aprobados este mes (enum en español)
            adminClient
                .from('pagos')
                .select('monto')
                .eq('estado', 'aprobado')
                .gte('creado_en', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
            // Distribución de gimnasios por plan
            adminClient
                .from('gimnasios')
                .select('plan_id, planes_suscripcion!plan_id(nombre, precio_mensual)')
                .eq('es_activo', true)
                .limit(100)
        ]);

        // Calcular revenue mensual real de pagos
        const monthlyRevenue = (revenueData as { monto: number }[] | null)
            ?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

        // MRR estimado desde la vista (fallback a revenue real)
        const estimatedMRR = (mrrData as any)?.mrr_estimado || monthlyRevenue;

        // Desglose por plan para el gráfico de doughnut
        const planBreakdown = ((gymsByPlan as any[]) || []).reduce((acc: Record<string, number>, gym) => {
            const planName = (gym as any)?.planes_suscripcion?.nombre || 'Sin Plan';
            acc[planName] = (acc[planName] || 0) + 1;
            return acc;
        }, {});

        // ══════════════════════════════════════════════════════
        // 2. Actividad Reciente (Auditoría Global)
        // ══════════════════════════════════════════════════════
        const { data: auditData } = await adminClient
            .from('auditoria_global')
            .select(`
                id,
                accion,
                entidad_tipo,
                creado_en,
                perfiles:usuario_id (
                    nombre_completo,
                    gimnasio:gimnasio_id (nombre)
                )
            `)
            .order('creado_en', { ascending: false })
            .limit(10);

        const recentActivity = ((auditData as any[]) || []).map(log => ({
            id: log.id,
            accion: log.accion,
            entidad_tipo: log.entidad_tipo,
            creado_en: log.creado_en,
            perfiles: { nombre_completo: log.perfiles?.nombre_completo || 'Sistema' },
            gimnasios: { nombre: log.perfiles?.gimnasio?.nombre || 'SaaS Core' }
        }));

        // ══════════════════════════════════════════════════════
        // 3. Alertas Críticas
        // ══════════════════════════════════════════════════════
        const [{ data: criticalTickets }, { data: gymsWithIssues }] = await Promise.all([
            adminClient
                .from('tickets_soporte')
                .select('id, asunto, prioridad, gimnasios:gimnasio_id(nombre)')
                .eq('estado', 'open')
                .in('prioridad', ['critica', 'alta'])
                .limit(3),
            adminClient
                .from('gimnasios')
                .select('nombre, estado_pago_saas')
                .not('estado_pago_saas', 'in', '("active","trial")')
                .eq('es_activo', true)
                .limit(3)
        ]);

        // ══════════════════════════════════════════════════════
        // 4. MRR Histórico (Churn incluido)
        // ══════════════════════════════════════════════════════
        const { data: churnData } = await adminClient
            .from('saas_metrics')
            .select('fecha, churn_gyms_mes, mrr')
            .order('fecha', { ascending: true })
            .limit(6);

        // ══════════════════════════════════════════════════════
        // 5. Salud de Gimnasios
        // ══════════════════════════════════════════════════════
        const { data: gymsHealth } = await adminClient
            .from('gimnasios')
            .select('id, nombre, scoring_salud, fase_onboarding, modulos_activos')
            .eq('es_activo', true)
            .order('scoring_salud', { ascending: false })
            .limit(10);

        // ══════════════════════════════════════════════════════
        // 6. Anuncios Globales
        // ══════════════════════════════════════════════════════
        const { data: announcements } = await adminClient
            .from('anuncios_globales')
            .select('*')
            .eq('activo', true)
            .order('creado_en', { ascending: false })
            .limit(5);

        logger.info('Global stats fetched', { totalGyms, activeGyms, estimatedMRR });

        return NextResponse.json({
            stats: {
                gyms: totalGyms || 0,
                gyms_activos: activeGyms || 0,
                users: totalUsers || 0,
                branches: totalBranches || 0,
                revenue: estimatedMRR,
                mrr: estimatedMRR,
                monthly_real_revenue: monthlyRevenue,
                plan_breakdown: planBreakdown
            },
            recentActivity: recentActivity || [],
            alerts: [
                ...((criticalTickets || []) as any[]).map((t: any) => ({
                    id: t.id,
                    type: 'ticket' as const,
                    priority: t.prioridad,
                    message: `${t.asunto} (${t.gimnasios?.nombre || 'General'})`,
                    link: `/admin/reports/tickets`
                })),
                ...((gymsWithIssues || []) as any[]).map((g: any) => ({
                    id: `gym-${g.nombre}`,
                    type: 'payment' as const,
                    priority: 'alta',
                    message: `Gimnasio "${g.nombre}" tiene estado: ${g.estado_pago_saas}`,
                    link: `/admin/gyms`
                }))
            ].slice(0, 5),
            churnHistory: churnData || [],
            gymsHealth: gymsHealth || [],
            announcements: announcements || []
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error in global-stats API', { error: message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
