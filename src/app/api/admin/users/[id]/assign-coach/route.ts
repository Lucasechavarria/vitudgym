import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * PUT /api/admin/users/[id]/assign-coach
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const { id: userId } = await params;
        const body = await request.json();
        const { coachId } = body;

        console.log(`🚀 [ASSIGN] Unificando asignación: User=${userId}, Coach=${coachId}`);

        // Usamos el cliente administrativo para saltar RLS y problemas de caché
        const adminClient = createAdminClient();

        // PASO 1: Desvincular cualquier coach primario actual del alumno
        const { error: deactivateError } = await (adminClient
            .from('relacion_alumno_coach') as any)
            .update({ is_primary: false })
            .eq('user_id', userId)
            .eq('is_primary', true);

        if (deactivateError) {
            console.error('❌ [ASSIGN] Error desactivando primarios previos:', deactivateError);
        }

        // PASO 2: Asignar el nuevo coach
        if (coachId && coachId !== "null" && coachId !== "") {
            const { error: upsertError } = await (adminClient
                .from('relacion_alumno_coach') as any)
                .upsert({
                    user_id: userId,
                    coach_id: coachId,
                    is_primary: true,
                    is_active: true,
                    assigned_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id, coach_id'
                });

            if (upsertError) {
                console.error('❌ [ASSIGN] Error en UPSERT:', upsertError);
                return NextResponse.json({ error: upsertError.message }, { status: 500 });
            }
            console.log(`✅ [ASSIGN] Coach ${coachId} asignado correctamente.`);
        } else {
            console.log(`ℹ️ [ASSIGN] Alumno ${userId} sin coach.`);
        }

        return NextResponse.json({
            success: true,
            message: coachId ? 'Coach asignado correctamente' : 'Coach desvinculado correctamente'
        });

    } catch (error) {
        console.error('❌ [ASSIGN] Error crítico:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}
