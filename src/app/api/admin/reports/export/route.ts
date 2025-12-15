import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reports } from '@/lib/export';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Verificar autenticación
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Verificar rol de admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const body = await request.json();
        const { type, format } = body;

        // Obtener datos según tipo de reporte
        let data: any[] = [];

        switch (type) {
            case 'users': {
                const { data: users } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                data = users || [];
                break;
            }

            case 'payments': {
                const { data: payments } = await supabase
                    .from('payments')
                    .select(`
                        *,
                        profiles:user_id (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false });

                data = payments?.map(p => ({
                    ...p,
                    user_name: (p.profiles as any)?.full_name
                })) || [];
                break;
            }

            case 'access-logs': {
                const { data: logs } = await supabase
                    .from('routine_access_logs')
                    .select(`
                        *,
                        profiles:user_id (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(1000);

                data = logs?.map(l => ({
                    ...l,
                    user_name: (l.profiles as any)?.full_name,
                    timestamp: l.created_at
                })) || [];
                break;
            }

            case 'routines': {
                const { data: routines } = await supabase
                    .from('routines')
                    .select(`
                        *,
                        student:student_id (
                            full_name
                        ),
                        coach:coach_id (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false });

                data = routines?.map(r => ({
                    ...r,
                    student_name: (r.student as any)?.full_name,
                    coach_name: (r.coach as any)?.full_name
                })) || [];
                break;
            }

            default:
                return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
        }

        // Exportar según formato
        await reports[type as keyof typeof reports](data, format);

        return NextResponse.json({ success: true, count: data.length });

    } catch (error) {
        console.error('Error exporting report:', error);
        return NextResponse.json(
            { error: 'Error al exportar reporte' },
            { status: 500 }
        );
    }
}
