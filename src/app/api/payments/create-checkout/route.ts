import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { authenticateRequest } from '@/lib/auth/api-auth';

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

        // Validar datos
        if (!userId || !userEmail || !title || !price) {
            return NextResponse.json({
                error: 'Faltan datos requeridos: userId, userEmail, title, price'
            }, { status: 400 });
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
                        quantity: Number(quantity),
                        unit_price: Number(price),
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

        return NextResponse.json({
            success: true,
            init_point: result.init_point,
            checkoutUrl: result.init_point, // Added for test compatibility
            preferenceId: result.id,       // Added for test compatibility matching CamelCase expectation
            preference_id: result.id,
            sandbox_init_point: result.sandbox_init_point
        });

    } catch (error: any) {
        console.error('Error creando checkout de MercadoPago:', error);
        return NextResponse.json({
            error: error.message || 'Error al crear checkout',
            details: error.cause || null
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

        // Consultar pago en MercadoPago
        const response = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            }
        );

        const payment = await response.json();

        return NextResponse.json({
            success: true,
            payment
        });

    } catch (error: any) {
        console.error('Error obteniendo pago:', error);
        return NextResponse.json({
            error: error.message || 'Error al obtener pago'
        }, { status: 500 });
    }
}
