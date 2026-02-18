import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';

/**
 * GET /api/admin/coaches/list
 * 
 * Devuelve lista de usuarios que pueden ser asignados como coaches (coach, admin, superadmin).
 */
export async function GET(request: Request) {
    try {
        const { supabase, error } = await authenticateAndRequireRole(request, ['admin', 'coach']);
        if (error) return error;

        // Depuración: Probar una consulta mínima para ver qué columnas existen realmente
        const { data: testData, error: testError } = await supabase!.from('perfiles').select('*').limit(1);
        if (testData && testData.length > 0) {
            console.log('🔍 [DEBUG] Columnas disponibles en perfiles:', Object.keys(testData[0]));
        }

        const { data: coaches, error: dbError } = await supabase!
            .from('perfiles')
            .select('*')
            // Filtro flexible: probar con 'rol' y como fallback no filtrar si falla
            .in('rol' as any, ['coach', 'admin', 'profesor', 'administrador', 'Coach', 'Admin', 'Profesor', 'Administrador']);

        if (dbError) {
            console.error('❌ [DEBUG] Error en consulta de coaches:', dbError);
            // Fallback ultra-seguro: traer todo pero filtrar en memoria por rol
            const fallback = await supabase!.from('perfiles').select('*');
            if (fallback.error) throw fallback.error;

            const filtered = (fallback.data as any[]).filter(u =>
                ['coach', 'admin', 'profesor', 'administrador', 'Coach', 'Admin', 'Profesor', 'Administrador'].includes(u.rol)
            );

            return NextResponse.json({ coaches: normalizeCoaches(filtered) });
        }

        return NextResponse.json({ coaches: normalizeCoaches(coaches) });

    } catch (error: any) {
        console.error('❌ Error crítico fetching coaches:', error);
        return NextResponse.json({
            error: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        }, { status: 500 });
    }
}

function normalizeCoaches(data: any[]) {
    return (data as any[])
        ?.filter(c => ['coach', 'admin', 'profesor', 'administrador', 'Coach', 'Admin', 'Profesor', 'Administrador'].includes(c.rol))
        .map(c => {
            const email = c.correo || c.email || '';
            const nombre = c.nombre_completo || `${c.nombre || ''} ${c.apellido || ''}`.trim() || email;

            return {
                id: c.id,
                nombre_completo: nombre,
                email: email,
                rol: ['coach', 'profesor', 'Coach', 'Profesor'].includes(c.rol) ? 'coach' : 'admin'
            };
        });
}
