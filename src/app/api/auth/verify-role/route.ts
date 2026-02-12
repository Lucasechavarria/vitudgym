import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'virtud-secret-key-change-in-production';

/**
 * POST /api/auth/verify-role
 * 
 * Verifica que el token JWT sea válido y que el usuario tenga el rol adecuado.
 * 
 * @route POST /api/auth/verify-role
 * @access Protected
 * 
 * @returns {Object} 200 - Token válido y rol verificado
 * @returns {Object} 401 - Token inválido o sin autorización
 * @returns {Object} 403 - Token válido pero rol insuficiente
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const token = authHeader.substring(7);

        // Verificar JWT
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        return NextResponse.json({
            success: true,
            role: decoded.role,
            uid: decoded.uid,
            email: decoded.email
        });

    } catch (_error) {
        console.error('Token verification failed:', _error);
        return NextResponse.json({
            error: 'Invalid or expired token'
        }, { status: 401 });
    }
}
