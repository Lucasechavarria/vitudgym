import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/gyms/update-landing
 * Actualiza la configuración de marketing (Landing Page) del gimnasio.
 */
export async function POST(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const { config_landing } = await request.json();

        const adminClient = createAdminClient() as any;

        const { error } = await adminClient
            .from('gimnasios')
            .update({
                config_landing,
                actualizado_en: new Date().toISOString()
            })
            .eq('id', profile.gimnasio_id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('❌ Error updating landing config:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
