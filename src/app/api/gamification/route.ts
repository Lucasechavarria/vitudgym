
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 1. Fetch My Stats
        const { data: myStats } = await supabase
            .from('gamificacion_del_usuario')
            .select('*')
            .eq('usuario_id', user.id)
            .single();

        // 2. Fetch My Achievements
        const { data: myAchievements } = await supabase
            .from('logros_del_usuario')
            .select('*, logros(*)')
            .eq('usuario_id', user.id);

        // 3. Fetch Leaderboard (Top 10)
        const { data: leaderboard } = await supabase
            .from('gamificacion_del_usuario')
            .select('puntos, racha_actual, perfiles(nombre_completo, url_avatar)')
            .order('puntos', { ascending: false })
            .limit(10);

        // 4. Determine Rank (Logic duplicated from frontend or shared lib? Let's just return raw points for now)

        return NextResponse.json({
            stats: myStats ? {
                puntos: myStats.puntos || 0,
                racha_actual: myStats.racha_actual || 0,
                nivel: myStats.nivel || 1
            } : { puntos: 0, racha_actual: 0, nivel: 1 },
            achievements: myAchievements || [],
            leaderboard: leaderboard?.map((l: { puntos?: number; racha_actual?: number; perfiles?: any }) => {
                const profile = Array.isArray(l.perfiles) ? l.perfiles[0] : l.perfiles;
                return {
                    name: profile?.nombre_completo || 'Usuario',
                    points: l.puntos || 0,
                    streak: l.racha_actual || 0,
                    avatar: profile?.url_avatar || 'U'
                };
            }) || []
        });

    } catch (_error) {
        console.error('Gamification API Error:', _error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
