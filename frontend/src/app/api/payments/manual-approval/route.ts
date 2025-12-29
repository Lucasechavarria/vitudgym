import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/payments/manual-approval
 * 
 * Permite a un admin aprobar manualmente un pago en efectivo.
 * Marca el pago como confirmado sin pasar por MercadoPago.
 * 
 * @route POST /api/payments/manual-approval
 * @access Admin only
 * 
 * @param {Object} request.body
 * @param {string} request.body.userId - ID del usuario que pagó
 * @param {number} request.body.amount - Monto pagado en ARS
 * @param {string} request.body.concept - Concepto del pago (ej: "Cuota Mensual Enero 2025")
 * @param {string} [request.body.notes] - Notas adicionales del admin
 * 
 * @returns {Object} 200 - Pago aprobado exitosamente
 * @returns {Object} 401 - No autorizado
 * @returns {Object} 403 - No tiene permisos de admin
 * @returns {Object} 500 - Error del servidor
 * 
 * @example
 * // Request
 * POST /api/payments/manual-approval
 * {
 *   "userId": "user_123",
 *   "amount": 15000,
 *   "concept": "Cuota Mensual Enero 2025",
 *   "notes": "Pago en efectivo recibido por recepción"
 * }
 * 
 * // Response
 * {
 *   "success": true,
 *   "paymentId": "payment_abc123",
 *   "message": "Pago aprobado exitosamente"
 * }
 */
export async function POST(request: Request) {
    try {
        // Verificar autenticación y rol de admin
        const { user, profile, supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        // Obtener datos del request
        const { userId, amount, concept, notes } = await request.json();

        // Validar datos
        if (!userId || !amount || !concept) {
            return NextResponse.json({
                error: 'Missing required fields',
                message: 'userId, amount, and concept are required'
            }, { status: 400 });
        }

        // Crear registro de pago en Supabase
        const { data: payment, error: paymentError } = await supabase!
            .from('payments')
            .insert({
                user_id: userId,
                amount: Number(amount),
                concept,
                notes: notes || '',
                status: 'approved',
                payment_method: 'cash',
                approved_by: user!.id,
                approved_at: new Date().toISOString()
            })
            .select()
            .single();

        if (paymentError) {
            console.error('Error creating payment:', paymentError);
            return NextResponse.json({
                error: 'Payment creation failed',
                message: paymentError.message
            }, { status: 500 });
        }

        // Actualizar estado del usuario (activar membresía por 30 días)
        const membershipEndDate = new Date();
        membershipEndDate.setDate(membershipEndDate.getDate() + 30);

        const { error: profileError } = await supabase!
            .from('profiles')
            .update({
                membership_status: 'active',
                membership_end_date: membershipEndDate.toISOString()
            })
            .eq('id', userId);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            // No fallar la operación si solo falla la actualización del perfil
        }

        return NextResponse.json({
            success: true,
            paymentId: payment.id,
            message: 'Pago aprobado exitosamente'
        });

    } catch (error: any) {
        console.error('Error en aprobación manual de pago:', error);
        return NextResponse.json({
            error: 'Payment approval failed',
            message: error.message || 'Error al procesar el pago'
        }, { status: 500 });
    }
}

/**
 * GET /api/payments/manual-approval
 * 
 * Lista todos los pagos manuales aprobados.
 * 
 * @route GET /api/payments/manual-approval
 * @access Admin only
 * 
 * @returns {Object} 200 - Lista de pagos
 * @returns {Object} 401 - No autorizado
 * @returns {Object} 403 - No tiene permisos de admin
 */
export async function GET(request: Request) {
    try {
        // Verificar autenticación y rol de admin
        const { user, profile, supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        // Obtener pagos manuales con información del usuario y aprobador
        const { data: payments, error: paymentsError } = await supabase!
            .from('payments')
            .select(`
                *,
                user:profiles!payments_user_id_fkey(id, full_name, email),
                approver:profiles!payments_approved_by_fkey(id, full_name, email)
            `)
            .eq('payment_method', 'cash')
            .order('created_at', { ascending: false })
            .limit(100);

        if (paymentsError) {
            console.error('Error fetching payments:', paymentsError);
            return NextResponse.json({
                error: 'Failed to fetch payments',
                message: paymentsError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            payments: payments || []
        });

    } catch (error: any) {
        console.error('Error al obtener pagos:', error);
        return NextResponse.json({
            error: 'Failed to fetch payments',
            message: error.message || 'Error al obtener pagos'
        }, { status: 500 });
    }
}
