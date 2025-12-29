import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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
            .from('profiles') // Changed 'profiles' to 'profiles' (no change here based on instruction, but snippet showed 'class_schedules')
            .select('waiver_accepted')
            .eq('id', user.id)
            .single();

        // Process Attendance Data for Chart
        const attendanceByMonth = processAttendance(bookings || []);

        return NextResponse.json({
            progress: measurements || [],
            attendance: attendanceByMonth,
            routine: activeRoutine || null,
            profile: {
                waiver_accepted: profile?.waiver_accepted || false
            }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function processAttendance(bookings: any[]) {
    // Implement logic to group bookings by month
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const result = bookings.reduce((acc: any, booking: any) => {
        const date = new Date(booking.date);
        const month = months[date.getMonth()];
        if (!acc[month]) acc[month] = 0;
        acc[month]++;
        return acc;
    }, {});

    return months.map(m => ({ month: m, rate: result[m] || 0 })); // Simplified rate logic, returns count for now
}
