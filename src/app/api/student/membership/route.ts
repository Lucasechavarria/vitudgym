import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['member']);
        if (error) return error;

        const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select(`
                estado_membresia,
                fecha_inicio_membresia,
                fecha_fin_membresia,
                plan_id,
                plan_actual: planes_gimnasio(*)
            `)
            .eq('id', user.id)
            .single();

        if (profileError) throw profileError;

        return NextResponse.json({ success: true, membership: profile });
    } catch (error) {
        console.error('❌ Error fetching membership:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar membresía';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
