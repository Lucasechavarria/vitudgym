import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/payments
 * 
 * Obtiene lista de todos los pagos (solo admin)
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        // Obtener pagos con información del usuario
        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select(`
                *,
                profiles!payments_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;

        const paymentsWithUserInfo = (payments || []).map(payment => ({
            ...payment,
            user_name: payment.profiles?.full_name || 'Sin nombre',
            user_email: payment.profiles?.email || ''
        }));

        return NextResponse.json({
            success: true,
            payments: paymentsWithUserInfo
        });

    } catch (error: any) {
        console.error('Error loading payments:', error);
        return NextResponse.json({
            error: error.message || 'Error loading payments'
        }, { status: 500 });
    }
}
