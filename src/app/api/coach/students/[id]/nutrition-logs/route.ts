import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient();
        const studentId = params.id;

        // Verificar sesión y rol de coach
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

        const { data: profile } = await supabase
            .from('perfiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

        if (profile?.rol !== 'coach' && profile?.rol !== 'admin') {
            return NextResponse.json({ error: 'Prohibido' }, { status: 403 });
        }

        const { data: logs, error } = await supabase
            .from('registros_nutricion')
            .select('*')
            .eq('usuario_id', studentId)
            .order('creado_en', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, logs });
    } catch (error: any) {
        console.error('Error fetching student nutrition logs:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
