import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkGymLimits } from '@/lib/saas/limits';

/**
 * POST /api/admin/users/create
 * Crea un nuevo alumno verificando los límites del plan SaaS
 */
export async function POST(request: Request) {
    try {
        const { supabase, error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const { email, password, fullName, rol = 'member' } = await request.json();

        if (!email || !fullName) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // 1. Obtener el gimnasio del admin
        const { data: profile } = await adminClient
            .from('perfiles')
            .select('gimnasio_id')
            .eq('id', user.id)
            .single();

        if (!profile?.gimnasio_id) {
            return NextResponse.json({ error: 'Admin sin gimnasio asignado' }, { status: 403 });
        }

        const gymId = profile.gimnasio_id;

        // 2. VERIFICAR LÍMITES (HARD ENFORCEMENT)
        const limits = await checkGymLimits(gymId);

        if (!limits.canAddUser) {
            return NextResponse.json({
                error: 'Límite de alumnos alcanzado',
                details: `Tu plan actual permite hasta ${limits.limitUsers} socios. Por favor, sube de nivel tu plan en Configuración > Facturación.`,
                reason: limits.reason
            }, { status: 403 });
        }

        // 3. Crear usuario en Auth
        const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-8), // Generar pass si no hay
            email_confirm: true,
            user_metadata: { nombre_completo: fullName }
        });

        if (createError) throw createError;

        // 4. Crear perfil vinculado al gimnasio
        const { error: profileError } = await adminClient
            .from('perfiles')
            .insert({
                id: authData.user.id,
                correo: email,
                nombre_completo: fullName,
                rol: rol as any,
                gimnasio_id: gymId
            });

        if (profileError) {
            await adminClient.auth.admin.deleteUser(authData.user.id);
            throw profileError;
        }

        return NextResponse.json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: { id: authData.user.id, email, fullName }
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create User Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
