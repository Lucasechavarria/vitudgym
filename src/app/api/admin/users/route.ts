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
            ['admin', 'superadmin']
        );

        if (error) return error;

        // Obtener todos los usuarios con sus perfiles
        const { data: users, error: usersError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        return NextResponse.json({
            success: true,
            users
        });

    } catch (error: any) {
        console.error('Error loading users:', error);
        return NextResponse.json({
            error: error.message || 'Error loading users'
        }, { status: 500 });
    }
}
