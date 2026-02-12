import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createClient();

    try {
        const { data: schedule, error } = await supabase
            .from('horarios_de_clase')
            .select(`
        id,
        dia_de_la_semana,
        hora_inicio,
        hora_fin,
        esta_activa,
        notas_entrenador,
        actividades (
          id,
          nombre,
          color,
          duracion_minutos
        ),
        perfiles (
          id,
          nombre_completo,
          email,
          rol
        )
      `)
            .eq('esta_activa', true)
            .order('dia_de_la_semana', { ascending: true })
            .order('hora_inicio', { ascending: true });

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
