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

        console.log('🔍 Fetching students for coach:', user.id);

        // Obtener alumnos con su objetivo y rutina activa en UNA SOLA consulta (Optimización N+1)
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
                role,
                active_goal:user_goals(
                    id,
                    primary_goal,
                    target_date,
                    is_active
                ),
                active_routine:routines(
                    id,
                    name,
                    status,
                    is_active
                )
            `)
            .or('role.eq.member,role.eq.user') // Ampliado: acepta tanto member como user
            .order('full_name', { ascending: true });

        if (studentsError) {
            console.error('❌ Supabase error fetching students:', studentsError);
            throw studentsError;
        }

        console.log('✅ Students found:', students?.length || 0);

        // Limpiar la respuesta para que active_goal y active_routine solo contengan los ACTIVOS
        const studentsWithDetails = students.map(student => ({
            ...student,
            active_goal: Array.isArray(student.active_goal)
                ? student.active_goal.find((g: any) => g.is_active) || null
                : null,
            active_routine: Array.isArray(student.active_routine)
                ? student.active_routine.find((r: any) => r.is_active) || null
                : null,
        }));

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
