import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

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
    '/dashboard/classes': 'clases_reserva'
};

export async function middleware(request: NextRequest) {
    // 1. Check for required environment variables to prevent crash on Vercel
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('⚠️ Middleware skipping Supabase init: Missing env vars');
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }

    try {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createMiddlewareClient(request, response);

        // Refresh session if expired
        const { data: { user }, error } = await supabase.auth.getUser();

        const { pathname } = request.nextUrl;

        // Public routes that don't require authentication
        const publicRoutes = ['/', '/login', '/signup', '/auth/callback'];
        const isPublicRoute = publicRoutes.includes(pathname);

        // If no user and trying to access protected route, redirect to login
        if ((!user || error) && !isPublicRoute) {
            const redirectUrl = request.nextUrl.clone();
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(redirectUrl);
        }

        // Optimization: Fetch profile ONCE if user exists and it's not a purely static request
        let userRole = null;
        if (user) {
            try {
                // COMENTADO: No confiar en metadatos por ahora porque pueden estar desincronizados
                // userRole = user.app_metadata?.role || user.user_metadata?.role;

                // SIEMPRE consultar la BBDD 'perfiles' para tener el rol real
                const { data: profile, error: profileError } = await supabase
                    .from('perfiles')
                    .select('rol, gimnasio_id')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    userRole = profile.rol;
                } else if (profileError) {
                    console.error('Middleware: Error fetching profile role:', profileError);
                }

                // Fallback a metadata si falla la DB
                if (!userRole) {
                    userRole = user.app_metadata?.rol || user.user_metadata?.rol || user.app_metadata?.role || user.user_metadata?.role;
                }

                // Si tiene gimnasio, verificar módulos activos si no es superadmin
                if (profile?.gimnasio_id && userRole !== 'superadmin') {
                    const requiredModule = Object.entries(MODULE_ROUTES).find(([route]) => pathname.startsWith(route))?.[1];

                    if (requiredModule) {
                        const { data: gym } = await supabase
                            .from('gimnasios')
                            .select('modulos_activos')
                            .eq('id', profile.gimnasio_id)
                            .single();

                        const modulos = gym?.modulos_activos || {};
                        if (!modulos[requiredModule]) {
                            console.warn(`⛔ Acceso prohibido: El gimnasio ${profile.gimnasio_id} no tiene el módulo ${requiredModule} activo para la ruta ${pathname}`);
                            return NextResponse.redirect(new URL('/dashboard', request.url));
                        }
                    }
                }

                console.log(`🔐 Middleware Check: User ${user.email} has role: ${userRole}`);

            } catch (_e) {
                console.error('Error fetching role in middleware:', _e);
            }
        }

        // If has user and trying to access login/signup, redirect to dashboard based on role
        if (user && (pathname === '/login' || pathname === '/signup')) {
            const redirectUrl = request.nextUrl.clone();

            if (userRole) {
                switch (userRole) {
                    case 'admin':
                    case 'superadmin':
                        redirectUrl.pathname = '/admin';
                        break;
                    case 'coach':
                        redirectUrl.pathname = '/coach';
                        break;
                    default:
                        redirectUrl.pathname = '/dashboard';
                }
            } else {
                redirectUrl.pathname = '/dashboard';
            }

            return NextResponse.redirect(redirectUrl);
        }

        // Role-based access control (RBAC)
        if (user) {
            console.log(`🛡️ RBAC Check - Path: ${pathname}, Role: ${userRole}`);

            // Admin routes
            if (pathname.startsWith('/admin')) {
                const isAdmin = ['admin', 'superadmin'].includes(userRole);
                console.log(`👤 User accessing /admin. Is Admin? ${isAdmin}`);

                if (!isAdmin) {
                    console.warn(`⛔ Access denied to /admin for user ${user.email} (Role: ${userRole})`);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }

            // Coach routes
            if (pathname.startsWith('/coach')) {
                const isCoach = ['coach', 'admin', 'superadmin'].includes(userRole);
                if (!isCoach) {
                    console.warn(`⛔ Access denied to /coach for user ${user.email} (Role: ${userRole})`);
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }

        return response;

    } catch (_e) {
        console.error('Middleware execution error:', _e);
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
