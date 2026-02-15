
import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

export async function GET(request: Request) {
    try {
        const { user, supabase, error } = await authenticateAndRequireRole(
            request,
            ['admin', 'coach']
        );

        if (error) return error;

        // Fetch nutrition plans with user details
        const { data, error: dbError } = await supabase!
            .from('planes_nutricionales')
            .select(`
                *,
                user:perfiles!nutrition_plans_user_id_fkey(
                    nombre_completo,
                    email:correo
                ),
                coach:perfiles!nutrition_plans_coach_id_fkey(
                    nombre_completo
                )
            `)
            .order('creado_en', { ascending: false });

        if (dbError) {
            console.error('Error fetching nutrition plans:', dbError);
            return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in nutrition API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
