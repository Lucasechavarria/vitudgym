import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/challenges
 * Lista desafíos activos para alumnos
 */
export async function GET() {
    try {
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('desafios')
            .select(`
                *,
                participantes:participantes_desafio(*)
            `)
            .eq('estado', 'active')
            .order('fecha_fin', { ascending: true });

        if (error) throw error;

        return NextResponse.json({ challenges: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/challenges
 * Crea un nuevo desafío propuesto por un alumno
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

        const body = await req.json();
        const { title, description, type, points_prize, target_student_id, original_duration_days } = body;

        // Validaciones básicas
        if (!title || !description) {
            return NextResponse.json({ error: 'Título y descripción son requeridos' }, { status: 400 });
        }

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (original_duration_days || 7));

        const { data, error } = await supabase
            .from('desafios')
            .insert({
                titulo: title,
                descripcion: description,
                tipo: type || 'open',
                recompensa_puntos: points_prize || 100,
                creado_por: user.id,
                estado: 'pending', // Requiere aprobación de coach/admin
                fecha_fin: endDate.toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Auto-unir al creador al desafío
        await supabase
            .from('participantes_desafio')
            .insert({
                desafio_id: data.id,
                usuario_id: user.id,
                estado: 'enrolled'
            });

        return NextResponse.json({ success: true, challenge: data });

    } catch (error: any) {
        console.error('Create Challenge Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
