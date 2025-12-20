import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/challenges/[id]/join
 * Permite a un alumno unirse a un desafío
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { challengeId } = body;

        if (!challengeId) {
            return NextResponse.json({ error: 'ID de desafío es requerido' }, { status: 400 });
        }

        // Verificar si ya participa
        const { data: existing } = await supabase
            .from('challenge_participants')
            .select('*')
            .eq('challenge_id', challengeId)
            .eq('user_id', user.id)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Ya estás participando en este desafío' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('challenge_participants')
            .insert({
                challenge_id: challengeId,
                user_id: user.id,
                status: 'enrolled'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error joining challenge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
