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
            .select('rol')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Perfil de usuario no encontrado' }, { status: 403 });
        }

        if (profile.rol !== 'coach' && profile.rol !== 'admin') {
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
                    .order('creado_en', { ascending: false });
                data = users || [];
                break;
            }

            case 'payments': {
                const { data: payments } = await supabase
                    .from('pagos')
                    .select(`
                        *,
                        perfiles!usuario_id (
                            nombre_completo
                        )
                    `)
                    .order('creado_en', { ascending: false });

                data = (payments as any[])?.map(p => ({
                    ...p,
                    user_name: (p.perfiles as any)?.nombre_completo
                })) || [];
                break;
            }

            case 'access-logs': {
                const { data: logs } = await supabase
                    .from('registros_acceso_rutina')
                    .select(`
                        *,
                        perfiles!usuario_id (
                            nombre_completo
                        )
                    `)
                    .order('creado_en', { ascending: false })
                    .limit(1000);

                data = (logs as any[])?.map(l => ({
                    ...l,
                    user_name: (l.perfiles as any)?.nombre_completo,
                    timestamp: l.creado_en
                })) || [];
                break;
            }

            case 'routines': {
                const { data: routines } = await supabase
                    .from('rutinas')
                    .select(`
                        *,
                        student:perfiles!usuario_id (
                            nombre_completo
                        ),
                        coach:perfiles!entrenador_id (
                            nombre_completo
                        )
                    `)
                    .order('creado_en', { ascending: false });

                data = (routines as any[])?.map(r => ({
                    ...r,
                    student_name: (r.student as any)?.nombre_completo,
                    coach_name: (r.coach as any)?.nombre_completo
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
