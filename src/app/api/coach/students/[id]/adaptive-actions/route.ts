import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const studentId = params.id;
        const { suggestionId, action, suggestionData } = await req.json();

        // 1. Verificar sesión y rol
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        // 2. Lógica de Negocio según acción
        if (action === 'apply') {
            // TODO: Integrar con actualización de planes reales en el futuro
            // Por ahora registramos la acción en una tabla de auditoría o log de coach
            console.log(`Aplicando sugerencia ${suggestionId} para alumno ${studentId}`);

            // Ejemplo de inserción en log de actividad
            await supabase.from('actividad_coach').insert({
                coach_id: session.user.id,
                alumno_id: studentId,
                tipo: 'ia_apply',
                detalle: { suggestion: suggestionData }
            });

        } else if (action === 'discard') {
            console.log(`Descartando sugerencia ${suggestionId} para alumno ${studentId}`);

            await supabase.from('actividad_coach').insert({
                coach_id: session.user.id,
                alumno_id: studentId,
                tipo: 'ia_discard',
                detalle: { suggestionId }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error in adaptive-actions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
