import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai.service';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function POST(request: Request) {
    try {
        // Verificar autenticación (opcional para chatbot)
        // Permitir acceso sin autenticación estricta para demo
        const authResult = await authenticateAndRequireRole(
            request,
            ['member', 'coach', 'admin']
        );

        // Log de debug pero continuar incluso si falla auth (para demo)
        if (authResult.error) {
            console.warn('Chat auth warning:', authResult.error);
        }

        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Contexto del sistema inyectado invisiblemente al inicio si es el primer mensaje
        let efectiveHistory = history || [];

        if (efectiveHistory.length === 0) {
            // No agregamos esto al historial visible, pero podríamos instruir al modelo con un mensaje inicial
            // Por ahora, confiamos en el prompt del sistema si estuviéramos usando 'systemInstruction' (disponible en modelos nuevos)
            // O simplemente pre-prompting en el primer mensaje.
        }

        const response = await aiService.generateChatResponse(message, efectiveHistory);

        return NextResponse.json({
            success: true,
            response
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);

        // Mensaje más específico según el error
        let errorMessage = 'Error processing chat request';
        if (error.message?.includes('API key')) {
            errorMessage = 'Gemini API key no configurada. Contacta al administrador.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
