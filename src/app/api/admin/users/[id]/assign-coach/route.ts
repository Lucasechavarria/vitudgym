import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logger';

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

        logger.info(`🚀 [ASSIGN] Unificando asignación: User=${userId}, Coach=${coachId}`);

        // Usamos el cliente administrativo para saltar RLS y problemas de caché
        const adminClient = createAdminClient();

        // PASO ATÓMICO: Primero eliminamos CUALQUIER relación previa de este alumno
        // Ahora usamos usuario_id (confirmado en la base de datos)
        const { error: deleteError } = await (adminClient
            .from('relacion_alumno_coach') as any)
            .delete()
            .eq('usuario_id', userId);

        if (deleteError) {
            logger.error('❌ [ASSIGN] Error en DELETE previo:', { error: deleteError });
            return NextResponse.json({
                error: 'Error limpiando relaciones previas',
                details: deleteError.message
            }, { status: 500 });
        }

        // PASO 2: Insertar la nueva relación si se especificó un coach
        let finalData = null;
        if (coachId && coachId !== "null" && coachId !== "") {
            const { data: insertData, error: insertError } = await (adminClient
                .from('relacion_alumno_coach') as any)
                .insert({
                    usuario_id: userId,
                    entrenador_id: coachId,
                    es_principal: true,
                    esta_activo: true,
                    asignado_en: new Date().toISOString()
                })
                .select();

            if (insertError) {
                logger.error('❌ [ASSIGN] Error en INSERT definitivo:', { error: insertError });
                return NextResponse.json({
                    error: 'Error al insertar la nueva relación',
                    details: insertError.message
                }, { status: 500 });
            }

            finalData = insertData;
            logger.info(`✅ [ASSIGN] Éxito Global. DB Insertó (Esquema Español Real):`, { insertData });
        } else {
            logger.info(`ℹ️ [ASSIGN] El alumno ${userId} ha quedado sin coach (Atomic Delete Only).`);
        }

        return NextResponse.json({
            success: true,
            message: coachId ? 'Coach asignado correctamente' : 'Coach desvinculado correctamente',
            debug: finalData
        });

    } catch (error) {
        logger.error('❌ [ASSIGN] Error crítico:', { error: error instanceof Error ? error.message : error });
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}
