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
            .from('pagos')
            .select(`
                *,
                perfiles!pagos_user_id_fkey (
                    nombre_completo,
                    email:correo
                )
            `)
            .order('creado_en', { ascending: false });

        if (paymentsError) throw paymentsError;

        // Transform data
        const payments = (data || []).map((payment: any) => ({
            id: payment.id,
            amount: payment.monto,
            status: payment.estado,
            created_at: payment.creado_en, // Return created_at as expected by frontend
            concept: payment.concepto,
            payment_method: payment.metodo_pago,
            metadata: payment.metadata,
            user_name: payment.perfiles?.nombre_completo || 'Sin nombre',
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
            .from('pagos')
            .insert({
                concepto: concept,
                monto: amount,
                estado: status || 'pending',
                metodo_pago: payment_method || 'manual',
                proveedor_pago: payment_provider || 'internal',
                notas: notes,
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
