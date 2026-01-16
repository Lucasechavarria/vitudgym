import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/coach/students
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin']
        );

        if (error) return error;
        if (!supabase) throw new Error('Supabase client not initialized');

        // 1. Obtener perfiles (En producción hay: admin, superadmin, coach. Permitimos todos para pruebas)
        const { data: profiles, error: profilesError } = await supabase
            .from('perfiles')
            .select('id, email, full_name, avatar_url, onboarding_completed, medical_info, emergency_contact, role')
            .order('full_name', { ascending: true });

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ success: true, students: [] });
        }

        const studentIds = profiles.map(p => p.id);

        // 2. Obtener objetivos activos
        const { data: allGoals, error: goalsError } = await supabase
            .from('objetivos_del_usuario')
            .select('id, user_id, primary_goal, target_date, is_active')
            .in('user_id', studentIds);

        if (goalsError) console.error('Error fetching goals:', goalsError);

        // 3. Obtener rutinas activas
        const { data: allRoutines, error: routinesError } = await supabase
            .from('rutinas')
            .select('id, user_id, name, status, is_active')
            .in('user_id', studentIds);

        if (routinesError) console.error('Error fetching routines:', routinesError);

        // 4. Mapear resultados
        const studentsWithDetails = profiles.map(profile => {
            const activeGoal = allGoals?.find(g => g.user_id === profile.id && g.is_active) || null;
            const activeRoutine = allRoutines?.find(r => r.user_id === profile.id && r.is_active) || null;

            return {
                ...profile,
                active_goal: activeGoal,
                active_routine: activeRoutine
            };
        });

        return NextResponse.json({
            success: true,
            students: studentsWithDetails,
        });

    } catch (error) {
        console.error('❌ Error fatal loading students:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Error interno al cargar alumnos'
        }, { status: 500 });
    }
}
