import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkGymLimits } from '@/lib/saas/limits';

export async function GET(request: Request) {
    try {
        // Obtenemos el usuario y su gimnasio
        const { supabase, error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient();

        // Obtener ID del gimnasio del perfil
        const { data: profile } = await adminClient
            .from('perfiles')
            .select('gimnasio_id')
            .eq('id', user.id)
            .single();

        if (!profile?.gimnasio_id) {
            return NextResponse.json({ error: 'Usuario sin gimnasio asignado' }, { status: 400 });
        }

        const gymId = profile.gimnasio_id;

        // 1. Obtener info del gimnasio
        const { data: gym, error: gymError } = await adminClient
            .from('gimnasios')
            .select(`
                *,
                planes_suscripcion (
                    nombre,
                    precio_mensual,
                    limite_usuarios,
                    limite_sucursales
                )
            `)
            .eq('id', gymId)
            .single();

        if (gymError) throw gymError;

        // 2. Obtener límites actuales
        const limits = await checkGymLimits(gymId);

        return NextResponse.json({
            success: true,
            gym,
            limits
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
