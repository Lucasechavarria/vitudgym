import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotificationService } from '@/services/notification.service';

/**
 * POST /api/marketing/process
 * Procesa campañas activas y envía notificaciones automáticas
 * Puede ser llamado por cron jobs o manualmente por admins
 */
export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Verificar autenticación (cron job o admin)
        const authHeader = req.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (authHeader !== `Bearer ${cronSecret}`) {
            // Si no es cron, verificar que sea admin
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError || !user) {
                return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
            }

            // Verificar rol de admin
            const { data: profile } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', user.id)
                .single();

            if (profile?.rol !== 'admin') {
                return NextResponse.json({ error: 'Requiere permisos de admin' }, { status: 403 });
            }
        }

        const results = {
            pagos_actualizados: 0,
            recordatorios_pago: 0,
            reengagement: 0,
            campanas_procesadas: 0,
        };

        // 1. Actualizar pagos vencidos
        const { data: pagosActualizados } = await supabase.rpc('actualizar_pagos_vencidos');
        results.pagos_actualizados = pagosActualizados || 0;

        // 2. Procesar recordatorios de pago
        const { data: recordatorios } = await supabase.rpc('notificar_pagos_proximos');
        results.recordatorios_pago = recordatorios || 0;

        // 3. Procesar re-engagement
        const { data: reengagement } = await supabase.rpc('notificar_usuarios_inactivos');
        results.reengagement = reengagement || 0;

        // 4. Procesar campañas activas
        const now = new Date().toISOString();
        const { data: campaigns } = await supabase
            .from('campanas_marketing')
            .select('*')
            .eq('estado', 'activa')
            .lte('fecha_inicio', now)
            .or(`fecha_fin.is.null,fecha_fin.gte.${now}`);

        if (campaigns && campaigns.length > 0) {
            const notificationService = await NotificationService.create();

            for (const campaign of campaigns) {
                try {
                    const users = await getSegmentedUsers(supabase, campaign.segmento);

                    let enviados = 0;
                    for (const userId of users) {
                        const result = await notificationService.sendToUser(userId, {
                            tipo: campaign.tipo,
                            titulo: campaign.mensaje_titulo,
                            cuerpo: campaign.mensaje_cuerpo,
                        });

                        if (result.sent) enviados++;
                    }

                    // Actualizar estadísticas de la campaña
                    await supabase
                        .from('campanas_marketing')
                        .update({
                            enviados: (campaign.enviados || 0) + enviados
                        })
                        .eq('id', campaign.id);

                    results.campanas_procesadas++;
                } catch (error) {
                    console.error(`Error procesando campaña ${campaign.id}:`, error);
                }
            }
        }

        return NextResponse.json({
            success: true,
            results,
            message: 'Procesamiento completado',
        });
    } catch (error) {
        console.error('[API] Error procesando campañas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

/**
 * Obtiene usuarios según criterios de segmentación
 */
async function getSegmentedUsers(supabase: any, segmento: any): Promise<string[]> {
    try {
        let query = supabase
            .from('perfiles')
            .select('id');

        // Aplicar filtros de segmentación
        if (segmento.rol) {
            query = query.eq('rol', segmento.rol);
        }

        if (segmento.objetivo_principal) {
            // Filtrar por objetivo
            const { data: objetivos } = await supabase
                .from('objetivos_del_usuario')
                .select('usuario_id')
                .eq('objetivo_principal', segmento.objetivo_principal)
                .eq('esta_activo', true);

            const userIds = objetivos?.map((o: any) => o.usuario_id) || [];
            if (userIds.length > 0) {
                query = query.in('id', userIds);
            } else {
                return [];
            }
        }

        if (segmento.dias_inactividad) {
            // Filtrar por inactividad
            const { data: inactivos } = await supabase.rpc(
                'detectar_usuarios_inactivos',
                { dias_inactividad: segmento.dias_inactividad }
            );

            const userIds = inactivos?.map((u: any) => u.usuario_id) || [];
            if (userIds.length > 0) {
                query = query.in('id', userIds);
            } else {
                return [];
            }
        }

        const { data: users } = await query;
        return users?.map((u: any) => u.id) || [];
    } catch (error) {
        console.error('Error en segmentación:', error);
        return [];
    }
}
