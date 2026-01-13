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
            .from('perfiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (usersError) throw usersError;

        return NextResponse.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('❌ Error creating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error creating user';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
