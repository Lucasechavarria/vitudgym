// Tipos para la API de MercadoPago
// Basado en la documentación oficial: https://www.mercadopago.com.ar/developers/es/reference/payments/_payments_id/get

/**
 * Estructura completa de un pago de MercadoPago
 * Incluye solo los campos que realmente usamos en el webhook
 */
export interface MercadoPagoPayment {
    // Identificación
    id: number;
    external_reference?: string; // userId en nuestro caso

    // Montos y moneda
    transaction_amount: number;
    currency_id: string; // 'ARS', 'USD', etc.

    // Estado del pago
    status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
    status_detail: string;

    // Método de pago
    payment_method_id: string; // 'visa', 'master', 'rapipago', etc.
    payment_type_id: string; // 'credit_card', 'debit_card', 'ticket', etc.

    // Descripción
    description?: string;

    // Fechas
    date_created: string; // ISO 8601
    date_approved?: string; // ISO 8601
    date_last_updated: string; // ISO 8601
    money_release_date?: string; // ISO 8601

    // Información del pagador
    payer?: {
        id?: string;
        email?: string;
        identification?: {
            type: string;
            number: string;
        };
        first_name?: string;
        last_name?: string;
    };

    // Metadata adicional que podemos necesitar
    metadata?: Record<string, unknown>;
}

/**
 * Estructura del webhook de MercadoPago
 */
export interface MercadoPagoWebhookNotification {
    id: number;
    live_mode: boolean;
    type: 'payment' | 'plan' | 'subscription' | 'invoice' | 'point_integration_wh';
    date_created: string;
    application_id: number;
    user_id: number;
    version: number;
    api_version: string;
    action: 'payment.created' | 'payment.updated';
    data: {
        id: string; // ID del pago
    };
}

/**
 * Estructura de respuesta de error de Supabase
 */
export interface SupabaseError {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
}
