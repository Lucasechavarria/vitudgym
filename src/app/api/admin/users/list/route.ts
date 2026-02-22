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
                asignaciones_coaches (
                    is_primary,
                    coach:perfiles!coach_id (
                        *
                    )
                )
            `)
            .order('created_at' as any, { ascending: false }); // Usar created_at real

        if (dbError) {
            console.error('❌ Error en DB:', dbError);
            // Fallback si falla el JOIN o el order
            const fallback = await supabase!.from('perfiles').select('*');
            if (fallback.error) throw fallback.error;
            return NextResponse.json({ users: fallback.data.map(u => normalizeUser(u)) });
        }

        const formattedUsers = (users as any[]).map(u => normalizeUser(u));
        return NextResponse.json({ users: formattedUsers });

    } catch (error: any) {
        console.error('❌ Error fetching users:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function normalizeUser(u: any) {
    const primaryRelation = u.asignaciones_coaches?.find((r: any) => r.is_primary);
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
}
