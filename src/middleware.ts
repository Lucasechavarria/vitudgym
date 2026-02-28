import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

// Mapeo de rutas que requieren módulos activos para poder accederse
const MODULE_ROUTES: Record<string, string> = {
    '/admin/nutrition': 'nutricion_ia',
    '/dashboard/nutrition': 'nutricion_ia',
    '/coach/vision': 'vision_ia',
    '/dashboard/vision': 'vision_ia',
    '/admin/challenges': 'gamificacion',
    '/dashboard/progress': 'gamificacion',
    '/admin/finance': 'pagos_online',
    '/coach/routines': 'rutinas_ia',
    '/dashboard/routine': 'rutinas_ia',
    '/admin/activities': 'clases_reserva',
    '/schedule': 'clases_reserva',
    '/dashboard/classes': 'clases_reserva',
};

export async function middleware(request: NextRequest) {
    // Saltar si faltan variables de entorno
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return NextResponse.next({ request: { headers: request.headers } });
    }

    try {
        const response = NextResponse.next({ request: { headers: request.headers } });
        const supabase = createMiddlewareClient(request, response);
        const { data: { user }, error } = await supabase.auth.getUser();
        const { pathname } = request.nextUrl;

        // Rutas públicas — no requieren auth
        const publicRoutes = ['/', '/login', '/signup', '/auth/callback'];
        const isPublicRoute = publicRoutes.includes(pathname);

        // Sin sesión → redirigir al login
        if ((!user || error) && !isPublicRoute) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // Si hay usuario, obtener su perfil para el header del manifest
        if (user) {
            const { data: profile } = await supabase
                .from('perfiles')
                .select('gimnasio_id, gimnasios(slug)')
                .eq('id', user.id)
                .single();

            if (profile && (profile as any).gimnasios?.slug) {
                // Inyectar el slug en los headers para que manifest.ts lo lea
                request.headers.set('x-gym-slug', (profile as any).gimnasios.slug);
            }
        }

        // Si no hay usuario, terminar aquí (ruta pública)
        if (!user) return response;

        // ────────────────────────────────────────────────────
        // OBTENER ROL Y GIMNASIO DEL USUARIO
        // ────────────────────────────────────────────────────
        let userRole: string | null = null;
        let gymId: string | null = null;

        const { data: profile } = await supabase
            .from('perfiles')
            .select('rol, gimnasio_id')
            .eq('id', user.id)
            .single();

        if (profile) {
            userRole = profile.rol;
            gymId = profile.gimnasio_id;
        }

        // Fallback a metadata si la DB falla (ej: primer login antes de que el trigger corra)
        if (!userRole) {
            userRole = user.app_metadata?.rol
                || user.user_metadata?.rol
                || user.app_metadata?.role
                || user.user_metadata?.role
                || null;
        }

        // ────────────────────────────────────────────────────
        // REDIRIGIR SI YA ESTÁ LOGUEADO Y VA A LOGIN/SIGNUP
        // ────────────────────────────────────────────────────
        if (pathname === '/login' || pathname === '/signup') {
            switch (userRole) {
                case 'admin':
                case 'superadmin':
                    return NextResponse.redirect(new URL('/admin', request.url));
                case 'coach':
                    return NextResponse.redirect(new URL('/coach', request.url));
                default:
                    return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // ────────────────────────────────────────────────────
        // RBAC: PROTECCIÓN DE RUTAS POR ROL
        // ────────────────────────────────────────────────────

        // /admin → solo admin y superadmin
        if (pathname.startsWith('/admin')) {
            if (!['admin', 'superadmin'].includes(userRole ?? '')) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // /coach → coach, admin y superadmin
        if (pathname.startsWith('/coach')) {
            if (!['coach', 'admin', 'superadmin'].includes(userRole ?? '')) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }

        // ────────────────────────────────────────────────────
        // MODULE GATING: Solo para no-superadmin con gimnasio
        // Superadmin SIEMPRE pasa — tiene acceso total para dar soporte
        // ────────────────────────────────────────────────────
        if (userRole !== 'superadmin' && gymId) {
            const requiredModule = Object.entries(MODULE_ROUTES)
                .find(([route]) => pathname.startsWith(route))?.[1];

            if (requiredModule) {
                const { data: gym } = await supabase
                    .from('gimnasios')
                    .select('modulos_activos')
                    .eq('id', gymId)
                    .single();

                const modulos = (gym?.modulos_activos as Record<string, boolean>) || {};

                if (!modulos[requiredModule]) {
                    // Módulo no contratado → redirigir al dashboard
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }

        return response;

    } catch (_e) {
        // En caso de error, dejar pasar para no bloquear la app
        console.error('[Middleware] Error crítico:', _e);
        return NextResponse.next({ request: { headers: request.headers } });
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
