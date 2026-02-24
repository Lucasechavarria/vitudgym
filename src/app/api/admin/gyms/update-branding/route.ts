import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/admin/gyms/update-branding
 * Actualiza la identidad visual del gimnasio actual.
 */
export async function POST(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const { color_primario, color_secundario, logo_url, config_visual } = await request.json();

        const adminClient = createAdminClient() as any;

        const { error } = await adminClient
            .from('gimnasios')
            .update({
                color_primario,
                color_secundario,
                logo_url,
                config_visual,
                actualizado_en: new Date().toISOString()
            })
            .eq('id', profile.gimnasio_id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('❌ Error updating branding:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
