import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/challenges
 * Lista desafíos activos para alumnos
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('challenges')
            .select(`
                *,
                participants:challenge_participants(*)
            `)
            .eq('status', 'active')
            .order('end_date', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ challenges: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
