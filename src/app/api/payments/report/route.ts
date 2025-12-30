import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';

/**
 * POST /api/payments/report
 * 
 * Permite a un estudiante informar un pago realizado por transferencia.
 * El pago queda en estado 'pending' hasta ser aprobado por un admin.
 * 
 * @route POST /api/payments/report
 * @access Authenticated users
 */
export async function POST(request: Request) {
    try {
        const { user, supabase, error } = await authenticateRequest(request);
        if (error) return error;

        const { amount, date, method, reference, notes, receipt_url } = await request.json();

        // Validaciones robustas
        if (!amount || !date || !method) {
            return NextResponse.json({
                error: 'Missing required fields',
                message: 'Monto, fecha y método son requeridos'
            }, { status: 400 });
        }

        // Validar monto
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json({
                error: 'Monto inválido',
                message: 'El monto debe ser un número positivo'
            }, { status: 400 });
        }

        // Validar fecha
        const paymentDate = new Date(date);
        if (isNaN(paymentDate.getTime())) {
            return NextResponse.json({
                error: 'Fecha inválida',
                message: 'Por favor proporciona una fecha válida'
            }, { status: 400 });
        }

        // Validar que la fecha no sea futura
        if (paymentDate > new Date()) {
            return NextResponse.json({
                error: 'Fecha inválida',
                message: 'La fecha del pago no puede ser futura'
            }, { status: 400 });
        }

        // Crear registro de pago en Supabase con estado 'pending'
        const { data: payment, error: paymentError } = await supabase!
            .from('payments')
            .insert({
                user_id: user!.id,
                amount: numericAmount,
                currency: 'ARS',
                concept: 'Pago Mensual (Reportado por Usuario)',
                notes: `Referencia: ${reference || 'N/A'}. Notas: ${notes || ''}. Fecha: ${date}. Comprobante: ${receipt_url || 'No adjunto'}`,
                status: 'pending',
                payment_method: method, // 'transfer', 'cash', etc.
                payment_provider: 'manual',
            })
            .select()
            .single();

        if (paymentError) {
            console.error('❌ Error creating payment report:', paymentError);
            return NextResponse.json({
                error: 'Error reporting payment',
                message: paymentError.message
            }, { status: 500 });
        }

        console.log('✅ Pago reportado por usuario:', {
            paymentId: payment.id,
            userId: user!.id,
            amount: numericAmount,
            method
        });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: 'Pago informado exitosamente. Esperando aprobación.'
        });

    } catch (error) {
        console.error('❌ Error en reporte de pago:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al reportar pago';
        return NextResponse.json({
            error: 'Internal Server Error',
            message: errorMessage
        }, { status: 500 });
    }
}
