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
                        *
                    )
                )
            `)
            .order('id', { ascending: false } as any);

        if (dbError) throw dbError;

        // Formatear respuesta con tipos seguros
        const formattedUsers = (users as any[]).map(u => {
            // Find primary coach if exists
            const primaryRelation = u.relacion_alumno_coach?.find((r: any) => r.is_primary);
            const coachData = primaryRelation?.coach;
            const assignedCoachId = coachData?.id || null;

            // Normalizar email de usuario
            const userEmail = u.correo || u.email || '';
            const userName = u.nombre_completo || `${u.nombre || ''} ${u.apellido || ''}`.trim() || userEmail;

            // Normalizar el rol para el frontend
            const rawRole = (u.rol || '').toLowerCase();
            const normalizedRole = ['coach', 'profesor'].includes(rawRole) ? 'coach' :
                (['admin', 'administrador'].includes(rawRole) ? 'admin' : 'member');

            return {
                ...u,
                id: u.id,
                name: userName,
                email: userEmail,
                role: normalizedRole,
                membershipStatus: u.estado_membresia || 'inactive',
                membershipEnds: u.fecha_fin_membresia,
                assigned_coach_id: assignedCoachId
            };
        });

        return NextResponse.json({ users: formattedUsers });

    } catch (error) {
        console.error('❌ Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al obtener usuarios';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
