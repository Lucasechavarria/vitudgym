import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/challenges
 * Crea un nuevo desafío
 */
export async function POST(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const body = await request.json();
        const { title, description, rules, type, points_prize, end_date } = body;

        const { data, error: dbError } = await supabase!
            .from('challenges')
            .insert({
                created_by: user.id,
                judge_id: user.id, // Admin creator is the default judge
                title,
                description,
                rules: rules || 'Reglas estándar del gimnasio',
                type,
                points_reward: points_prize, // Match points_reward from supabase.ts
                end_date,
                status: 'active' // Set to active by default as requested
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating challenge:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/admin/challenges/list
 * Lista todos los desafíos para administración
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin', 'coach']);
        if (error) return error;

        const { data, error: dbError } = await supabase!
            .from('challenges')
            .select(`
                *,
                creator:profiles!challenges_created_by_fkey(full_name),
                judge:profiles!challenges_judge_id_fkey(full_name),
                participants:challenge_participants(
                    user_id,
                    current_score,
                    status,
                    user:profiles(full_name)
                )
            `)
            .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        return NextResponse.json({ challenges: data });
    } catch (error: any) {
        console.error('Error fetching challenges:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
