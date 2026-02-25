import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseUserProfile } from '@/types/user';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/users/list
 * 
 * Devuelve lista de usuarios con su estado de membresía.
 * Acceso: Admin, Superadmin
 */
export async function GET(request: Request) {
    try {
        const { error: authError, profile } = await authenticateAndRequireRole(request, ['admin', 'coach', 'superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient();

        // Obtener el contexto actual del que hace la petición
        const { data: requester } = await (adminClient
            .from('perfiles') as any)
            .select('rol, gimnasio_id')
            .eq('id', profile.id)
            .single();

        let query = (adminClient
            .from('perfiles') as any)
            .select(`
                *,
                gimnasios (nombre),
                relacion_alumno_coach!usuario_id (
                    es_principal,
                    entrenador_id,
                    coach:perfiles!entrenador_id (
                        id,
                        nombre_completo,
                        correo
                    )
                )
            `);

        // Si es Admin o Coach, solo puede ver usuarios de su gimnasio
        // Si es Superadmin, ve los del gimnasio que tenga seleccionado actualmente
        if (requester?.gimnasio_id) {
            query = query.eq('gimnasio_id', requester.gimnasio_id);
        }

        const { data: users, error: dbError } = await query
            .order('creado_en', { ascending: false });

        if (dbError) {
            console.error('❌ Error en DB query:', dbError);
            // Fallback si falla el JOIN (posiblemente por desajuste de schema extremo)
            const fallback = await adminClient.from('perfiles').select('*');
            if (fallback.error) throw fallback.error;
            return NextResponse.json({ users: fallback.data.map(u => normalizeUser(u)) });
        }

        const formattedUsers = (users as any[]).map(u => normalizeUser(u));
        return NextResponse.json({ users: formattedUsers });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error fetching users:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

function normalizeUser(u: any) {
    const relations = (u.relacion_alumno_coach as any[]) || [];

    const primaryRelation = relations.find((r: any) =>
        r.is_primary === true ||
        r.es_principal === true ||
        (r.is_primary === undefined && r.es_principal === undefined && relations.length === 1)
    );

    // Extraer ID del coach (aceptamos múltiples nombres de columna por seguridad)
    const assignedCoachId = primaryRelation?.coach_id ||
        primaryRelation?.entrenador_id ||
        primaryRelation?.coach?.id ||
        null;

    if (primaryRelation) {
        console.log(`🔍 [DEBUG] Alumno ${u.id}: Coach ${assignedCoachId} (Primario encontrado)`);
    } else if (relations.length > 0) {
        console.warn(`⚠️ [DEBUG] Alumno ${u.id}: Tiene ${relations.length} relaciones pero NINGUNA es primaria.`);
    }

    // Normalizar datos de perfil
    const userEmail = u.correo || u.email || '';
    const userName = u.nombre_completo || `${u.nombre || ''} ${u.apellido || ''}`.trim() || userEmail;

    // Normalizar el rol
    const rawRole = (u.rol || '').toLowerCase();
    const normalizedRole = ['coach', 'profesor', 'entrenador'].includes(rawRole) ? 'coach' :
        (['admin', 'administrador'].includes(rawRole) ? 'admin' :
            (['superadmin'].includes(rawRole) ? 'superadmin' : 'member'));

    return {
        ...u,
        id: u.id,
        name: userName,
        email: userEmail,
        role: normalizedRole as SupabaseUserProfile['role'],
        membershipStatus: u.estado_membresia || 'inactive',
        membershipEnds: u.fecha_fin_membresia,
        assigned_coach_id: assignedCoachId,
        gym: u.gimnasios?.nombre
    };
}
