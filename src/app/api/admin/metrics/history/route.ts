import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    try {
        const { data: metrics, error: metricsError } = await supabase
            .from('saas_metrics')
            .select('*')
            .order('fecha', { ascending: true })
            .limit(30);

        if (metricsError) throw metricsError;

        return NextResponse.json({ metrics });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
