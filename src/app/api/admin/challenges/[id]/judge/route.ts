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
        const { error: challengeError } = await supabase!
            .from('challenges')
            .update({ status: status || 'finished' })
            .eq('id', challengeId);

        if (challengeError) throw challengeError;

        if (winnerId) {
            // 2. Marcar al ganador en los participantes
            const { error: participantError } = await supabase!
                .from('challenge_participants')
                .update({ status: 'winner' })
                .eq('challenge_id', challengeId)
                .eq('user_id', winnerId);

            if (participantError) throw participantError;

            // 3. Otorgar puntos al ganador consumiendo el RPC increment_points
            const { data: challenge } = await supabase!
                .from('challenges')
                .select('points_prize')
                .eq('id', challengeId)
                .single();

            await supabase!.rpc('increment_points', {
                user_id_param: winnerId,
                points_param: challenge?.points_prize || 100
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error judging challenge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
