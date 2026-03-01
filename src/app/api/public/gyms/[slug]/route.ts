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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                planes: planes_gimnasio(
                  id,
                  nombre,
                  descripcion,
                  precio,
                  duracion_meses,
                  beneficios
                )
            `)
            .eq('slug', params.slug)
            .eq('planes_gimnasio.esta_activo', true)
            .single();

        if (error || !gym) {
            return NextResponse.json({ error: 'Gimnasio no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ gym });
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
