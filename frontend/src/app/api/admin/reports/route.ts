
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        // 1. Fetch Key Metrics
        const { count: totalMembers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { count: newMembers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'user')
            .gte('created_at', startOfMonth.toISOString());

        const { count: attendanceCount } = await supabase
            .from('class_bookings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'attended')
            .gte('date', startOfMonth.toISOString());

        // Revenue & Expenses from Payments Table
        const { data: allPayments, error: paymentsError } = await supabase
            .from('payments')
            .select('amount, created_at, status')
            .eq('status', 'approved');

        if (paymentsError) throw paymentsError;

        const totalRevenue = (allPayments || [])
            .filter(p => p.amount > 0)
            .reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = (allPayments || [])
            .filter(p => p.amount < 0)
            .reduce((sum, p) => sum + Math.abs(p.amount), 0);

        const netRevenue = totalRevenue - totalExpenses;

        const { data: userDates } = await supabase
            .from('profiles')
            .select('created_at')
            .eq('role', 'user')
            .order('created_at', { ascending: true });

        const growthData = processGrowthData(userDates || []);

        return NextResponse.json({
            metrics: {
                revenue: totalRevenue,
                expenses: totalExpenses,
                net: netRevenue,
                active_members: totalMembers || 0,
                new_members: newMembers || 0,
                attendance_rate: attendanceCount || 0
            },
            charts: {
                growth: growthData,
                revenue: processRevenueGrowth(allPayments || [])
            }
        });

    } catch (error) {
        console.error('Reports Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function processGrowthData(data: { created_at: string }[]) {
    const months: Record<string, number> = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        months[key] = 0;
    }

    data.forEach(u => {
        const d = new Date(u.created_at);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        if (months[key] !== undefined) months[key] += 1;
    });

    return Object.keys(months).map(key => ({
        name: key,
        value: months[key]
    }));
}

function processRevenueGrowth(payments: any[]) {
    const months: Record<string, number> = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        months[key] = 0;
    }

    payments.forEach(p => {
        const d = new Date(p.created_at);
        const key = d.toLocaleString('es-ES', { month: 'short' });
        if (months[key] !== undefined) {
            months[key] += p.amount;
        }
    });

    return Object.keys(months).map(key => ({
        name: key,
        value: months[key]
    }));
}
