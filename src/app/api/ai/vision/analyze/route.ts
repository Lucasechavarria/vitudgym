import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function POST(req: Request) {
    try {
        const { user, error } = await authenticateAndRequireRole(req, ['student', 'coach', 'admin']);
        if (error) return error;

        const { filePart, mimeType, exerciseName } = await req.json();

        if (!filePart || !mimeType) {
            return NextResponse.json({ error: 'Faltan datos del video' }, { status: 400 });
        }

        console.log(`Analyzing movement for: ${exerciseName || 'Unknown exercise'}`);

        const analysis = await aiService.analyzeMovement(filePart, mimeType, exerciseName);

        return NextResponse.json({
            success: true,
            analysis
        });

    } catch (_error) {
        const err = _error as Error;
        console.error('API Vision Error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Error interno en el servidor'
        }, { status: 500 });
    }
}
