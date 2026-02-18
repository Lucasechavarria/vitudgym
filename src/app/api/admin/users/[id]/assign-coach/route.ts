import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * PUT /api/admin/users/[id]/assign-coach
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { id: userId } = await params;
        const body = await request.json();
        const { coachId } = body;

        console.log(`🤖 Usando RPC para asignar coach: User=${userId}, Coach=${coachId}`);

        // Llamada a la función RPC que maneja la lógica internamente en SQL
        // Esto evita errores de "column not found in schema cache" de PostgREST
        const { data: rpcData, error: rpcError } = await supabase!.rpc('assign_coach_safe', {
            p_user_id: userId,
            p_coach_id: coachId
        });

        if (rpcError) {
            console.error('❌ Error in RPC assign_coach_safe:', rpcError);
            throw new Error(`Error en base de datos (RPC): ${rpcError.message}`);
        }

        // El RPC devuelve un JSON con {success: boolean, message?: string, error?: string}
        if (rpcData && rpcData.success === false) {
            throw new Error(rpcData.error || 'Error desconocido en la función de asignación');
        }

        return NextResponse.json({
            success: true,
            message: rpcData?.message || 'Coach asignado correctamente'
        });

    } catch (error) {
        console.error('❌ Error assigning coach (CATCH):', error);
        const errorMessage = error instanceof Error ? error.message : 'Error interno desconocido';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
