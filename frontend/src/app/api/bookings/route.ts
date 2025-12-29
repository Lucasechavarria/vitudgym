
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('schedule_id');

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let query = supabase.from('class_bookings').select('*').eq('user_id', user.id);

        if (scheduleId) {
            query = query.eq('class_schedule_id', scheduleId);
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
            .from('class_bookings')
            .select('*')
            .eq('user_id', user.id)
            .eq('class_schedule_id', schedule_id)
            .eq('date', date)
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Already booked' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('class_bookings')
            .insert({
                user_id: user.id,
                class_schedule_id: schedule_id,
                date: date,
                status: 'confirmed'
            })
            .select()
            .single();

        if (error) throw error;

        // Award points for booking (Gamification)
        const { error: gamificationError } = await supabase.rpc('increment_points', {
            user_id_param: user.id,
            points_param: 10
        });

        // Fallback if RPC doesn't exist (safety, though we should prefer RPC or direct update)
        if (gamificationError) {
            // Try direct update if RPC missing
            const { data: currentStats } = await supabase
                .from('user_gamification')
                .select('points')
                .eq('user_id', user.id)
                .single();

            if (currentStats) {
                await supabase
                    .from('user_gamification')
                    .update({ points: (currentStats.points || 0) + 10 })
                    .eq('user_id', user.id);
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
            .from('class_bookings')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id); // Ensure user owns booking

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Error cancelling booking' }, { status: 500 });
    }
}
