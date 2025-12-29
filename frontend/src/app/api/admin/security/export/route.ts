import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/security/export
 * 
 * Exporta reporte de seguridad en formato JSON
 * (En producción, usar librería como jsPDF para generar PDF)
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        // Obtener logs de los últimos 30 días
        const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data: logs, error: logsError } = await supabase
            .from('routine_access_logs')
            .select(`
                *,
                user:user_id(full_name, email),
                routine:routine_id(name)
            `)
            .gte('created_at', last30days)
            .order('created_at', { ascending: false });

        if (logsError) throw logsError;

        // Generar reporte
        const report = {
            generatedAt: new Date().toISOString(),
            period: 'Últimos 30 días',
            summary: {
                totalEvents: logs.length,
                criticalEvents: logs.filter(l =>
                    l.action === 'screenshot_attempt' ||
                    l.action === 'devtools_detected'
                ).length,
                suspiciousEvents: logs.filter(l => l.action.includes('suspicious')).length,
                uniqueUsers: new Set(logs.map(l => l.user_id)).size,
                uniqueRoutines: new Set(logs.map(l => l.routine_id)).size,
            },
            events: logs.map(log => ({
                timestamp: log.created_at,
                action: log.action,
                user: log.user?.full_name || 'Desconocido',
                routine: log.routine?.name || 'Desconocida',
                ipAddress: log.ip_address,
                userAgent: log.user_agent,
            })),
            recommendations: generateRecommendations(logs),
        };

        // Retornar como JSON (en producción, generar PDF)
        return NextResponse.json(report, {
            headers: {
                'Content-Disposition': `attachment; filename="security-report-${new Date().toISOString().split('T')[0]}.json"`,
                'Content-Type': 'application/json',
            }
        });

    } catch (error: any) {
        console.error('Error exporting report:', error);
        return NextResponse.json({
            error: error.message || 'Error exporting report'
        }, { status: 500 });
    }
}

function generateRecommendations(logs: any[]): string[] {
    const recommendations: string[] = [];

    const screenshotAttempts = logs.filter(l => l.action === 'screenshot_attempt').length;
    const devtoolsDetections = logs.filter(l => l.action === 'devtools_detected').length;
    const suspiciousActivities = logs.filter(l => l.action.includes('suspicious')).length;

    if (screenshotAttempts > 10) {
        recommendations.push('⚠️ Alto número de intentos de screenshot detectados. Considerar implementar app nativa con FLAG_SECURE.');
    }

    if (devtoolsDetections > 5) {
        recommendations.push('⚠️ Múltiples detecciones de DevTools. Revisar usuarios con acceso técnico.');
    }

    if (suspiciousActivities > 20) {
        recommendations.push('⚠️ Comportamientos sospechosos frecuentes. Considerar contactar a usuarios afectados.');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ No se detectaron patrones preocupantes. Sistema funcionando correctamente.');
    }

    return recommendations;
}
