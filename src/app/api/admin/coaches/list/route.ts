import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/coaches/list
 * 
 * Devuelve lista de usuarios que pueden ser asignados como coaches (coach, admin, superadmin).
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'coach']);
        if (error) return error;

        const { data: coaches, error: dbError } = await supabase!
            .from('perfiles')
            .select('id, nombre, apellido, correo, rol')
            .in('rol', ['coach', 'admin', 'profesor', 'Coach', 'Admin', 'Profesor'])
            .order('nombre', { ascending: true });

        if (dbError) throw dbError;

        // Normalizar los roles y datos en la respuesta para el frontend
        const normalizedCoaches = (coaches as any[])?.map(c => ({
            id: c.id,
            nombre_completo: `${c.nombre || ''} ${c.apellido || ''}`.trim() || c.correo,
            email: c.correo || '',
            rol: ['coach', 'profesor', 'Coach', 'Profesor'].includes(c.rol) ? 'coach' : 'admin'
        }));

        return NextResponse.json({ coaches: normalizedCoaches });

    } catch (error: any) {
        console.error('Error fetching coaches:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
