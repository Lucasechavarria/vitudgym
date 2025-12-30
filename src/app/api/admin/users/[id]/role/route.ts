import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * PUT /api/admin/users/[id]/role
 * 
 * Cambia el rol de un usuario (solo admin/superadmin)
 */
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'superadmin']
        );

        if (error) return error;

        const { id } = await params;
        const userId = id;
        const body = await request.json();
        const { role } = body;

        // Validar rol
        const validRoles = ['member', 'coach', 'admin', 'superadmin'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({
                error: 'Rol inválido'
            }, { status: 400 });
        }

        // Verificar que no se está cambiando su propio rol
        if (userId === user.id) {
            return NextResponse.json({
                error: 'No puedes cambiar tu propio rol'
            }, { status: 400 });
        }

        // Obtener perfil actual del usuario
        const { data: targetProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        // Solo superadmin puede crear otros superadmins
        if (role === 'superadmin') {
            const { data: currentUserProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (currentUserProfile?.role !== 'superadmin') {
                return NextResponse.json({
                    error: 'Solo un superadmin puede asignar el rol de superadmin'
                }, { status: 403 });
            }
        }

        // Actualizar rol
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Registrar cambio en historial
        await supabase
            .from('profile_change_history')
            .insert({
                profile_id: userId,
                changed_by: user.id,
                field_name: 'role',
                old_value: targetProfile?.role || 'unknown',
                new_value: role,
                change_reason: `Cambio de rol por admin: ${user.email}`
            });

        return NextResponse.json({
            success: true,
            message: 'Rol actualizado correctamente'
        });

    } catch (error) {
        console.error('❌ Error updating role:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error updating role';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
