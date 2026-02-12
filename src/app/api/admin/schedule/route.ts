
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    try {
        const body = await request.json();

        // Validation could go here

        const { data, error } = await supabase
            .from('horarios_de_clase')
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (_error) {
        return NextResponse.json({ error: 'Error creating class' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const body = await request.json();

        const { data, error } = await supabase
            .from('horarios_de_clase')
            .update(body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (_error) {
        return NextResponse.json({ error: 'Error updating class' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    try {
        const { error } = await supabase
            .from('horarios_de_clase')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (_error) {
        return NextResponse.json({ error: 'Error deleting class' }, { status: 500 });
    }
}
