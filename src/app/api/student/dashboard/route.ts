import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ClassBooking } from '@/types/analytics';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Get Current User
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Progress (Measurements)
        const { data: measurements } = await supabase
            .from('measurements')
            .select('*')
            .eq('user_id', user.id)
            .order('recorded_at', { ascending: true })
            .limit(10);

        // 3. Fetch Recent Attendance (Bookings)
        const { data: bookings } = await (supabase
            .from('class_bookings') as any) // Changed 'class_bookings' to 'class_bookings' (no change here based on instruction, but snippet showed 'class_schedules')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'attended')
            .gte('date', new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString());

        // 4. Fetch Active Routine
        const { data: activeRoutine } = await supabase
            .from('routines')
            .select(`
                *,
                exercises (*)
            `)
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

        // 5. Fetch Profile Status
        const { data: profile } = await supabase
            .from('profiles')
            .select('waiver_accepted, full_name, avatar_url, membership_end_date, gender')
            .eq('id', user.id)
            .single();

        // 6. Fetch Workout Volume (New - Functional Training)
        const { data: sessionLogs } = await supabase
            .from('workout_sessions')
            .select(`
                id,
                start_time,
                logs:exercise_performance_logs(
                    actual_reps,
                    actual_weight,
                    actual_sets
                )
            `)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('start_time', { ascending: true })
            .limit(20);

        // Process Attendance Data for Chart
        const bookingsData: Pick<ClassBooking, 'date'>[] = bookings || [];
        const attendanceByMonth = processAttendance(bookingsData);

        // Process Volume Data for Chart
        const volumeByWeek = processVolume(sessionLogs || []);

        return NextResponse.json({
            progress: measurements || [],
            attendance: attendanceByMonth,
            routine: activeRoutine || null,
            volume: volumeByWeek,
            profile: {
                ...profile,
                waiver_accepted: profile?.waiver_accepted || false
            }
        });

    } catch (error) {
        console.error('❌ Dashboard API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar dashboard';
        return NextResponse.json({
            error: 'Internal Server Error',
            message: errorMessage
        }, { status: 500 });
    }
}

/**
 * Procesa datos de asistencia y agrupa por mes
 * @param bookings - Array de bookings (solo necesita date)
 * @returns Array con conteo de asistencias por mes
 */
function processAttendance(bookings: Pick<ClassBooking, 'date'>[]): Array<{ month: string; rate: number }> {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    // Validación de entrada
    if (!Array.isArray(bookings)) {
        console.warn('⚠️ processAttendance recibió datos inválidos');
        return months.map(m => ({ month: m, rate: 0 }));
    }

    const result = bookings.reduce((acc: Record<string, number>, booking) => {
        // Validar estructura del booking
        if (!booking || !booking.date) {
            console.warn('⚠️ Booking sin fecha:', booking);
            return acc;
        }

        const date = new Date(booking.date);

        // Validar fecha válida
        if (isNaN(date.getTime())) {
            console.warn('⚠️ Fecha inválida en booking:', booking.date);
            return acc;
        }

        const month = months[date.getMonth()];
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
    }, {});

    return months.map(m => ({ month: m, rate: result[m] || 0 }));
}

/**
 * Calcula el tonelaje total (volumen) por sesión
 */
function processVolume(sessions: any[]): Array<{ week: string; volume: number }> {
    return sessions.map(session => {
        let totalVolume = 0;
        session.logs?.forEach((log: any) => {
            // we assume actual_reps is numeric for volume calculation if possible
            const reps = parseInt(log.actual_reps) || 0;
            const weight = parseFloat(log.actual_weight) || 0;
            const sets = parseInt(log.actual_sets) || 1;
            totalVolume += (reps * weight * sets);
        });

        return {
            week: new Date(session.start_time).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
            volume: Math.round(totalVolume)
        };
    });
}
