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
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'coach']);
        if (error) return error;

        const { data: users, error: dbError } = await supabase!
            .from('perfiles')
            .select(`
                *,
                relacion_alumno_coach (
                    is_primary,
                    coach:perfiles!coach_id (
                        id,
                        nombre_completo,
                        email:correo
                    )
                )
            `)
            .order('creado_en', { ascending: false });

        if (dbError) throw dbError;

        // Formatear respuesta con tipos seguros
        const formattedUsers = (users as any[]).map(u => {
            // Find primary coach if exists
            const primaryRelation = u.relacion_alumno_coach?.find((r: any) => r.is_primary);
            const assignedCoachId = primaryRelation?.coach?.id || null;

            return {
                ...u,
                id: u.id,
                name: u.nombre_completo || 'Sin Nombre',
                email: u.email || u.correo, // Fallback to correo if email is missing (perfiles has 'correo')
                role: u.rol,
                membershipStatus: u.estado_membresia || 'inactive',
                membershipEnds: u.fecha_fin_membresia,
                assigned_coach_id: assignedCoachId // Compatibility field
            };
        });

        return NextResponse.json({ users: formattedUsers });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener usuarios';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
