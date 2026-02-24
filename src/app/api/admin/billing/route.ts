import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/billing/gyms
 * Lista todos los gimnasios con su estado de facturación.
 */
export async function GET(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const adminClient = createAdminClient() as any;

        const { data: gyms, error: dbError } = await adminClient
            .from('gimnasios')
            .select(`
                id,
                nombre,
                slug,
                estado_pago_saas,
                fecha_proximo_pago,
                descuento_saas,
                planes_suscripcion (nombre)
            `)
            .order('nombre', { ascending: true });

        if (dbError) throw dbError;

        return NextResponse.json({ gyms });
    } catch (error: any) {
        console.error('Billing List Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * POST /api/admin/billing/update-status
 * Actualiza el estado de pago o descuento de un el gimnasio.
 */
export async function POST(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const { gymId, status, discount, nextBillingDate } = await request.json();

        const adminClient = createAdminClient() as any;

        const updateData: any = {};
        if (status) updateData.estado_pago_saas = status;
        if (discount !== undefined) updateData.descuento_saas = discount;
        if (nextBillingDate) updateData.fecha_proximo_pago = nextBillingDate;

        const { error } = await adminClient
            .from('gimnasios')
            .update(updateData)
            .eq('id', gymId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
