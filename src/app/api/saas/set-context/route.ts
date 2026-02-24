import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/saas/set-context
 * Establece el gimnasio y sucursal activo para la sesión (vía profile update por ahora para persistencia)
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { gymId, branchId } = await request.json();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Actualizamos el perfil con el gimnasio/sucursal "seleccionado"
        // Nota: En un SaaS avanzado usaríamos cookies de sesión para no mutar el perfil base,
        // pero para esta etapa, mutar el perfil asegura que se mantenga entre dispositivos.
        const { error } = await supabase
            .from('perfiles')
            .update({
                gimnasio_id: gymId,
                sucursal_id: branchId
            })
            .eq('id', user.id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Set Context Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
