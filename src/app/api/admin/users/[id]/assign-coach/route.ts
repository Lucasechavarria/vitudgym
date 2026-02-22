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

        console.log(`🚀 [BYPASS RPC] Iniciando asignación manual: User=${userId}, Coach=${coachId}`);
        console.log(`🚀 [BYPASS CACHE] Usando tabla original restaurada: relacion_alumno_coach`);

        // Usamos el cliente administrativo para saltar RLS y problemas de caché
        const adminClient = createAdminClient();

        // PASO 1: Quitar primario anterior en la NUEVA tabla
        const { error: updateError } = await (adminClient
            .from('relacion_alumno_coach') as any)
            .update({ is_primary: false })
            .eq('user_id', userId)
            .eq('is_primary', true);

        if (updateError) {
            console.error('❌ Error desvinculando coach anterior:', updateError);
            throw new Error(`Error desvinculando coach anterior: ${updateError.message}`);
        }

        // PASO 2: Asignar nuevo en la NUEVA tabla
        if (coachId) {
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
                console.error('❌ Error asignando nuevo coach:', upsertError);
                throw new Error(`Error asignando nuevo coach: ${upsertError.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: coachId ? 'Coach asignado correctamente' : 'Coach desvinculado correctamente'
        });

    } catch (error) {
        console.error('❌ Error assigning coach (CATCH):', error);
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
