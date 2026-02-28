import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function POST(req: Request) {
    try {
        const { user, profile, error } = await authenticateAndRequireRole(req, ['member', 'coach', 'admin']);
        if (error) return error;

        // --- CONTROL DE CUOTAS IA (Q3 Goal A) ---
        if (profile?.gimnasio_id) {
            const { consumeAIQuota } = await import('@/lib/ai/quota-gate');
            const quotaCheck = await consumeAIQuota(
                profile.gimnasio_id,
                user.id,
                'nutrition'
            );

            if (!quotaCheck.allowed) {
                return NextResponse.json({
                    error: quotaCheck.error || 'Cuota de IA insuficiente'
                }, { status: 403 });
            }
        }
        // ----------------------------------------

        const { filePart, mimeType } = await req.json();

        if (!filePart || !mimeType) {
            return NextResponse.json({ error: 'Faltan datos de la imagen' }, { status: 400 });
        }

        console.log(`Analyzing nutrition for user: ${user.id}`);

        const analysis = await aiService.analyzeNutrition(filePart, mimeType);

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (_error) {
        const err = _error as Error;
        console.error('API Nutrition Error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Error interno en el servidor'
        }, { status: 500 });
    }
}
