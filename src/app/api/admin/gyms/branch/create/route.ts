import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkGymLimits } from '@/lib/saas/limits';

export async function POST(request: Request) {
    try {
        const { error: authError, user } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (authError) return authError;

        const { gymId, nombre, direccion } = await request.json();

        if (!gymId || !nombre) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // 1. Verificar límites del plan
        const limits = await checkGymLimits(gymId);
        if (!limits.canAddBranch) {
            return NextResponse.json({
                error: 'Límite de sedes alcanzado',
                details: `Tu plan actual permite hasta ${limits.limitBranches} sedes. Por favor, mejora tu plan en Configuración > Facturación.`,
                reason: limits.reason
            }, { status: 403 });
        }

        const { data: sucursal, error: sucursalError } = await supabase
            .from('sucursales')
            .insert({
                gimnasio_id: gymId,
                nombre,
                direccion
            })
            .select()
            .single();

        if (sucursalError) throw sucursalError;

        return NextResponse.json({ success: true, sucursal });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Create Branch Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
