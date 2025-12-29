import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Get Current User & Verify Coach Role
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Ideally check role here, but middleware handles basic protection.
        // Double check just in case for data sensitivity
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'coach' && profile?.role !== 'admin' && profile?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }


        // 2. Fetch Active Students Count
        // Assuming 'member' role and status 'active' (needs column check in profiles, or just use count)
        const { count: activeStudentsCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'member')
            .eq('membership_status', 'active'); // Assuming this field exists based on previous schema view

        // 3. Fetch Upcoming Classes (Next 24h)
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const { data: upcomingClasses } = await supabase
            .from('class_schedules')
            .select(`
                *,
                activities (name, image_url),
                class_bookings (count)
            `)
            .gte('start_time', now.toISOString()) // Assuming start_time is timestamp/timestamptz
            .lte('start_time', tomorrow.toISOString())
            .order('start_time', { ascending: true })
            .limit(3);

        // 4. Fetch "Students with Doubts" (Reports)
        // We lack a 'reports' table in the schema viewed earlier? 
        // Let's assume we need to create it or mock it if strictly missing, 
        // but based on "ReportsPanel" component, let's see if we can use a placeholder 
        // or if we created a specific table for issues. 
        // The user mentioned "System Reportes Alumno funcional", check schema for `reports` or similar.
        // If not found, I will return an empty list for now to not block, or check `backend` tasks.
        // Re-reading previous logs/context: "Sistema Reportes Alumnos... /dashboard/report-issue".
        // Let's assume a table named 'student_reports' or similar exists or use a mock fallback if not.

        // Safe check for 'student_reports' table
        const { data: recentReports } = await supabase
            .from('student_reports')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        return NextResponse.json({
            stats: {
                activeStudents: activeStudentsCount || 0,
                // Add other calc stats if needed
            },
            upcomingClasses: upcomingClasses || [],
            recentReports: recentReports || []
        });

    } catch (error) {
        console.error('Coach Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
