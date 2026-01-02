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
            .eq('role', 'member')
            .eq('user_goals.is_active', true)
            .eq('routines.is_active', true)
            .order('created_at', { ascending: false });

        if (studentsError) throw studentsError;

        // Limpiar la respuesta para que active_goal y active_routine no sean arrays (Supabase devuelve arrays en joins)
        const studentsWithDetails = students.map(student => ({
            ...student,
            active_goal: student.active_goal?.[0] || null,
            active_routine: student.active_routine?.[0] || null,
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
