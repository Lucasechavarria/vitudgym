import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { error: authError, user: adminUser } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError || !adminUser) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { gymId, reason } = await request.json();

        if (!gymId) {
            return NextResponse.json({ error: 'Missing gymId' }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // 1. Log the impersonation event
        const { error: logError } = await adminClient
            .from('logs_acceso_remoto')
            .insert({
                superadmin_id: adminUser.id,
                gimnasio_id: gymId,
                motivo: reason || 'Soporte Técnico / Verificación'
            });

        if (logError) throw logError;

        // 2. In a real scenario, we would generate a temporary session or cookie here.
        // For now, we return success and the destination URL.
        // The frontend can then redirect or show the gym-specific view.

        return NextResponse.json({
            success: true,
            message: 'Acceso remoto registrado y concedido',
            redirectUrl: `/admin/gyms/${gymId}/dashboard` // This would be the dashboard for that gym
        });

    } catch (error: any) {
        console.error('❌ Impersonation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
