import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    const { supabase, error } = await authenticateAndRequireRole(request, ['superadmin']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type') || 'all'; // 'all', 'system', 'impersonation'

    try {
        let results: any = {};

        if (type === 'all' || type === 'system') {
            const { data: systemLogs, error: sysError } = await supabase
                .from('audit_logs')
                .select(`
                    *,
                    perfiles:usuario_id (nombre_completo, email)
                `)
                .order('creado_en', { ascending: false })
                .range(offset, offset + limit - 1);

            if (sysError) throw sysError;
            results.systemLogs = systemLogs;
        }

        if (type === 'all' || type === 'impersonation') {
            const { data: impersonationLogs, error: impError } = await supabase
                .from('logs_acceso_remoto')
                .select(`
                    *,
                    admin:admin_id (nombre_completo, email),
                    admin_profile:admin_id (id, nombre_completo, email),
                    gimnasio:gimnasio_id (nombre)
                `)
                .order('creado_en', { ascending: false })
                .range(offset, offset + limit - 1);

            if (impError) throw impError;
            results.impersonationLogs = impersonationLogs;
        }

        return NextResponse.json(results);
    } catch (err: any) {
        console.error('Audit Log API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
