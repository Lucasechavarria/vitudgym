
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/payments/extend
 * 
 * Permite a un admin aplicar una prórroga de 7 días a un pago.
 * Máximo 2 prórrogas por pago.
 * 
 * @route POST /api/admin/payments/extend
 * @access Admin only
 * 
 * @param {Object} request.body
 * @param {string} request.body.paymentId - ID del pago a prorrogar
 * 
 * @returns {Object} 200 - Prórroga aplicada exitosamente
 * @returns {Object} 400 - Error de validación o límite alcanzado
 * @returns {Object} 401 - No autorizado
 */
export async function POST(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['admin']);
        if (error) return error;

        const { paymentId } = await request.json();

        if (!paymentId) {
            return NextResponse.json({
                error: 'Missing paymentId',
                message: 'El ID del pago es requerido'
            }, { status: 400 });
        }

        // Llamar a la función RPC de Supabase
        const { data, error: rpcError } = await supabase.rpc('solicitar_prorroga_pago', {
            p_pago_id: paymentId,
            p_admin_id: user.id
        });

        if (rpcError) {
            console.error('Error aplicando prórroga:', rpcError);
            return NextResponse.json({
                error: 'Database error',
                message: rpcError.message
            }, { status: 500 });
        }

        // Verificar si la función devolvió un error lógico
        if (data && data.error) {
            return NextResponse.json({
                error: 'Extension failed',
                message: data.error
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error en endpoint de prórroga:', error);
        return NextResponse.json({
            error: 'Server error',
            message: 'Error interno del servidor'
        }, { status: 500 });
    }
}
