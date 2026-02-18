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
            .select('*')
            .in('rol', ['coach', 'admin', 'profesor', 'Coach', 'Admin', 'Profesor'])
            .order('id', { ascending: true } as any);

        if (dbError) throw dbError;

        // Normalizar los roles y datos en la respuesta para el frontend de forma ultra-resiliente
        const normalizedCoaches = (coaches as any[])?.map(c => {
            const email = c.correo || c.email || '';
            const nombre = c.nombre_completo || `${c.nombre || ''} ${c.apellido || ''}`.trim() || email;

            return {
                id: c.id,
                nombre_completo: nombre,
                email: email,
                rol: ['coach', 'profesor', 'Coach', 'Profesor'].includes(c.rol) ? 'coach' : 'admin'
            };
        });

        return NextResponse.json({ coaches: normalizedCoaches });

    } catch (error: any) {
        console.error('Error fetching coaches:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
