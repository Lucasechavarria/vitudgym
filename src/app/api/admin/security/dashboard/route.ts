import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Verificar rol de admin
        const { data: profile } = await supabase
            .from('perfiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        // Obtener métricas de seguridad
        const now = new Date();
        const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Total de accesos
        const { count: totalAccess } = await supabase
            .from('routine_access_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', last24h.toISOString());

        // Accesos sospechosos (múltiples intentos fallidos desde misma IP)
        const { data: suspiciousIPs } = await supabase
            .from('routine_access_logs')
            .select('ip_address')
            .eq('action', 'failed_login')
            .gte('created_at', last24h.toISOString());

        const ipCounts = suspiciousIPs?.reduce((acc: any, log: any) => {
            acc[log.ip_address] = (acc[log.ip_address] || 0) + 1;
            return acc;
        }, {});

        const suspiciousAccess = Object.values(ipCounts || {}).filter((count: any) => count >= 3).length;

        // Intentos fallidos
        const { count: failedLogins } = await supabase
            .from('routine_access_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'failed_login')
            .gte('created_at', last24h.toISOString());

        // Usuarios activos (últimas 24h)
        const { data: activeUsersData } = await supabase
            .from('routine_access_logs')
            .select('user_id')
            .gte('created_at', last24h.toISOString());

        const uniqueUsers = new Set(activeUsersData?.map(log => log.user_id));
        const activeUsers = uniqueUsers.size;

        // Obtener logs recientes con información de usuario
        const { data: logs } = await supabase
            .from('routine_access_logs')
            .select(`
                id,
                user_id,
                action,
                ip_address,
                device_info,
                created_at,
                profiles:user_id (
                    full_name
                )
            `)
            .order('created_at', { ascending: false })
            .limit(50);

        // Formatear logs
        const formattedLogs = logs?.map(log => ({
            id: log.id,
            user_name: (log.profiles as any)?.full_name || 'Usuario desconocido',
            action: log.action,
            ip_address: log.ip_address || 'N/A',
            device: log.device_info || 'Desconocido',
            timestamp: log.created_at,
            status: log.action === 'failed_login' ? 'failed' :
                (ipCounts?.[log.ip_address || ''] >= 3 ? 'suspicious' : 'success')
        }));

        return NextResponse.json({
            metrics: {
                totalAccess: totalAccess || 0,
                suspiciousAccess,
                failedLogins: failedLogins || 0,
                activeUsers
            },
            logs: formattedLogs || []
        });

    } catch (error) {
        console.error('Error fetching security dashboard:', error);
        return NextResponse.json(
            { error: 'Error al cargar datos de seguridad' },
            { status: 500 }
        );
    }
}
