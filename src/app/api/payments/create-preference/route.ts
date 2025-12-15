import { NextResponse } from 'next/server';
import { preference } from '@/lib/config/mercadopago';

/**
 * POST /api/payments/create-preference
 * 
 * Crea una preferencia de pago en MercadoPago para procesar pagos.
 * Genera un link de pago que redirige al checkout de MercadoPago.
 * 
 * @route POST /api/payments/create-preference
 * @access Public
 * 
 * @param {Object} request.body
 * @param {string} request.body.title - Título del producto/servicio
 * @param {number} request.body.price - Precio en ARS
 * @param {number} [request.body.quantity=1] - Cantidad de items
 * 
 * @returns {Object} 200 - Preferencia creada exitosamente
 * @returns {string} 200.id - ID de la preferencia
 * @returns {string} 200.init_point - URL del checkout de MercadoPago
 * @returns {Object} 500 - Error al crear preferencia
 * 
 * @example
 * // Request
 * POST /api/payments/create-preference
 * {
 *   "title": "Cuota Mensual Virtud",
 *   "price": 15000,
 *   "quantity": 1
 * }
 * 
 * // Response
 * {
 *   "id": "123456789-abcd-1234-efgh-567890abcdef",
 *   "init_point": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=..."
 * }
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, price, quantity = 1 } = body;

        const result = await preference.create({
            body: {
                items: [
                    {
                        id: 'monthly-subscription',
                        title: title || 'Cuota Mensual Virtud',
                        quantity: Number(quantity),
                        unit_price: Number(price) || 15000,
                        currency_id: 'ARS',
                    },
                ],
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=failure`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?payment=pending`
                },
                auto_return: 'approved',
            }
        });

        return NextResponse.json({ id: result.id, init_point: result.init_point });
    } catch (error: any) {
        console.error('MercadoPago Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
