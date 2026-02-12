import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Configuración de VAPID
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@virtud-gym.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
    const supabase = await createClient();

    try {
        const { recipientId, title, body, url } = await req.json();

        if (!recipientId || !title || !body) {
            return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
        }

        // 1. Obtener la sesión del remitente para seguridad básica (opcional, pero recomendado)
        const { data: { user: sender } } = await supabase.auth.getUser();
        if (!sender) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        // 2. Obtener la suscripción push del RECEPTOR
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('subscription')
            .eq('usuario_id', recipientId)
            .order('creado_en', { ascending: false })
            .limit(1);

        if (subError || !subscriptions || subscriptions.length === 0) {
            // No es un error crítico si no hay suscripción, simplemente no enviamos
            return NextResponse.json({ success: false, message: 'Receptor no tiene suscripción push activa' });
        }

        const pushSubscription = subscriptions[0].subscription;

        const payload = JSON.stringify({
            title: title || '🔱 Virtud Gym',
            body: body,
            url: url || '/dashboard'
        });

        await webpush.sendNotification(pushSubscription, payload);

        return NextResponse.json({ success: true, message: 'Notificación enviada con éxito' });

    } catch (error: any) {
        console.error('Error enviando notificación push:', error);
        return NextResponse.json({
            error: 'Error interno al enviar notificación',
            details: error.message
        }, { status: 500 });
    }
}
