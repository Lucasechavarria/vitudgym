import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { studentId, reportData } = await req.json();

        if (!studentId || !reportData) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        const { riesgo_lesion, puntaje_adherencia_estimado, alertas_criticas } = reportData;

        // 1. Determinar si es necesario notificar
        const lowAdherence = puntaje_adherencia_estimado < 70;
        const highRisk = ['alto', 'critico'].includes(riesgo_lesion?.nivel);
        const hasCriticalAlerts = alertas_criticas && alertas_criticas.length > 0;

        if (!lowAdherence && !highRisk && !hasCriticalAlerts) {
            return NextResponse.json({ success: true, message: 'No se requiere notificación proactiva' });
        }

        // 2. Obtener los coaches primarios del alumno
        const { data: relations } = await supabase
            .from('relacion_alumno_coach')
            .select('coach_id, perfiles:user_id(nombre_completo)')
            .eq('user_id', studentId)
            .eq('is_primary', true)
            .eq('is_active', true);

        if (!relations || relations.length === 0) {
            return NextResponse.json({ success: false, message: 'Alumno sin coach asignado' });
        }

        const studentName = (relations[0].perfiles as any)?.nombre_completo || 'Un alumno';
        const notificationPromises = relations.map(async (rel) => {
            let title = '⚠️ Alerta de Rendimiento';
            let message = '';

            if (highRisk) {
                title = '🚨 ALERTA: Riesgo de Lesión';
                message = `${studentName} tiene un nivel de riesgo ${riesgo_lesion.nivel.toUpperCase()}.`;
            } else if (hasCriticalAlerts) {
                title = '⚠️ Alerta Crítica IA';
                message = `${studentName}: ${alertas_criticas[0]}`;
            } else if (lowAdherence) {
                title = '📉 Baja Adherencia Detectada';
                message = `${studentName} ha caído por debajo del 70% de adherencia técnica/nutricional.`;
            }

            // Llamar al endpoint de push existente
            // Usamos la URL absoluta de la API interna
            const pushBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            return fetch(`${pushBaseUrl}/api/push/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientId: rel.coach_id,
                    title,
                    body: message,
                    url: `/coach/students/${studentId}/bio-logs`
                })
            });
        });

        await Promise.all(notificationPromises);

        return NextResponse.json({ success: true, message: 'Notificaciones proactivas enviadas' });
    } catch (error: any) {
        console.error('Error in proactive notification:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
