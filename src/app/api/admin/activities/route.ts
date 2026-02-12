import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all activities
export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('actividades')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (_error) {
        return NextResponse.json({ error: _error instanceof Error ? _error.message : 'Unknown error' }, { status: 500 });
    }
}

// POST: Create a new activity
export async function POST(req: Request) {
    const supabase = await createClient();
    const body = await req.json();

    try {
        // Validate required fields
        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('actividades')
            .insert([
                {
                    name: body.name,
                    description: body.description,
                    color: body.color || '#3b82f6',
                    duration_minutes: body.duration_minutes || 60,
                    type: body.type || 'CLASS',
                    category: body.category || 'General',
                    is_active: true
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

// PUT: Update an activity
export async function PUT(req: Request) {
    const supabase = await createClient();
    const body = await req.json();

    try {
        if (!body.id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('actividades')
            .update({
                name: body.name,
                description: body.description,
                color: body.color,
                duration_minutes: body.duration_minutes,
                type: body.type,
                category: body.category,
                is_active: body.is_active
            })
            .eq('id', body.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

// DELETE: Delete an activity (Caution: Cascades to schedule)
export async function DELETE(req: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('actividades')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
