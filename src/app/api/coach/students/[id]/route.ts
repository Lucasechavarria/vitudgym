import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/coach/students/[id]
 * 
 * Obtiene información completa de un alumno (solo coach/admin)
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['coach', 'admin', 'superadmin']
        );

        if (error) return error;

        const studentId = params.id;

        // Obtener perfil completo del alumno
        const { data: student, error: studentError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single();

        if (studentError) throw studentError;

        // Obtener rutinas del alumno
        const { data: routines, error: routinesError } = await supabase
            .from('routines')
            .select('id, name, status, created_at')
            .eq('user_id', studentId)
            .order('created_at', { ascending: false });

        if (routinesError) throw routinesError;

        return NextResponse.json({
            success: true,
            student,
            routines: routines || []
        });

    } catch (error: any) {
        console.error('Error loading student:', error);
        return NextResponse.json({
            error: error.message || 'Error loading student'
        }, { status: 500 });
    }
}
