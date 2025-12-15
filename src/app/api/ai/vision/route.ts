import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { createClient } from '@supabase/supabase-js';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

// Admin client to bypass RLS for inserting usage logs
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_TIER_LIMIT = 5; // Analisis por día

export async function POST(request: Request) {
    try {
        const { user, error } = await authenticateAndRequireRole(request, ['coach', 'admin', 'superadmin']);
        if (error) return error;

        // 1. Verificar límite de uso
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error: countError } = await supabaseAdmin
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('feature', 'vision_analysis')
            .gte('created_at', today.toISOString());

        if (countError) throw countError;

        if ((count || 0) >= FREE_TIER_LIMIT) {
            return NextResponse.json({
                error: 'Has alcanzado el límite diario de análisis gratuitos. Vuelve mañana.',
                limitReached: true
            }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = file.type;

        // 2. Procesar con Gemini
        const analysis = await aiService.analyzeMovement(base64, mimeType);

        // 3. Registrar uso
        await supabaseAdmin.from('ai_usage_logs').insert({
            user_id: user.id,
            feature: 'vision_analysis'
        });

        return NextResponse.json({
            success: true,
            analysis,
            usage: (count || 0) + 1,
            limit: FREE_TIER_LIMIT
        });

    } catch (error: any) {
        console.error('Vision API Error:', error);
        return NextResponse.json({
            error: error.message || 'Error processing vision request'
        }, { status: 500 });
    }
}
