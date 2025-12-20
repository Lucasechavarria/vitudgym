import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { ROLES } from '@/lib/constants/app';

// GET /api/admin/reports/tickets - List all tickets
export async function GET(req: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(req, [ROLES.ADMIN, ROLES.SUPERADMIN]);
        if (authError) return authError;

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('student_reports')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database Error:', error);
            throw error;
        }

        return NextResponse.json(data);

    } catch (error) {
        console.error('Tickets API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH /api/admin/reports/tickets - Update ticket status/response
export async function PATCH(req: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(req, [ROLES.ADMIN, ROLES.SUPERADMIN]);
        if (authError) return authError;

        const body = await req.json();
        const { id, status, admin_response } = body;

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('student_reports')
            .update({
                status,
                admin_response,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Update Error:', error);
            throw error;
        }

        return NextResponse.json({ success: true, ticket: data });

    } catch (error) {
        console.error('Tickets API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
