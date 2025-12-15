
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Fetch Key Metrics

        // Active Members (Total Profiles)
        const { count: totalMembers, error: membersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');

        // New Members (This Month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newMembers, error: newMembersError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user')
            .gte('created_at', startOfMonth.toISOString());

        // Attendance (Bookings this month)
        // Since we don't have this table populated yet, it will return 0, which is correct.
        const { count: attendanceCount, error: attendanceError } = await supabase
            .from('class_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'attended')
            .gte('date', startOfMonth.toISOString());

        // Revenue (Estimated: Members * $30)
        // In reality this should come from a payments table, but for now we estimate.
        const MONTHLY_FEE = 30000; // CLP or local currency
        const revenue = (totalMembers || 0) * MONTHLY_FEE;

        // 2. Fetch Chart Data (Last 6 months growth)
        // This is a bit complex in pure Supabase API without SQL functions. 
        // For now, let's mock the history based on current count or just return simple data.
        // To do it strictly "Real", we would need a 'created_at' histogram.
        // We will fetch all users created_at dates and aggregate in JS for simplicity (assuming < 10k users).

        const { data: userDates } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('role', 'user')
            .order('created_at', { ascending: true });

        // Aggregate by month
        const growthData = processGrowthData(userDates || []);

        return NextResponse.json({
            metrics: {
                revenue,
                active_members: totalMembers || 0,
                new_members: newMembers || 0,
                attendance_rate: attendanceCount || 0 // Could be % if we had total classes capacity
            },
            charts: {
                growth: growthData,
                revenue: growthData.map(d => ({ ...d, value: d.value * MONTHLY_FEE }))
            }
        });

    } catch (error) {
        console.error('Reports Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function processGrowthData(data: { created_at: string }[]) {
    // Group by Month-Year
    const months: Record<string, number> = {};
    const today = new Date();

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        months[key] = 0;
    }

    // Accumulate actual data
    data.forEach(u => {
        const d = new Date(u.created_at);
        // Only count if within last 6 months logic for simple chart
        // Actually, for "Total Members" growth, it should be cumulative.
        // For simplicity, let's just return the histogram of *new* users per month for now, 
        // or cumulative if requested.
        // Let's do cumulative total up to that month.
    });

    // Actually, simpler approach for the chart:
    // Just map the existing 'months' keys we initialized to random-ish real data or 
    // real counts if we want to be strict.
    // Given we likely have very few users in DB, let's just return the raw counts per month.

    const stats = data.reduce((acc: any, curr) => {
        const d = new Date(curr.created_at);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    // Merge with last 6 months keys to ensure continuity
    return Object.keys(months).map(key => ({
        name: key,
        value: stats[key] || 0
    }));
}
