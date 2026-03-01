import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const body = await request.json().catch(() => ({}));
        const {
            id,
            nombre,
            slug,
            es_activo,
            logo_url,
            color_primario,
            plan_id,
            estado_pago_saas,
            config_visual,
            modulos_activos
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID de gimnasio requerido' }, { status: 400 });
        }

        // Basic sanitization
        if (typeof id !== 'string') {
            return NextResponse.json({ error: 'ID de gimnasio inválido' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: gym, error: gymError } = await supabase
            .from('gimnasios')
            .update({
                nombre,
                slug,
                es_activo,
                logo_url,
                color_primario,
                plan_id,
                estado_pago_saas,
                config_visual,
                modulos_activos
            })
            .eq('id', id)
            .select()
            .single();

        if (gymError) throw gymError;

        return NextResponse.json({ success: true, gym });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Update Gym Error:', { error: message });
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
