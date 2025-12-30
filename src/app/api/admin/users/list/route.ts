import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import type { SupabaseUserProfile } from '@/types/user.ts';

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
        // Formatear respuesta con tipos seguros
        const formattedUsers = (users as SupabaseUserProfile[]).map(u => ({
            ...u, // Include ALL profile fields
            id: u.id,
            name: u.full_name || 'Sin Nombre',
            email: u.email,
            role: u.role,
            membershipStatus: u.membership_status || 'inactive',
            membershipEnds: u.membership_end_date
        }));

        return NextResponse.json({ users: formattedUsers });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener usuarios';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
