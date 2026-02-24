import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/saas/metrics/update
 * Calcula y guarda un snapshot de las métricas SaaS del día.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const supabase = createAdminClient();

        // 1. Calcular MRR Estimado (basado en gimnasios activos y sus planes)
        const { data: mrrData } = await supabase.from('saas_mrr_actual').select('*').single();
        const mrr = mrrData?.mrr_estimado || 0;

        // 2. Contar gimnasios por estado
        const { count: activeGyms } = await supabase.from('gimnasios').select('id', { count: 'exact', head: true }).eq('estado_pago_saas', 'active');
        const { count: suspendedGyms } = await supabase.from('gimnasios').select('id', { count: 'exact', head: true }).eq('estado_pago_saas', 'suspended');

        // 3. Contar alumnos totales
        const { count: totalStudents } = await supabase.from('perfiles').select('id', { count: 'exact', head: true }).eq('rol', 'alumno');

        // 4. Intentar guardar el snapshot
        const { error: upsertError } = await supabase.from('saas_metrics').upsert({
            fecha: new Date().toISOString().split('T')[0],
            mrr,
            gyms_activos: activeGyms || 0,
            gyms_suspendidos: suspendedGyms || 0,
            total_alumnos: totalStudents || 0,
            ingresos_totales_mes: mrr // Por ahora igual al mrr estimado si no hay pasarela
        }, { onConflict: 'fecha' });

        if (upsertError) throw upsertError;

        return NextResponse.json({
            success: true,
            metrics: {
                mrr,
                gyms_activos: activeGyms,
                gyms_suspendidos: suspendedGyms,
                total_alumnos: totalStudents
            }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Metrics Update Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
