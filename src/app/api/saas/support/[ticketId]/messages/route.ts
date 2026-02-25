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
        const { error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const adminClient = createAdminClient();

        // Obtener el perfil completo del usuario
        const { data: profile, error: profileError } = await adminClient
            .from('perfiles')
            .select('id, rol, gimnasio_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'No se encontró el perfil del usuario' }, { status: 404 });
        }

        // Verificar acceso al ticket
        if (profile.rol !== 'superadmin') {
            const { data: ticket, error: ticketCheckError } = await adminClient
                .from('tickets_soporte_saas')
                .select('gimnasio_id')
                .eq('id', params.ticketId)
                .single();

            if (ticketCheckError || !ticket) {
                return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
            }

            if (ticket.gimnasio_id !== profile.gimnasio_id) {
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
        console.error('❌ Error fetching support messages:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { ticketId: string } }
) {
    try {
        const { error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { mensaje } = await request.json();
        if (!mensaje) {
            return NextResponse.json({ error: 'El mensaje es obligatorio' }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // Obtener el perfil completo del usuario
        const { data: profile, error: profileError } = await adminClient
            .from('perfiles')
            .select('id, rol, gimnasio_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'No se encontró el perfil del usuario' }, { status: 404 });
        }

        // Verificar acceso al ticket si no es superadmin
        if (profile.rol !== 'superadmin') {
            const { data: ticket, error: ticketCheckError } = await adminClient
                .from('tickets_soporte_saas')
                .select('gimnasio_id')
                .eq('id', params.ticketId)
                .single();

            if (ticketCheckError || !ticket) {
                return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
            }

            if (ticket.gimnasio_id !== profile.gimnasio_id) {
                return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
            }
        }

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
            .from('tickets_soporte_saas')
            .update({ actualizado_en: new Date().toISOString() })
            .eq('id', params.ticketId);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error sending support message:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
