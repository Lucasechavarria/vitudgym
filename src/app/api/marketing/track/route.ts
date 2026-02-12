import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/marketing/track
 * Registra eventos de engagement de usuarios
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { tipo_evento, metadatos } = await req.json();

        // Validar tipo de evento
        const tiposValidos = ['login', 'sesion', 'pago', 'clase', 'mensaje', 'notificacion_abierta'];
        if (!tiposValidos.includes(tipo_evento)) {
            return NextResponse.json(
                { error: 'Tipo de evento no válido' },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from('historial_engagement')
            .insert({
                usuario_id: user.id,
                tipo_evento,
                metadatos: metadatos || {},
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error tracking engagement:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/marketing/track
 * Obtiene historial de engagement del usuario actual
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const tipo = searchParams.get('tipo');

        let query = supabase
            .from('historial_engagement')
            .select('*')
            .eq('usuario_id', user.id)
            .order('fecha_evento', { ascending: false })
            .limit(limit);

        if (tipo) {
            query = query.eq('tipo_evento', tipo);
        }

        const { data: events, error } = await query;

        if (error) throw error;

        return NextResponse.json({ events: events || [] });
    } catch (error) {
        console.error('[API] Error obteniendo engagement:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
