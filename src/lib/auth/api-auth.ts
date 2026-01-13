import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

/**
 * Authenticate a request using Supabase Auth
 * 
 * @param request - The incoming request
 * @returns Object with user, supabase client, and error (if any)
 * 
 * @example
 * const { user, supabase, error } = await authenticateRequest(request);
 * if (error) return error;
 */
export async function authenticateRequest(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return {
                error: NextResponse.json(
                    { error: 'Unauthorized', message: 'Invalid or missing authentication token' },
                    { status: 401 }
                ),
                user: null,
                supabase: null
            };
        }

        return { user, supabase, error: null };
    } catch (err) {
        return {
            error: NextResponse.json(
                { error: 'Authentication failed', message: 'Failed to verify authentication' },
                { status: 401 }
            ),
            user: null,
            supabase: null
        };
    }
}

/**
 * Require that the authenticated user has one of the allowed roles
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to check
 * @param allowedRoles - Array of allowed roles
 * @returns Object with profile and error (if any)
 * 
 * @example
 * const { profile, error } = await requireRole(supabase, user.id, ['admin', 'superadmin']);
 * if (error) return error;
 */
export async function requireRole(
    supabase: any,
    userId: string,
    allowedRoles: string[]
) {
    try {
        // Optimización: Intentar obtener el rol de la sesión/usuario primero para ahorrar DB hits
        const { data: { user } } = await supabase.auth.getUser();
        let role = user?.app_metadata?.role || user?.user_metadata?.role;

        if (!role) {
            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !profile) {
                return {
                    error: NextResponse.json(
                        { error: 'Profile not found', message: 'User profile could not be retrieved' },
                        { status: 404 }
                    ),
                    profile: null
                };
            }
            role = profile.role;
        }

        if (!allowedRoles.includes(role)) {
            return {
                error: NextResponse.json(
                    {
                        error: 'Forbidden',
                        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
                        userRole: role || 'unknown'
                    },
                    { status: 403 }
                ),
                profile: null
            };
        }

        return { profile: { role }, error: null };
    } catch (err) {
        return {
            error: NextResponse.json(
                { error: 'Role verification failed', message: 'Failed to verify user role' },
                { status: 500 }
            ),
            profile: null
        };
    }
}

/**
 * Combined authentication and role verification
 * 
 * @param request - The incoming request
 * @param allowedRoles - Array of allowed roles
 * @returns Object with user, profile, supabase client, and error (if any)
 * 
 * @example
 * const { user, profile, supabase, error } = await authenticateAndRequireRole(request, ['admin']);
 * if (error) return error;
 */
export async function authenticateAndRequireRole(
    request: Request,
    allowedRoles: string[]
) {
    const { user, supabase, error: authError } = await authenticateRequest(request);

    if (authError) {
        return { user: null, profile: null, supabase: null, error: authError };
    }

    const { profile, error: roleError } = await requireRole(supabase!, user!.id, allowedRoles);

    if (roleError) {
        return { user, profile: null, supabase, error: roleError };
    }

    return { user, profile, supabase, error: null };
}
