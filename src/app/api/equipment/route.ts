import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { ROLES } from '@/lib/constants/app';

// GET /api/equipment - List all equipment
export async function GET(req: Request) {
    try {
        const supabase: any = await createClient();
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const available = searchParams.get('available');

        let query = supabase.from('equipamiento').select('*').order('name');

        if (category) query = query.eq('category', category);
        if (available) query = query.eq('is_available', available === 'true');

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/equipment - Create equipment (Admin only)
export async function POST(req: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(req, [ROLES.ADMIN]);
        if (authError) return authError;

        const body = await req.json();
        const supabase: any = await createClient();

        const { data, error } = await supabase
            .from('equipamiento' as any)
            .insert(body)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating equipment' }, { status: 500 });
    }
}

// PATCH /api/equipment - Update equipment (Admin full, Coach partial)
export async function PATCH(req: Request) {
    try {
        // Minimum role is COACH
        const supabase: any = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase
            .from('perfiles')
            .select('role')
            .eq('id', user.id)
            .single() as any;

        if (!profile || ![ROLES.COACH, ROLES.ADMIN].includes(profile.role)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // If role is COACH, they can only update condition and is_available
        if (profile.role === ROLES.COACH) {
            const allowedUpdates = ['condition', 'is_available', 'last_maintenance'];
            const keys = Object.keys(updates);
            const isAllowed = keys.every(k => allowedUpdates.includes(k));

            if (!isAllowed) {
                return NextResponse.json({ error: 'Coach can only update condition/availability' }, { status: 403 });
            }
        }

        const { data, error } = await supabase
            .from('equipamiento' as any)
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating equipment' }, { status: 500 });
    }
}

// DELETE /api/equipment - Delete equipment (Admin only)
export async function DELETE(req: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(req, [ROLES.ADMIN]);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const supabase: any = await createClient();
        const { error } = await supabase.from('equipamiento').delete().eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting equipment' }, { status: 500 });
    }
}
