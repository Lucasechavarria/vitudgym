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
 * const { profile, error } = await requireRole(supabase, user.id, ['admin']);
 * if (error) return error;
 */
export async function requireRole(
    supabase: any,
    userId: string,
    allowedRoles: string[]
) {
    try {
        // 1. Priorizar metadata del JWT (app_metadata es seteado por el sistema/trigger)
        const { data: { user } } = await supabase.auth.getUser();

        // El rol puede estar en 'rol' o 'role' (por compatibilidad)
        // app_metadata es más confiable que user_metadata (que puede ser editado por el usuario)
        let role = user?.app_metadata?.rol ||
            user?.app_metadata?.role ||
            user?.user_metadata?.rol ||
            user?.user_metadata?.role;

        // 2. Fallback a base de datos solo si no hay metadata (ej. usuarios viejos no sincronizados)
        if (!role) {
            console.log(`requireRole: Rol no encontrado en metadata para ${userId}. Consultando DB...`);

            const { data: profile, error } = await supabase
                .from('perfiles')
                .select('rol')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('requireRole: Error consultando perfil en DB:', error);
                // Si hay un error 406 o similar, es probable que el RLS esté bloqueando.
                // No podemos determinar el rol, así que denegamos acceso por seguridad.
                return {
                    error: NextResponse.json(
                        {
                            error: 'Authorization Error',
                            message: 'No se pudo verificar el nivel de acceso.',
                            code: error.code
                        },
                        { status: error.status || 403 }
                    ),
                    profile: null
                };
            }

            if (!profile) {
                return {
                    error: NextResponse.json(
                        { error: 'Profile not found', message: 'El perfil de usuario no existe.' },
                        { status: 404 }
                    ),
                    profile: null
                };
            }

            role = profile.rol;
        }

        // 3. Verificación de permisos (Insensible a mayúsculas)
        const normalizedUserRole = (role || '').toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
            console.warn(`requireRole: Acceso denegado para ${userId}. Rol: ${role}, Requeridos: ${allowedRoles}`);
            return {
                error: NextResponse.json(
                    {
                        error: 'Forbidden',
                        message: 'No tienes permisos para acceder a este recurso.',
                        userRole: role || 'unknown'
                    },
                    { status: 403 }
                ),
                profile: null
            };
        }

        return { profile: { role }, error: null };
    } catch (err) {
        console.error('requireRole: Error inesperado:', err);
        return {
            error: NextResponse.json(
                { error: 'Internal Authority Error', message: 'Error interno al verificar permisos' },
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
