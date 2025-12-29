import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

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

        // If has user and trying to access login/signup, redirect to dashboard
        if (user && (pathname === '/login' || pathname === '/signup')) {
            const redirectUrl = request.nextUrl.clone();

            try {
                // Get user profile to determine redirect based on role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    switch (profile.role) {
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
            } catch (e) {
                // If DB error, default to dashboard
                redirectUrl.pathname = '/dashboard';
            }

            return NextResponse.redirect(redirectUrl);
        }

        // Role-based access control
        if (user) {
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    // Admin routes
                    if (pathname.startsWith('/admin') && !['admin', 'superadmin'].includes(profile.role)) {
                        return NextResponse.redirect(new URL('/dashboard', request.url));
                    }

                    // Coach routes
                    if (pathname.startsWith('/coach') && !['coach', 'admin', 'superadmin'].includes(profile.role)) {
                        return NextResponse.redirect(new URL('/dashboard', request.url));
                    }
                }
            } catch (e) {
                // If DB error, verify logic - maybe strictly deny admin/coach areas if profile check fails?
                // Safer to deny access to privileged areas if we can't verify role
                if (pathname.startsWith('/admin') || pathname.startsWith('/coach')) {
                    return NextResponse.redirect(new URL('/dashboard', request.url));
                }
            }
        }

        return response;

    } catch (e) {
        console.error('Middleware execution error:', e);
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
