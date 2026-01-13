import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * POST /api/admin/users/[id]/activate
 * 
 * Activa manualmente la membresía de un usuario.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['admin', 'superadmin']);
        if (error) return error;

        const { id } = await params;
        const userId = id;
        const body = await request.json();
        const days = body.days || 30; // Default 30 dias

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        // Update profile
        const { error: updateError } = await supabase!
            .from('perfiles')
            .update({
                membership_status: 'active',
                membership_end_date: endDate.toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        // Log action (optional, could be in payments table as manual generic payment or audit log)

        return NextResponse.json({
            success: true,
            message: `Membresía activada por ${days} días`,
            newEndDate: endDate.toISOString()
        });

    } catch (error) {
        console.error('❌ Error activating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error activating user';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
