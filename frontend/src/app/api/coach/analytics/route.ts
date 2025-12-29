import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const viewMode = searchParams.get('mode') || 'individual'; // individual, group

        // 1. Auth & Verify Coach
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'coach' && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Attendance Data
        let attendanceQuery = supabase
            .from('class_bookings')
            .select('date, status')
            .in('status', ['attended', 'confirmed', 'no_show']);

        if (studentId && viewMode === 'individual') {
            attendanceQuery = attendanceQuery.eq('user_id', studentId);
        }

        const { data: bookings } = await attendanceQuery;
        const attendanceMetrics = processAttendance(bookings || []);

        // 3. Fetch Measurements / Physical Progress
        let measurementsData = [];
        if (studentId && viewMode === 'individual') {
            const { data } = await supabase
                .from('measurements')
                .select('*')
                .eq('user_id', studentId)
                .order('recorded_at', { ascending: true });
            measurementsData = data || [];
        } else {
            // Global averages or summary if needed
        }

        // 4. Fetch Training Volume (Prescribed)
        let volumeData = [];
        const { data: upcomingClasses } = await supabase
            .from('class_schedules')
            .select(`
                *,
                activities (name, image_url),
                class_bookings (count)
            `);
        let routinesQuery = supabase
            .from('routines')
            .select(`
                id,
                name,
                user_id,
                exercises (sets, reps)
            `)
            .eq('is_active', true);

        if (studentId && viewMode === 'individual') {
            routinesQuery = routinesQuery.eq('user_id', studentId);
        }

        const { data: routines } = await routinesQuery;

        // Simplified volume calculation: sum of sets * reps
        const totalPrescribedVolume = routines?.reduce((acc, routine: any) => {
            const routineVolume = routine.exercises?.reduce((sAcc: number, ex: any) => {
                const reps = parseInt(ex.reps) || 10;
                return sAcc + (ex.sets * reps);
            }, 0) || 0;
            return acc + routineVolume;
        }, 0) || 0;

        return NextResponse.json({
            success: true,
            metrics: {
                attendance: attendanceMetrics,
                measurements: measurementsData,
                prescribedVolume: totalPrescribedVolume,
                summary: {
                    attendanceRate: calculateAttendanceRate(bookings || []),
                    totalAttended: bookings?.filter(b => b.status === 'attended').length || 0,
                }
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        const { searchParams } = new URL(req.url);
        const Sentry = require('@sentry/nextjs');
        Sentry.captureException(error, {
            extra: {
                studentId: searchParams.get('studentId'),
                mode: searchParams.get('mode')
            }
        });
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function processAttendance(bookings: any[]) {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();

    const result = bookings.reduce((acc: any, booking: any) => {
        const date = new Date(booking.date);
        if (date.getFullYear() !== currentYear) return acc;

        const month = months[date.getMonth()];
        if (!acc[month]) acc[month] = { month, attended: 0, total: 0 };

        acc[month].total++;
        if (booking.status === 'attended') acc[month].attended++;
        return acc;
    }, {});

    return months.map(m => {
        const data = result[m] || { month: m, attended: 0, total: 0 };
        return {
            month: m,
            rate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0
        };
    });
}

function calculateAttendanceRate(bookings: any[]) {
    if (!bookings.length) return 0;
    const attended = bookings.filter(b => b.status === 'attended').length;
    return Math.round((attended / bookings.length) * 100);
}
