import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: schedule, error } = await supabase
            .from('horarios_de_clase')
            .select(`
        id,
        day_of_week,
        start_time,
        end_time,
        is_active,
        notes,
        actividades (
          id,
          name,
          color,
          duration_minutes
        ),
        perfiles (
          id,
          full_name,
          email,
          role
        )
      `)
            .eq('is_active', true)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching schedule:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(schedule);
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
