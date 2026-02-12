import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/student/progress
 * 
 * Obtiene datos de progreso del alumno
 */
export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['member', 'coach', 'admin']
        );

        if (error) return error;

        // Obtener mediciones reales
        const { data: measurements } = await supabase
            .from('mediciones')
            .select('*')
            .eq('usuario_id', user.id)
            .order('registrado_en', { ascending: true });

        // Mock data fallback or mix
        const progress = {
            weight_history: [
                { date: '2024-01-01', weight: 80 },
                { date: '2024-02-01', weight: 78.5 },
                { date: '2024-03-01', weight: 77 },
                { date: '2024-04-01', weight: 76 },
                { date: '2024-05-01', weight: 75.5 },
            ],
            completed_workouts: 45,
            total_workouts: 60,
            current_streak: 7,
            best_streak: 12,
            measurements: measurements || [] // Use fetched data, or an empty array if null
        };

        return NextResponse.json({
            success: true,
            progress
        });

    } catch (error) {
        console.error('❌ Error loading progress:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar progreso';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
