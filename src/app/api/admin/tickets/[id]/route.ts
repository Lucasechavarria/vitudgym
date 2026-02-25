import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    try {
        const body = await request.json();
        const { estado, prioridad } = body;

        const { data, error: updateError } = await supabase
            .from('tickets_soporte_saas')
            .update({
                estado,
                prioridad,
                actualizado_en: new Date().toISOString()
            })
            .eq('id', params.id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ ticket: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
