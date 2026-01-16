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

        // Fetch user profile to check role
        const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 403 });
        }

        if (profile.role !== 'coach' && profile.role !== 'admin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const body = await request.json();
        const { type, format } = body;

        // Obtener datos según tipo de reporte
        let data: any[] = [];

        switch (type) {
            case 'users': {
                const { data: users } = await supabase
                    .from('perfiles')
                    .select('*')
                    .order('created_at', { ascending: false });
                data = users || [];
                break;
            }

            case 'payments': {
                const { data: payments } = await supabase
                    .from('pagos' as any) // Assuming payments table might also be renamed or just issues
                    .select(`
                        *,
                        perfiles:user_id (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false });

                data = (payments as any[])?.map(p => ({
                    ...p,
                    user_name: (p.perfiles as any)?.full_name
                })) || [];
                break;
            }

            case 'access-logs': {
                const { data: logs } = await supabase
                    .from('registros_acceso_rutina' as any)
                    .select(`
                        *,
                        profiles:user_id (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false })
                    .limit(1000);

                data = (logs as any[])?.map(l => ({
                    ...l,
                    user_name: (l.perfiles as any)?.full_name,
                    timestamp: l.created_at
                })) || [];
                break;
            }

            case 'routines': {
                const { data: routines } = await supabase
                    .from('rutinas')
                    .select(`
                        *,
                        student:user_id (
                            full_name
                        ),
                        coach:created_by (
                            full_name
                        )
                    `)
                    .order('created_at', { ascending: false });

                data = (routines as any[])?.map(r => ({
                    ...r,
                    student_name: (r.perfiles_user_id as any)?.full_name,
                    coach_name: (r.perfiles_created_by as any)?.full_name
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
