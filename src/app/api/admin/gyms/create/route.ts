import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { error: authError } = await authenticateAndRequireRole(request, ['superadmin']);
        if (authError) return authError;

        const { nombre, slug, logo_url, sucursal_nombre, direccion } = await request.json();

        if (!nombre || !slug || !sucursal_nombre) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const adminClient = createAdminClient();

        // 1. Crear el gimnasio
        const { data: gym, error: gymError } = await adminClient
            .from('gimnasios')
            .insert({
                nombre,
                slug: slug.toLowerCase(),
                logo_url: logo_url || null
            })
            .select()
            .single();

        if (gymError) {
            if (gymError.code === '23505') throw new Error('El slug ya existe. Elige otro identificador.');
            throw gymError;
        }

        // 2. Crear la sucursal inicial
        const { error: branchError } = await adminClient
            .from('sucursales')
            .insert({
                gimnasio_id: gym.id,
                nombre: sucursal_nombre,
                direccion: direccion || null
            });

        if (branchError) throw branchError;

        return NextResponse.json({ success: true, gym });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Error creating gym:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
