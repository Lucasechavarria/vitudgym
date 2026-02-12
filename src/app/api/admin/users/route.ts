import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/users
 * 
 * Obtiene lista de todos los usuarios (solo admin/superadmin)
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin']
        );

        if (error) return error;

        // Obtener todos los usuarios con sus perfiles
        const { data: users, error: usersError } = await supabase
            .from('perfiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        return NextResponse.json({
            success: true,
            users
        });

    } catch (_error) {
        const err = _error as Error;
        console.error('❌ Error getting users:', err);
        return NextResponse.json({
            error: err.message || 'Error getting users'
        }, { status: 500 });
    }
}
