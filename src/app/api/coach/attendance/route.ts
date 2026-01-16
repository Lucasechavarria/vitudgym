import { NextResponse } from 'next/server';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { ROLES } from '@/lib/constants/app';

/**
 * POST /api/coach/attendance/check-in
 * Registra la entrada del coach.
 */
export async function POST(request: Request) {
    try {
        const { supabase, user, error } = await authenticateAndRequireRole(
            request,
            [ROLES.COACH, ROLES.ADMIN]
        );

        if (error) return error;

        // Verificar si ya tiene una sesión abierta hoy sin cerrar
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data: activeSession } = await supabase
            .from('coach_attendance')
            .select('*')
            .eq('coach_id', user.id)
            .is('check_out', null)
            .gte('check_in', today.toISOString())
            .single();

        if (activeSession) {
            return NextResponse.json({
                error: 'Ya tienes una sesión activa. Debes registrar salida primero.'
            }, { status: 400 });
        }

        const { data, error: insertError } = await supabase
            .from('coach_attendance')
            .insert({
                coach_id: user.id,
                check_in: new Date().toISOString(),
                is_absent: false
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, attendance: data });

    } catch (error) {
        console.error('❌ Check-in error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al registrar entrada';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}

/**
 * PUT /api/coach/attendance/check-out
 * Registra la salida del coach.
 */
export async function PUT(request: Request) {
    try {
        const { supabase, user, error } = await authenticateAndRequireRole(
            request,
            [ROLES.COACH, ROLES.ADMIN]
        );

        if (error) return error;

        // Buscar la última sesión activa
        const { data: lastSession, error: searchError } = await supabase
            .from('coach_attendance')
            .select('*')
            .eq('coach_id', user.id)
            .is('check_out', null)
            .order('check_in', { ascending: false })
            .limit(1)
            .single();

        if (searchError || !lastSession) {
            return NextResponse.json({
                error: 'No se encontró una sesión activa para cerrar.'
            }, { status: 404 });
        }

        const { data, error: updateError } = await supabase
            .from('coach_attendance')
            .update({
                check_out: new Date().toISOString()
            })
            .eq('id', lastSession.id)
            .select()
            .single();

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, attendance: data });

    } catch (error) {
        console.error('❌ Check-out error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al registrar salida';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}

/**
 * GET /api/coach/attendance
 * Obtiene el historial de asistencia del coach actual.
 */
export async function GET(request: Request) {
    try {
        const { supabase, user, error } = await authenticateAndRequireRole(
            request,
            [ROLES.COACH, ROLES.ADMIN]
        );

        if (error) return error;

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const { data, error: fetchError } = await supabase
            .from('coach_attendance')
            .select('*')
            .eq('coach_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (fetchError) throw fetchError;

        return NextResponse.json({
            attendance: data,
            activeSession: data?.find(s => s.check_out === null && !s.is_absent) || null
        });

    } catch (error) {
        console.error('❌ Fetch attendance error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al obtener asistencia';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}

/**
 * PATCH /api/coach/attendance/absence
 * Reporta una ausencia justificada.
 */
export async function PATCH(request: Request) {
    try {
        const { supabase, user, error } = await authenticateAndRequireRole(
            request,
            [ROLES.COACH, ROLES.ADMIN]
        );

        if (error) return error;

        const body = await request.json();
        const { reason } = body;

        if (!reason) {
            return NextResponse.json({ error: 'Debes indicar el motivo.' }, { status: 400 });
        }

        const { data, error: insertError } = await supabase
            .from('coach_attendance')
            .insert({
                coach_id: user.id,
                check_in: null,
                check_out: null,
                is_absent: true,
                absence_reason: reason
            })
            .select()
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, absence: data });

    } catch (error) {
        console.error('❌ Report absence error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al reportar ausencia';
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
