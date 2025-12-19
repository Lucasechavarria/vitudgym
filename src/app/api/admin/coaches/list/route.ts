import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/coaches/list
 * 
 * Devuelve lista de usuarios que pueden ser asignados como coaches (coach, admin, superadmin).
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { data: coaches, error: dbError } = await supabase!
            .from('profiles')
            .select('id, full_name, email, role')
            .in('role', ['coach', 'admin', 'superadmin'])
            .order('full_name', { ascending: true });

        if (dbError) throw dbError;

        return NextResponse.json({ coaches });

    } catch (error: any) {
        console.error('Error fetching coaches:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
