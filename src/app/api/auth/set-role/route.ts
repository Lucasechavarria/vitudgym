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
            .select('rol')
            .eq('id', user.id)
            .single();

        const isAuthorized = requesterProfile &&
            ['admin'].includes(requesterProfile.rol);

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Forbidden: Requires Admin privileges' }, { status: 403 });
        }

        // 3. Parse Body
        const { uid, role } = await request.json();

        if (!uid || !role) {
            return NextResponse.json({ error: 'Missing uid or role' }, { status: 400 });
        }

        const validRoles = ['member', 'coach', 'admin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // 4. Update Target User Profile
        // Assuming RLS allows admins to update profiles, or using Service Role if RLS prevents it.
        // For now, try standard client. If RLS fails, we might need a Service Role client.
        const { error: updateError } = await supabase
            .from('perfiles')
            .update({ rol: role })
            .eq('id', uid);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Role ${role} assigned to ${uid}` });

    } catch (_error) {
        const err = _error as Error;
        console.error('Error in set-role:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

