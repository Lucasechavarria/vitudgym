import { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';

/**
 * Dynamic PWA Manifest
 * Generates a gym-specific manifest.json based on the requesting gym's slug.
 * Gyms can be identified by their custom domain or slug cookie.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
    // Defaults (fallback para el gym principal)
    let gymName = 'Virtud Gym';
    let gymShortName = 'Virtud';
    let themeColor = '#6d28d9';
    let backgroundColor = '#000000';

    try {
        const headersList = await headers();
        const host = headersList.get('host') || '';
        const slugCookie = headersList.get('x-gym-slug') || '';

        // Intentar resolver el gym por host o por slug
        const supabase = createAdminClient();
        let query = supabase
            .from('gimnasios')
            .select('nombre, slug, color_primario, logo_url, es_activo')
            .eq('es_activo', true);

        if (slugCookie) {
            query = query.eq('slug', slugCookie);
        } else if (host && !host.includes('localhost') && !host.includes('vercel')) {
            // En producción, intentar resolver por host custom
            query = query.or(`slug.eq.${host.split('.')[0]}`);
        }

        const { data: gym } = await query.single() as { data: { nombre: string; slug: string; color_primario: string; logo_url: string | null; es_activo: boolean } | null };

        if (gym) {
            gymName = gym.nombre;
            gymShortName = gym.nombre.split(' ')[0]; // Primera palabra como short name
            themeColor = gym.color_primario || themeColor;
        }
    } catch {
        // Si falla, usar defaults — no bloquear la app
    }

    return {
        name: gymName,
        short_name: gymShortName,
        description: `${gymName} — Gestión integral de tu entrenamiento con inteligencia artificial.`,
        start_url: '/',
        display: 'standalone',
        background_color: backgroundColor,
        theme_color: themeColor,
        orientation: 'portrait',
        scope: '/',
        lang: 'es',
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore — 'purpose' está en la especificación pero tipado incompleto en Next
                purpose: 'any maskable',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                // @ts-ignore
                purpose: 'any maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Mi Dashboard',
                url: '/dashboard',
                description: 'Ver mi progreso',
                icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
            },
            {
                name: 'Mi Rutina',
                url: '/dashboard/routine',
                description: 'Ver mi rutina de hoy',
                icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }],
            },
        ],
        categories: ['fitness', 'health', 'sports'],
    };
}
