import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { logger } from '@/lib/logger';

/**
 * GET /api/admin/coaches/list
 * Devuelve lista de usuarios que pueden ser asignados como coaches.
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'coach', 'superadmin']);
        if (error) return error;

        const { data: coaches, error: dbError } = await supabase!
            .from('perfiles')
            .select('id, nombre_completo, nombre, apellido, correo, rol')
            .in('rol', ['coach', 'admin', 'superadmin']);

        if (dbError) {
            logger.error('Error fetching coaches list', { error: dbError.message });
            return NextResponse.json({ coaches: [] }, { status: 500 });
        }

        return NextResponse.json({ coaches: normalizeCoaches(coaches || []) });

    } catch (error: any) {
        logger.error('Error crítico fetching coaches', { error: error.message });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function normalizeCoaches(data: any[]) {
    return data
        .filter(c => ['coach', 'admin', 'superadmin'].includes(c.rol))
        .map(c => ({
            id: c.id,
            nombre_completo: c.nombre_completo || `${c.nombre || ''} ${c.apellido || ''}`.trim() || c.correo,
            email: c.correo || '',
            rol: c.rol === 'coach' ? 'coach' : 'admin'
        }));
}
