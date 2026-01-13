import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify User is Authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify Requester is Admin/SuperAdmin
        const { data: requesterProfile } = await supabase
            .from('perfiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAuthorized = requesterProfile &&
            ['admin', 'superadmin'].includes(requesterProfile.role);

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Forbidden: Requires Admin privileges' }, { status: 403 });
        }

        // 3. Parse Body
        const { uid, role } = await request.json();

        if (!uid || !role) {
            return NextResponse.json({ error: 'Missing uid or role' }, { status: 400 });
        }

        const validRoles = ['user', 'coach', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 4. Update Target User Profile
        // Assuming RLS allows admins to update profiles, or using Service Role if RLS prevents it.
        // For now, try standard client. If RLS fails, we might need a Service Role client.
        const { error: updateError } = await supabase
            .from('perfiles')
            .update({ role: role })
            .eq('id', uid);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Role ${role} assigned to ${uid}` });

    } catch (error: any) {
        console.error('Error in set-role:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

