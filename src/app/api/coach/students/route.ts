import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { userGoalsService } from '@/services/user-goals.service';

/**
 * GET /api/coach/students
 * 
 * Obtiene la lista de alumnos del coach
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin', 'superadmin']
        );

        if (error) return error;

        // Obtener todos los alumnos (miembros)
        const { data: students, error: studentsError } = await supabase
            .from('profiles')
            .select(`
                id,
                email,
                full_name,
                avatar_url,
                onboarding_completed,
                medical_info,
                emergency_contact,
                role
            `)
            .eq('role', 'member')
            .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;

        // Para cada alumno, obtener su objetivo activo y rutina activa
        const studentsWithDetails = await Promise.all(
            students.map(async (student) => {
                // Obtener objetivo activo
                const activeGoal = await userGoalsService.getActiveGoal(student.id);

                // Obtener rutina activa
                const { data: activeRoutine } = await supabase
                    .from('routines')
                    .select('id, name, status')
                    .eq('user_id', student.id)
                    .eq('is_active', true)
                    .single();

                return {
                    ...student,
                    active_goal: activeGoal,
                    active_routine: activeRoutine,
                };
            })
        );

        return NextResponse.json({
            success: true,
            students: studentsWithDetails,
        });

    } catch (error) {
        console.error('❌ Error loading students:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar lista de alumnos';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
