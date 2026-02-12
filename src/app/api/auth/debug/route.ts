import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // Obtener detalles del usuario y la sesión
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({
                authenticated: false,
                error: authError?.message || 'Not authenticated'
            }, { status: 401 });
        }

        // Consultar el perfil en la DB para comparar con el JWT
        const { data: profile, error: profileError } = await supabase
            .from('perfiles')
            .select('*')
            .eq('id', user.id)
            .single();

        return NextResponse.json({
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                app_metadata: user.app_metadata,
                user_metadata: user.user_metadata,
            },
            database_profile: profile ? {
                id: profile.id,
                rol: profile.rol,
                nombre_completo: profile.nombre_completo,
            } : null,
            database_error: profileError ? {
                message: profileError.message,
                code: profileError.code,
                details: profileError.details
            } : null,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}
