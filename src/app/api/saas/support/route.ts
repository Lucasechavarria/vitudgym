import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET: Listar tickets
 * POST: Crear nuevo ticket
 */
export async function GET(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (authError) return authError;

        const adminClient = createAdminClient() as any;
        let query = adminClient.from('tickets_soporte').select(`
            *,
            perfiles (nombre_completo),
            gimnasios (nombre)
        `);

        // Si no es superadmin, solo ve los de su gimnasio
        if (profile.rol !== 'superadmin') {
            query = query.eq('gimnasio_id', profile.gimnasio_id);
        }

        const { data: tickets, error } = await query.order('creado_en', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ tickets });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'coach']);
        if (authError) return authError;

        const { asunto, prioridad, mensaje } = await request.json();

        if (!asunto || !mensaje) {
            return NextResponse.json({ error: 'Asunto y mensaje son obligatorios' }, { status: 400 });
        }

        const adminClient = createAdminClient() as any;

        // 1. Crear el Ticket
        const { data: ticket, error: ticketError } = await adminClient
            .from('tickets_soporte')
            .insert({
                gimnasio_id: profile.gimnasio_id,
                usuario_id: profile.id,
                asunto,
                prioridad: prioridad || 'media'
            })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 2. Crear primer mensaje
        const { error: msgError } = await adminClient
            .from('mensajes_soporte')
            .insert({
                ticket_id: ticket.id,
                remitente_id: profile.id,
                mensaje,
                es_del_staff_saas: false
            });

        if (msgError) throw msgError;

        return NextResponse.json({ success: true, ticketId: ticket.id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
