import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET: Obtener mensajes de un ticket
 * POST: Enviar mensaje nuevo
 */
export async function GET(
    request: Request,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError || !profile) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const adminClient = createAdminClient();

        // Verificar acceso al ticket
        if (profile.rol !== 'superadmin') {
            const { data: ticket } = await adminClient
                .from('tickets_soporte')
                .select('gimnasio_id')
                .eq('id', params.ticketId)
                .single();

            if (ticket?.gimnasio_id !== profile.gimnasio_id) {
                return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
            }
        }

        const { data: messages, error } = await adminClient
            .from('mensajes_soporte')
            .select(`
                *,
                perfiles (nombre_completo, rol)
            `)
            .eq('ticket_id', params.ticketId)
            .order('creado_en', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ messages });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError || !profile) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { mensaje } = await request.json();
        const adminClient = createAdminClient();

        // Enviar mensaje
        const { error: msgError } = await adminClient
            .from('mensajes_soporte')
            .insert({
                ticket_id: params.ticketId,
                remitente_id: profile.id,
                mensaje,
                es_del_staff_saas: profile.rol === 'superadmin'
            });

        if (msgError) throw msgError;

        // Actualizar fecha del ticket
        await adminClient
            .from('tickets_soporte')
            .update({ actualizado_en: new Date().toISOString() })
            .eq('id', params.ticketId);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
