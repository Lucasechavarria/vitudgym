import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    try {
        const { data: tickets, error: ticketsError } = await supabase
            .from('tickets_soporte_saas')
            .select(`
                *,
                gimnasio:gimnasio_id (nombre, logo_url),
                perfil:usuario_id (nombre_completo, correo, url_avatar)
            `)
            .order('creado_en', { ascending: false });

        if (ticketsError) throw ticketsError;

        return NextResponse.json({ tickets });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
