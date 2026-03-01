import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/student/membership/available-plans
 * Retorna otros planes disponibles en el gimnasio para upgrade.
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error, profile } = await authenticateAndRequireRole(request, ['member']);
        if (error) return error;

        // Fetch gimnasio_id from profile since authenticateAndRequireRole already enriched it
        const gymId = profile?.gimnasio_id;

        if (!gymId) {
            return NextResponse.json({ error: 'Gimnasio no encontrado para este perfil' }, { status: 404 });
        }

        const { data: plans, error: plansError } = await supabase
            .from('planes_gimnasio')
            .select('*')
            .eq('gimnasio_id', gymId)
            .eq('esta_activo', true)
            .neq('id', profile.plan_id || '')
            .order('precio', { ascending: true });

        if (plansError) throw plansError;

        return NextResponse.json({ success: true, plans: plans || [] });
    } catch (err) {
        console.error('❌ Error fetching available plans:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar planes';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
