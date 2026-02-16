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
            .select('id, email:correo, nombre_completo, url_avatar, onboarding_completado, informacion_medica, contacto_emergencia, rol')
            .order('nombre_completo', { ascending: true });

        if (profilesError) throw profilesError;

        if (!profiles || profiles.length === 0) {
            return NextResponse.json({ success: true, students: [] });
        }

        const studentIds = profiles.map(p => p.id);

        // 2. Obtener objetivos activos
        const { data: allGoals, error: goalsError } = await supabase
            .from('objetivos_del_usuario')
            .select('id, usuario_id, objetivo_principal, fecha_objetivo, esta_activo')
            .in('usuario_id', studentIds);

        if (goalsError) console.error('Error fetching goals:', goalsError);

        // 3. Obtener rutinas activas
        const { data: allRoutines, error: routinesError } = await supabase
            .from('rutinas')
            .select('id, usuario_id, nombre, estado, esta_activa')
            .in('usuario_id', studentIds);

        if (routinesError) console.error('Error fetching routines:', routinesError);

        // 4. Mapear resultados
        const studentsWithDetails = profiles.map(profile => {
            const activeGoal = allGoals?.find(g => g.usuario_id === profile.id && g.esta_activo) || null;
            const activeRoutine = allRoutines?.find(r => r.usuario_id === profile.id && r.esta_activa) || null;

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
