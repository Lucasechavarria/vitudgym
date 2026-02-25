import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    try {
        const { data: plans, error: plansError } = await supabase
            .from('planes_suscripcion')
            .select('*')
            .order('precio_mensual', { ascending: true });

        if (plansError) throw plansError;

        return NextResponse.json({ plans });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    try {
        const body = await request.json();
        const { data, error: insertError } = await supabase
            .from('planes_suscripcion')
            .insert({
                nombre: body.nombre,
                precio_mensual: body.precio_mensual,
                limite_sucursales: body.limite_sucursales,
                limite_usuarios: body.limite_usuarios,
                caracteristicas: body.caracteristicas || []
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ plan: data });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
