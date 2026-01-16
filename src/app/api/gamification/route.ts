
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch My Stats
        const { data: myStats } = await supabase
            .from('gamificación_del_usuario')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // 2. Fetch My Achievements
        const { data: myAchievements } = await supabase
            .from('logros_del_usuario')
            .select('*, logros(*)')
            .eq('user_id', user.id);

        // 3. Fetch Leaderboard (Top 10)
        const { data: leaderboard } = await supabase
            .from('gamificación_del_usuario')
            .select('points, current_streak, perfiles(first_name, last_name, avatar_url)')
            .order('points', { ascending: false })
            .limit(10);

        // 4. Determine Rank (Logic duplicated from frontend or shared lib? Let's just return raw points for now)

        return NextResponse.json({
            stats: myStats || { points: 0, current_streak: 0, level: 1 },
            achievements: myAchievements || [],
            leaderboard: leaderboard?.map((l: any) => {
                const profile = Array.isArray(l.perfiles) ? l.perfiles[0] : l.perfiles;
                return {
                    name: `${profile?.first_name || 'Usuario'} ${profile?.last_name || ''}`,
                    points: l.points,
                    streak: l.current_streak,
                    avatar: profile?.avatar_url || profile?.first_name?.[0] || 'U'
                };
            }) || []
        });

    } catch (error) {
        console.error('Gamification API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
