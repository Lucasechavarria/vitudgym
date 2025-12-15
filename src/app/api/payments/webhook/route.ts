import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

/**
 * POST /api/payments/webhook
 * 
 * Webhook de MercadoPago para notificaciones de pagos.
 * Procesa pagos aprobados, pendientes y rechazados.
 * 
 * @route POST /api/payments/webhook
 * @access Public (validado con signature)
 * 
 * @param {Object} request.body - Notificación de MercadoPago
 * 
 * @returns {Object} 200 - Webhook procesado
 * @returns {Object} 400 - Datos inválidos
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();

        logger.info('Webhook recibido de MercadoPago', { type: body.type, action: body.action });

        // Validar que sea una notificación de pago
        if (body.type !== 'payment') {
            return NextResponse.json({
                message: 'Tipo de notificación no soportado'
            });
        }

        // Obtener ID del pago
        const paymentId = body.data?.id;
        if (!paymentId) {
            return NextResponse.json({
                error: 'Payment ID no encontrado'
            }, { status: 400 });
        }

        // Consultar detalles del pago en MercadoPago
        const paymentResponse = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            }
        );

        const payment = await paymentResponse.json();

        logger.info('Detalles del pago', {
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            payment_method: payment.payment_method_id,
            transaction_amount: payment.transaction_amount,
            external_reference: payment.external_reference
        });

        // Obtener userId de la referencia externa
        const userId = payment.external_reference;

        // Procesar según el estado del pago
        switch (payment.status) {
            case 'approved':
                // Pago aprobado
                await handleApprovedPayment(payment, userId);
                break;

            case 'pending':
                // Pago pendiente (ej: transferencia bancaria)
                await handlePendingPayment(payment, userId);
                break;

            case 'rejected':
                // Pago rechazado
                await handleRejectedPayment(payment, userId);
                break;

            default:
                logger.warn('Estado de pago no manejado', { status: payment.status });
        }

        return NextResponse.json({
            success: true,
            message: 'Webhook procesado correctamente'
        });

    } catch (error: any) {
        console.error('❌ Error procesando webhook:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}

/**
 * Maneja pagos aprobados
 */
async function handleApprovedPayment(payment: any, userId: string) {
    try {
        const supabase = await createClient();

        // Guardar pago en Supabase
        const { error: paymentError } = await supabase
            .from('payments')
            .upsert({
                id: payment.id.toString(),
                user_id: userId,
                amount: payment.transaction_amount,
                currency: payment.currency_id || 'ARS',
                status: 'approved',
                payment_method: 'mercadopago',
                payment_provider: 'mercadopago',
                provider_payment_id: payment.id.toString(),
                concept: payment.description || 'Pago de membresía',
                metadata: {
                    payment_method_id: payment.payment_method_id,
                    payment_type_id: payment.payment_type_id,
                    status_detail: payment.status_detail,
                    date_approved: payment.date_approved,
                    money_release_date: payment.money_release_date,
                }
            });

        if (paymentError) {
            console.error('Error guardando pago aprobado:', paymentError);
            throw paymentError;
        }

        // Actualizar usuario como activo (membresía por 30 días)
        if (userId) {
            const membershipEndDate = new Date();
            membershipEndDate.setDate(membershipEndDate.getDate() + 30);

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    membership_status: 'active',
                    membership_end_date: membershipEndDate.toISOString()
                })
                .eq('id', userId);

            if (profileError) {
                logger.error('Error actualizando perfil', { error: profileError });
            }
        }

        logger.info('Pago aprobado procesado', { paymentId: payment.id });
    } catch (error) {
        logger.error('Error guardando pago aprobado', { error });
        throw error;
    }
}

/**
 * Maneja pagos pendientes (transferencias bancarias, etc.)
 */
async function handlePendingPayment(payment: any, userId: string) {
    try {
        const supabase = await createClient();

        // Guardar pago pendiente
        const { error: paymentError } = await supabase
            .from('payments')
            .upsert({
                id: payment.id.toString(),
                user_id: userId,
                amount: payment.transaction_amount,
                currency: payment.currency_id || 'ARS',
                status: 'pending',
                payment_method: 'mercadopago',
                payment_provider: 'mercadopago',
                provider_payment_id: payment.id.toString(),
                concept: payment.description || 'Pago de membresía',
                metadata: {
                    payment_method_id: payment.payment_method_id,
                    payment_type_id: payment.payment_type_id,
                    status_detail: payment.status_detail,
                    date_created: payment.date_created,
                }
            });

        if (paymentError) {
            logger.error('Error guardando pago pendiente', { error: paymentError });
            throw paymentError;
        }

        logger.info('Pago pendiente procesado', { paymentId: payment.id });
    } catch (error) {
        logger.error('Error guardando pago pendiente', { error });
        throw error;
    }
}

/**
 * Maneja pagos rechazados
 */
async function handleRejectedPayment(payment: any, userId: string) {
    try {
        const supabase = await createClient();

        // Guardar pago rechazado
        const { error: paymentError } = await supabase
            .from('payments')
            .upsert({
                id: payment.id.toString(),
                user_id: userId,
                amount: payment.transaction_amount,
                currency: payment.currency_id || 'ARS',
                status: 'rejected',
                payment_method: 'mercadopago',
                payment_provider: 'mercadopago',
                provider_payment_id: payment.id.toString(),
                concept: payment.description || 'Pago de membresía',
                metadata: {
                    payment_method_id: payment.payment_method_id,
                    payment_type_id: payment.payment_type_id,
                    status_detail: payment.status_detail,
                    date_created: payment.date_created,
                }
            });

        if (paymentError) {
            logger.error('Error guardando pago rechazado', { error: paymentError });
            throw paymentError;
        }

        logger.info('Pago rechazado procesado', { paymentId: payment.id });
    } catch (error) {
        logger.error('Error guardando pago rechazado', { error });
        throw error;
    }
}

/**
 * GET - Endpoint de prueba
 */
export async function GET() {
    return NextResponse.json({
        message: 'Webhook de MercadoPago activo'
    });
}
