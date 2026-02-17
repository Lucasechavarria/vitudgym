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
            .select('id, nombre_completo, email:correo, rol')
            .or('rol.ilike.coach,rol.ilike.profesor,rol.ilike.admin')
            .order('nombre_completo', { ascending: true });

        if (dbError) throw dbError;

        // Normalizar los roles en la respuesta para el frontend
        const normalizedCoaches = coaches?.map(c => ({
            ...c,
            rol: ['coach', 'profesor'].includes(c.rol?.toLowerCase()) ? 'coach' : 'admin'
        }));

        return NextResponse.json({ coaches: normalizedCoaches });

    } catch (error: any) {
        console.error('Error fetching coaches:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
