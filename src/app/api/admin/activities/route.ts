import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// GET: List all activities
export async function GET() {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('actividades')
            .select('*')
            .order('nombre', { ascending: true });

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
        if (!body.nombre) {
            return NextResponse.json({ error: 'Nombre is required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('actividades')
            .insert([
                {
                    nombre: body.nombre,
                    descripcion: body.descripcion,
                    color: body.color || '#3b82f6',
                    duration_minutes: body.duration_minutes || 60,
                    tipo: body.tipo || 'CLASS',
                    categoria: body.categoria || 'General',
                    esta_activa: true
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
                nombre: body.nombre,
                descripcion: body.descripcion,
                color: body.color,
                duration_minutes: body.duration_minutes,
                tipo: body.tipo,
                categoria: body.categoria,
                esta_activa: body.esta_activa
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
