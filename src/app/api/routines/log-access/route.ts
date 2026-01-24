import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { routineAccessLogsService } from '@/services/routine-access-logs.service';

/**
 * POST /api/routines/log-access
 * 
 * Registra un acceso a una rutina (para seguridad y auditoría)
 * 
 * @route POST /api/routines/log-access
 * @access Protected (requiere autenticación)
 */
export async function POST(request: Request) {
    try {
        const { user, error } = await authenticateAndRequireRole(request, ['member', 'coach', 'admin']);

        if (error) return error;

        const { routineId, action, userAgent, timestamp } = await request.json();

        if (!routineId || !action) {
            return NextResponse.json({
                error: 'Missing required fields: routineId, action'
            }, { status: 400 });
        }

        // Obtener IP del request (si está disponible)
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Registrar el acceso
        await routineAccessLogsService.logAccess({
            rutina_id: routineId,
            usuario_id: user.id,
            action,
            ip_address: ip,
            user_agent: userAgent,
            info_dispositivo: {
                timestamp,
                platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
            },
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Log Access Error:', error);
        return NextResponse.json({
            error: error.message || 'Error logging access'
        }, { status: 500 });
    }
}
