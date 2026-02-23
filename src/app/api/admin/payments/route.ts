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

        // Obtener pagos con información del usuario - Usar nombres reales detectados
        const { data, error: paymentsError } = await supabase
            .from('pagos')
            .select(`
                *,
                perfiles!usuario_id (
                    *
                )
            `)
            .order('creado_en' as any, { ascending: false });

        if (paymentsError) {
            console.error('❌ Error loading payments:', paymentsError);
            // Fallback sin join si el join falla
            const fallback = await supabase.from('pagos').select('*').order('creado_en' as any, { ascending: false });
            if (fallback.error) throw fallback.error;
            return NextResponse.json({ success: true, payments: fallback.data.map((p: any) => normalizePayment(p)) });
        }

        const payments = (data || []).map((payment: any) => normalizePayment(payment));

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

function normalizePayment(payment: any) {
    const user = payment.perfiles || {};
    return {
        id: payment.id,
        amount: payment.monto,
        status: payment.estado,
        created_at: payment.created_at || payment.creado_en,
        concept: payment.concepto,
        payment_method: payment.metodo_pago,
        metadata: payment.metadatos,
        user_name: user.nombre_completo || `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre',
        user_email: user.correo || user.email || ''
    };
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
                metadatos: metadata,
                usuario_id: user_id || null // Expenses might not have a usuario_id
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
