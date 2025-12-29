import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * 
 * Cierra la sesión del usuario eliminando la session cookie.
 * 
 * @route POST /api/auth/logout
 * @access Public
 * 
 * @returns {Object} 200 - Sesión cerrada exitosamente
 * 
 * @example
 * // Request
 * POST /api/auth/logout
 * 
 * // Response
 * {
 *   "success": true
 * }
 */
export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session');
    return response;
}
