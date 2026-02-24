import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const { id, nombre, slug, es_activo, logo_url } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID de gimnasio requerido' }, { status: 400 });
        }

        const supabase = createAdminClient();

        const { data: gym, error: gymError } = await supabase
            .from('gimnasios')
            .update({
                nombre,
                slug,
                es_activo,
                logo_url
            })
            .eq('id', id)
            .select()
            .single();

        if (gymError) throw gymError;

        return NextResponse.json({ success: true, gym });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Update Gym Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
