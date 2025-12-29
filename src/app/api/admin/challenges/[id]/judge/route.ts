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

        // 1. Actualizar estado del desafío
        const updateData: any = { status: status || 'finished' };

        // Si estamos reiniciando, limpiamos el ganador
        if (status === 'active') {
            updateData.winner_id = null;
        }

        const { error: challengeError } = await supabase!
            .from('challenges')
            .update(updateData)
            .eq('id', challengeId);

        if (challengeError) throw challengeError;

        if (status === 'active') {
            // Si reiniciamos, reseteamos a todos los participantes a 'enrolled'
            await supabase!
                .from('challenge_participants')
                .update({ status: 'enrolled' })
                .eq('challenge_id', challengeId);

            return NextResponse.json({ success: true, message: 'Desafío reiniciado' });
        }

        if (winnerId) {
            // 2. Marcar al ganador en los participantes
            const { error: participantError } = await supabase!
                .from('challenge_participants')
                .update({ status: 'winner' })
                .eq('challenge_id', challengeId)
                .eq('user_id', winnerId);

            if (participantError) throw participantError;

            // 3. Otorgar puntos al ganador
            const { data: challenge } = await supabase!
                .from('challenges')
                .select('points_reward')
                .eq('id', challengeId)
                .single();

            await supabase!.rpc('increment_points', {
                user_id_param: winnerId,
                points_param: challenge?.points_reward || 100
            });

            // También guardamos el winner_id en la tabla principal
            await supabase!
                .from('challenges')
                .update({ winner_id: winnerId })
                .eq('id', challengeId);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error judging challenge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
