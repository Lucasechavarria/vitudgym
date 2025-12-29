import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/users/list
 * 
 * Devuelve lista de usuarios con su estado de membresía.
 * Acceso: Admin, Superadmin
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (error) return error;

        // Fetch users
        // Nota: En Supabase Auth no podemos listar usuarios directamente desde el cliente sin service role key o funcion RPC.
        // Pero tenemos la tabla 'profiles' que es publica/accesible.
        // Asumimos que profiles tiene todos los usuarios.

        const { data: users, error: dbError } = await supabase!
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        // Formatear respuesta
        const formattedUsers = users.map((u: any) => ({
            ...u, // Include ALL profile fields (medical_info, etc.)
            id: u.id,
            name: u.full_name || 'Sin Nombre',
            email: u.email,
            role: u.role,
            membershipStatus: u.membership_status || 'inactive',
            membershipEnds: u.membership_end_date
        }));

        return NextResponse.json({ users: formattedUsers });

    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
