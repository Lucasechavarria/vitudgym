import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { logger } from '@/lib/logger';

/**
 * POST /api/payments/create-checkout
 * 
 * Crea un Checkout Pro de MercadoPago para procesar pagos.
 */
export async function POST(request: Request) {
    try {
        // 1. Verify Authentication
        const { user, error: authError } = await authenticateRequest(request);
        if (authError || !user) {
            return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, userEmail, title, price, quantity = 1 } = body;

        // Validaciones robustas
        if (!userId || !userEmail || !title || !price) {
            return NextResponse.json({
                error: 'Faltan datos requeridos: userId, userEmail, title, price'
            }, { status: 400 });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            return NextResponse.json({
                error: 'Email inv\u00e1lido',
                message: 'Por favor proporciona un email v\u00e1lido'
            }, { status: 400 });
        }

        // Validar precio
        const numericPrice = Number(price);
        const numericQuantity = Number(quantity);

        if (isNaN(numericPrice) || numericPrice <= 0) {
            return NextResponse.json({
                error: 'Precio inv\u00e1lido',
                message: 'El precio debe ser un n\u00famero positivo'
            }, { status: 400 });
        }

        if (isNaN(numericQuantity) || numericQuantity <= 0) {
            return NextResponse.json({
                error: 'Cantidad inv\u00e1lida',
                message: 'La cantidad debe ser un n\u00famero positivo'
            }, { status: 400 });
        }

        // Validar que el access token est\u00e9 configurado
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            logger.error('MERCADOPAGO_ACCESS_TOKEN no configurado');
            return NextResponse.json({
                error: 'Configuraci\u00f3n de pago no disponible',
                message: 'El sistema de pagos no est\u00e1 configurado correctamente'
            }, { status: 503 });
        }

        // Configurar cliente de MercadoPago
        const client = new MercadoPagoConfig({
            accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
            options: {
                timeout: 5000,
            }
        });

        const preference = new Preference(client);

        // Crear preferencia de pago
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: `membership-${userId}`,
                        title: title,
                        quantity: numericQuantity,
                        unit_price: numericPrice,
                        currency_id: 'ARS',
                    },
                ],
                payer: {
                    email: userEmail,
                },
                // URLs de retorno
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/success`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/failure`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/payments/pending`
                },
                auto_return: 'approved',
                // Metadata para identificar el pago
                external_reference: userId,
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
                // Métodos de pago habilitados
                payment_methods: {
                    excluded_payment_methods: [],
                    excluded_payment_types: [],
                    installments: 12, // Hasta 12 cuotas
                },
                // Configuración adicional
                statement_descriptor: 'VIRTUD GYM',
                expires: false,
            }
        });

        logger.info('Checkout MP creado exitosamente', {
            preferenceId: result.id,
            userId,
            amount: numericPrice * numericQuantity
        });

        return NextResponse.json({
            success: true,
            init_point: result.init_point,
            checkoutUrl: result.init_point, // Added for test compatibility
            preferenceId: result.id,       // Added for test compatibility matching CamelCase expectation
            preference_id: result.id,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error) {
        logger.error('MercadoPago: Error creando checkout', { error: error instanceof Error ? error.message : error });

        // Extraer mensaje de error de forma segura
        let errorMessage = 'Error al crear checkout';
        let errorDetails = null;

        if (error instanceof Error) {
            errorMessage = error.message;
            errorDetails = (error as any).cause || null;
        }

        return NextResponse.json({
            error: errorMessage,
            details: errorDetails
        }, { status: 500 });
    }
}

/**
 * GET /api/payments/create-checkout?paymentId=123
 * 
 * Obtiene información de un pago específico.
 * 
 * @route GET /api/payments/create-checkout
 * @access Public
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const paymentId = searchParams.get('paymentId');

        if (!paymentId) {
            return NextResponse.json({
                error: 'paymentId es requerido'
            }, { status: 400 });
        }

        // Validar que el access token est\u00e9 configurado
        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            logger.error('MERCADOPAGO_ACCESS_TOKEN no configurado en GET checkout');
            return NextResponse.json({
                error: 'Configuraci\u00f3n de pago no disponible'
            }, { status: 503 });
        }

        // Consultar pago en MercadoPago
        const response = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            logger.error('Error de MercadoPago API al consultar pago', { status: response.status, message: errorData.message });
            return NextResponse.json({
                error: 'Error consultando pago',
                message: errorData.message || 'No se pudo obtener informaci\u00f3n del pago',
                status: response.status
            }, { status: response.status });
        }

        const payment = await response.json();

        return NextResponse.json({
            success: true,
            payment
        });

    } catch (error) {
        logger.error('Error obteniendo pago de MercadoPago', { error: error instanceof Error ? error.message : error });
        const errorMessage = error instanceof Error ? error.message : 'Error al obtener pago';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
