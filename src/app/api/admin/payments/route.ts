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
        const { data, error: paymentsError } = await supabase
            .from('payments')
            .select(`
                *,
                perfiles!payments_user_id_fkey (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data
        const payments = (data || []).map((payment: { id: string; amount: number; status: string; created_at: string; perfiles?: { full_name?: string; email?: string } }) => ({
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            date: payment.created_at,
            user_name: payment.perfiles?.full_name || 'Sin nombre',
            user_email: payment.perfiles?.email || ''
        }));

        return NextResponse.json({
            success: true,
            payments: payments
        });

    } catch (_error) {
        const err = _error as Error;
        console.error('Error loading payments:', err);
        return NextResponse.json({
            error: err.message || 'Error loading payments'
        }, { status: 500 });
    }
}

/**
 * POST /api/admin/payments
 * 
 * Registra un nuevo pago o gasto (solo admin)
 */
export async function POST(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        const body = await request.json();
        const { concept, amount, status, payment_method, payment_provider, notes, metadata, user_id } = body;

        const { data, error: insertError } = await supabase
            .from('payments')
            .insert({
                concept,
                amount,
                status: status || 'pending',
                payment_method: payment_method || 'manual',
                payment_provider: payment_provider || 'internal',
                notes,
                metadata,
                user_id: user_id || null // Expenses might not have a user_id
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            payment: data
        });

    } catch (_error) {
        const err = _error as Error;
        console.error('Error saving payment:', err);
        return NextResponse.json({
            error: err.message || 'Error saving payment'
        }, { status: 500 });
    }
}
