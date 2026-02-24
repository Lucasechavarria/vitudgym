import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/saas/metrics/history
 * Retorna el historial de métricas para gráficas y el snapshot más reciente.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const supabase = createAdminClient();

        // Obtener los últimos 30 días de métricas
        const { data: history, error: historyError } = await supabase
            .from('saas_metrics')
            .select('*')
            .order('fecha', { ascending: true })
            .limit(30);

        if (historyError) throw historyError;

        // El más reciente
        const { data: latest, error: latestError } = await supabase
            .from('saas_metrics')
            .select('*')
            .order('fecha', { ascending: false })
            .limit(1)
            .single();

        if (latestError && latestError.code !== 'PGRST116') { // Ignorar si no hay datos aún
            console.error('Latest metrics error:', latestError);
        }

        return NextResponse.json({
            history: history || [],
            latest: latest || null
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Metrics History Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
