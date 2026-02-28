import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    const supabase = await createClient();
    const { slug } = params;

    const { data: gym, error } = await supabase
        .from('gimnasios')
        .select('nombre, color_primario, logo_url')
        .eq('slug', slug)
        .single();

    if (error || !gym) {
        return new NextResponse(JSON.stringify({ error: 'Gym not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const manifest = {
        name: gym.nombre,
        short_name: gym.nombre,
        description: `App oficial de ${gym.nombre} - Gestionado por Virtud Gym`,
        start_url: `/login?gym=${slug}`,
        display: "standalone",
        background_color: "#121212",
        theme_color: gym.color_primario || "#fbbf24",
        icons: [
            {
                src: gym.logo_url || "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: gym.logo_url || "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png"
            }
        ]
    };

    return NextResponse.json(manifest);
}
