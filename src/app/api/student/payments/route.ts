import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(request, ['member']);
        if (error) return error;

        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        return NextResponse.json({ success: true, payments: payments || [] });
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al cargar pagos';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
