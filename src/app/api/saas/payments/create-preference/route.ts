import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { preference } from '@/lib/config/mercadopago';

/**
 * POST /api/saas/payments/create-preference
 * Crea una preferencia de MercadoPago para cobrar la mensualidad al gimnasio (SaaS)
 */
export async function POST(request: Request) {
    try {
        const { supabase, error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient();

        // 1. Obtener el gimnasio y su plan actual
        const { data: profile } = await adminClient
            .from('perfiles')
            .select('gimnasio_id')
            .eq('id', user.id)
            .single();

        if (!profile?.gimnasio_id) {
            return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 400 });
        }

        const { data: gym, error: gymError } = await adminClient
            .from('gimnasios')
            .select(`
                id,
                nombre,
                planes_suscripcion (
                    nombre,
                    precio_mensual
                )
            `)
            .eq('id', profile.gimnasio_id)
            .single();

        if (gymError || !gym) throw new Error('Error al obtener datos del gimnasio');

        const plan = (gym.planes_suscripcion as any);
        const precio = plan?.precio_mensual || 0;

        if (precio <= 0) {
            return NextResponse.json({ error: 'El plan actual no tiene un costo asociado' }, { status: 400 });
        }

        // 2. Crear preferencia en MercadoPago
        // Usamos external_reference para guardar el gymId y procesarlo en el webhook
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: `saas-monthly-${gym.id}`,
                        title: `Suscripción Mensual Virtud Gym - ${gym.nombre}`,
                        quantity: 1,
                        unit_price: precio,
                        currency_id: 'ARS',
                    },
                ],
                external_reference: gym.id,
                notification_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/saas/webhooks/mercadopago`,
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/settings?payment=success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/settings?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/settings?payment=pending`
                },
                auto_return: 'approved',
                metadata: {
                    gym_id: gym.id,
                    type: 'saas_subscription'
                }
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('SaaS Preference Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
