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

/**
 * POST /api/challenges
 * Crea un nuevo desafío propuesto por un alumno
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json();
        const { title, description, type, points_prize, target_student_id, original_duration_days } = body;

        // Validaciones básicas
        if (!title || !description) {
            return NextResponse.json({ error: 'Título y descripción son requeridos' }, { status: 400 });
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (original_duration_days || 7));

        const { data, error } = await supabase
            .from('challenges')
            .insert({
                title,
                description,
                type: type || 'open',
                points_reward: points_prize || 100,
                created_by: user.id,
                status: 'pending', // Requiere aprobación de coach/admin
                end_date: endDate.toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-unir al creador al desafío
        await supabase
            .from('challenge_participants')
            .insert({
                challenge_id: data.id,
                user_id: user.id,
                status: 'enrolled'
            });

        return NextResponse.json({ success: true, challenge: data });

    } catch (error: any) {
        console.error('Create Challenge Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
