import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/notifications/history
 * Obtiene el historial de notificaciones del usuario actual
 */
export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Obtener parámetros de query
        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const tipo = searchParams.get('tipo');

        let query = supabase
            .from('historial_notificaciones')
            .select('*')
            .eq('usuario_id', user.id)
            .order('creado_en', { ascending: false })
            .limit(limit);

        // Filtrar por tipo si se especifica
        if (tipo) {
            query = query.eq('tipo', tipo);
        }

        const { data, error } = await query;

        if (error) {
            console.error('[API] Error obteniendo historial:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API] Error en GET /api/notifications/history:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
