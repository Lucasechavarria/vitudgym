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
            ['member']
        );

        if (error) return error;

        // Mock data - en producción vendría de la base de datos
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
            measurements: [
                { date: '2024-01-01', chest: 100, waist: 85, hips: 95, arms: 35, legs: 55 },
                { date: '2024-03-01', chest: 102, waist: 82, hips: 94, arms: 36, legs: 56 },
            ]
        };

        return NextResponse.json({
            success: true,
            progress
        });

    } catch (error: any) {
        console.error('Error loading progress:', error);
        return NextResponse.json({
            error: error.message || 'Error loading progress'
        }, { status: 500 });
    }
}
