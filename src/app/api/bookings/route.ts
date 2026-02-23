
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('schedule_id');

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let query = supabase.from('reservas_de_clase').select('*').eq('usuario_id', user.id);

        if (scheduleId) {
            query = query.eq('horario_clase_id', scheduleId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching bookings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { schedule_id, date } = await request.json();

        // Check if already booked
        const { data: existing } = await supabase
            .from('reservas_de_clase')
            .select('*')
            .eq('usuario_id', user.id)
            .eq('horario_clase_id', schedule_id)
            .eq('fecha', date)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already booked' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('reservas_de_clase')
            .insert({
                usuario_id: user.id,
                horario_clase_id: schedule_id,
                fecha: date,
                estado: 'confirmed'
            })
            .select()
            .single();

        if (error) throw error;

        // Award points for booking (Gamification)
        const { error: gamificationError } = await supabase.rpc('incrementar_puntos', {
            usuario_id_param: user.id,
            puntos_param: 10
        });

        // Fallback if RPC doesn't exist (safety, though we should prefer RPC or direct update)
        if (gamificationError) {
            // Try direct update if RPC missing
            const { data: currentStats } = await supabase
                .from('gamificacion_del_usuario')
                .select('puntos')
                .eq('usuario_id', user.id)
                .single();

            if (currentStats) {
                await supabase
                    .from('gamificacion_del_usuario')
                    .update({ puntos: (currentStats.puntos || 0) + 10 })
                    .eq('usuario_id', user.id);
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error booking class' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const { error } = await supabase
            .from('reservas_de_clase')
            .delete()
            .eq('id', id)
            .eq('usuario_id', user.id); // Ensure user owns booking

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error cancelling booking' }, { status: 500 });
    }
}
