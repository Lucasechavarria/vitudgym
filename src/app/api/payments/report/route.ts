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

        if (!amount || !date || !method) {
            return NextResponse.json({
                error: 'Missing required fields',
                message: 'Monto, fecha y método son requeridos'
            }, { status: 400 });
        }

        // Crear registro de pago en Supabase con estado 'pending'
        const { data: payment, error: paymentError } = await supabase!
            .from('payments')
            .insert({
                user_id: user!.id,
                amount: Number(amount),
                concept: 'Pago Mensual (Reportado por Usuario)',
                notes: `Referencia: ${reference || 'N/A'}. Notas: ${notes || ''}. Fecha: ${date}. Comprobante: ${receipt_url || 'No adjunto'}`,
                status: 'pending',
                payment_method: method, // 'transfer', 'cash', etc.
            })
            .select()
            .single();

        if (paymentError) {
            console.error('Error creating payment report:', paymentError);
            return NextResponse.json({
                error: 'Error reporting payment',
                message: paymentError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: 'Pago informado exitosamente. Esperando aprobación.'
        });

    } catch (error: any) {
        console.error('Error en reporte de pago:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
