import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/public/gyms/[slug]
 * Retorna datos públicos de un gimnasio para su landing page.
 */
export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const adminClient = createAdminClient() as any;

        const { data: gym, error } = await adminClient
            .from('gimnasios')
            .select(`
                nombre,
                slug,
                logo_url,
                color_primario,
                color_secundario,
                config_visual,
                config_landing,
                planes: planes_suscripcion(
                  id,
                  nombre,
                  descripcion,
                  precio,
                  duracion_meses,
                  beneficios
                )
            `)
            .eq('slug', params.slug)
            .eq('planes_suscripcion.esta_activo', true)
            .single();

        if (error || !gym) {
            return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ gym });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
