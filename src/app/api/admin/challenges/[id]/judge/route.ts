import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * PUT /api/admin/challenges/[id]/judge
 * Decide el ganador o finaliza el desafío
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (error) return error;

        const { id: challengeId } = await params;
        const { winnerId, status } = await request.json();

        // 1. Actualizar estado del desafío (columnas en español)
        const updateData: any = { estado: status || 'finished' };

        // Si estamos reiniciando, limpiamos el ganador
        if (status === 'active') {
            updateData.ganador_id = null;
        }

        const { error: challengeError } = await supabase!
            .from('desafios')          // antes: challenges
            .update(updateData)
            .eq('id', challengeId);

        if (challengeError) throw challengeError;

        if (status === 'active') {
            // Si reiniciamos, reseteamos a todos los participantes a 'inscrito'
            await supabase!
                .from('participantes_desafio')   // antes: challenge_participants
                .update({ estado: 'enrolled' })
                .eq('desafio_id', challengeId);  // antes: challenge_id

            return NextResponse.json({ success: true, message: 'Desafío reiniciado' });
        }

        if (winnerId) {
            // 2. Marcar al ganador en los participantes
            const { error: participantError } = await supabase!
                .from('participantes_desafio')   // antes: challenge_participants
                .update({ estado: 'winner' })
                .eq('desafio_id', challengeId)   // antes: challenge_id
                .eq('usuario_id', winnerId);      // antes: user_id

            if (participantError) throw participantError;

            // 3. Obtener puntos de recompensa del desafío
            const { data: challenge } = await supabase!
                .from('desafios')                // antes: challenges
                .select('puntos_recompensa')     // antes: points_reward
                .eq('id', challengeId)
                .single();

            // 4. Otorgar puntos al ganador via RPC
            await supabase!.rpc('incrementar_puntos', {
                usuario_id_param: winnerId,
                puntos_param: challenge?.puntos_recompensa || 100
            });

            // 5. Guardar el ganador_id en la tabla principal si es un duelo o queremos cerrarlo
            await supabase!
                .from('desafios')
                .update({ ganador_id: winnerId })
                .eq('id', challengeId);

            // 6. Notificar al alumno
            try {
                const { data: challenge } = await supabase!
                    .from('desafios')
                    .select('titulo')
                    .eq('id', challengeId)
                    .single();

                await supabase!.from('historial_notificaciones').insert({
                    usuario_id: winnerId,
                    tipo: 'logro',
                    titulo: '🏆 ¡Objetivo cumplido!',
                    cuerpo: `El profesor ha validado tu cumplimiento en el desafío "${challenge?.titulo || 'Desafío'}". ¡Has sumado puntos!`,
                    datos: { challengeId, type: 'challenge_approved' },
                    enviada: false
                });

                const pushBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
                fetch(`${pushBaseUrl}/api/push/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        recipientId: winnerId,
                        title: '🏆 ¡Objetivo Aprobado!',
                        body: `¡Felicidades! Se validó tu objetivo en: ${challenge?.titulo || 'el desafío'}`,
                        url: `/dashboard`
                    })
                }).catch(e => console.error('Error sending push:', e));
            } catch (notifError) {
                console.error('Error notifying student of approval:', notifError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error judging challenge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
