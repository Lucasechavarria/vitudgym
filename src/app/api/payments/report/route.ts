import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { logger } from '@/lib/logger';

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
            .from('pagos')
            .insert({
                usuario_id: user!.id,
                monto: numericAmount,
                moneda: 'ARS',
                concepto: 'Pago Mensual (Reportado por Usuario)',
                notas: `Referencia: ${reference || 'N/A'}. Notas: ${notes || ''}. Fecha: ${date}. Comprobante: ${receipt_url || 'No adjunto'}`,
                estado: 'pending',
                metodo_pago: method, // 'transfer', 'cash', etc.
                proveedor_pago: 'manual',
            })
            .select()
            .single();

        if (paymentError) {
            logger.error('Error creando reporte de pago', { error: paymentError.message, userId: user!.id });
            return NextResponse.json({
                error: 'Error reporting payment',
                message: paymentError.message
            }, { status: 500 });
        }

        logger.info('Pago reportado por usuario', { paymentId: payment.id, userId: user!.id, amount: numericAmount, method });

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: 'Pago informado exitosamente. Esperando aprobación.'
        });

    } catch (error) {
        logger.error('Error en reporte de pago', { error: error instanceof Error ? error.message : String(error) });
        const errorMessage = error instanceof Error ? error.message : 'Error al reportar pago';
        return NextResponse.json({
            error: 'Internal Server Error',
            message: errorMessage
        }, { status: 500 });
    }
}
