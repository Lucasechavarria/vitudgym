import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const gymId = searchParams.get('gymId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
        let query = supabase
            .from('pagos')
            .select(`
                *,
                usuario:usuario_id (nombre_completo, correo, gimnasio_id),
                gimnasio:gimnasio_id (nombre)
            `)
            .order('creado_en', { ascending: false })
            .range(0, limit - 1);

        if (gymId) query = query.eq('gimnasio_id', gymId);
        if (status) query = query.eq('estado', status);
        if (startDate) query = query.gte('creado_en', startDate);
        if (endDate) query = query.lte('creado_en', endDate);

        const { data: payments, error: payError } = await query;
        if (payError) throw payError;

        // También obtener pagos de subscripción (SaaS) si queremos ver todo
        const { data: saasPayments, error: saasError } = await supabase
            .from('saas_pagos_historial')
            .select('*, gimnasio:gimnasio_id(nombre)')
            .order('fecha_pago', { ascending: false })
            .limit(50);

        if (saasError) console.error('Error fetching SaaS payments:', saasError);

        return NextResponse.json({
            memberPayments: payments || [],
            saasPayments: saasPayments || []
        });

    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Finance API Error:', err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
