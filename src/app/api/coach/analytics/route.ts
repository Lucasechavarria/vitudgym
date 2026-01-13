import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { ClassBooking, Routine, RoutineExercise, MonthlyAttendance } from '@/types/analytics';

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { searchParams } = new URL(req.url);
        const studentId = searchParams.get('studentId');
        const viewMode = searchParams.get('mode') || 'individual'; // individual, group

        // 1. Auth & Verify Coach
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('perfiles').select('role').eq('id', user.id).single() as { data: { role: string } | null };
        if (!profile || (profile.role !== 'coach' && profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Fetch Attendance Data
        let attendanceQuery = supabase
            .from('reservas_de_clase')
            .select('date, status')
            .in('status', ['attended', 'confirmed', 'no_show']);

        if (studentId && viewMode === 'individual') {
            attendanceQuery = attendanceQuery.eq('user_id', studentId);
        }

        const { data: bookings } = await attendanceQuery;

        // Convertir a tipo compatible (solo tenemos date y status del query)
        const bookingsData: Pick<ClassBooking, 'date' | 'status'>[] = bookings || [];
        const attendanceMetrics = processAttendance(bookingsData);

        // 3. Fetch Measurements / Physical Progress
        let measurementsData = [];
        if (studentId && viewMode === 'individual') {
            const { data } = await supabase
                .from('mediciones')
                .select('*')
                .eq('user_id', studentId)
                .order('recorded_at', { ascending: true });
            measurementsData = data || [];
        } else {
            // Global averages or summary if needed
        }

        // 4. Fetch Training Volume (Prescribed)
        let volumeData = [];
        const { data: upcomingClasses } = await supabase
            .from('horarios_de_clase')
            .select(`
                *,
                actividades (name, image_url),
                reservas_de_clase (count)
            `);
        let routinesQuery = supabase
            .from('rutinas')
            .select(`
                id,
                name,
                user_id,
                ejercicios (sets, reps)
            `)
            .eq('is_active', true);

        if (studentId && viewMode === 'individual') {
            routinesQuery = routinesQuery.eq('user_id', studentId);
        }

        const { data: routines } = await routinesQuery;

        // Cálculo de volumen con validaciones robustas
        const totalPrescribedVolume = (routines as any[])?.reduce((acc, routine) => {
            // Validar que routine tenga la estructura esperada
            if (!routine || !Array.isArray(routine.ejercicios)) {
                // console.warn('⚠️ Rutina sin ejercicios válidos:', routine?.id);
                return acc;
            }

            const routineVolume = routine.ejercicios.reduce((sAcc: number, ex: any) => { // Use 'any' for exercise to avoid strict type issues on 'never'
                // Validar sets
                if (!ex.sets || ex.sets <= 0) {
                    // console.warn('⚠️ Ejercicio sin sets válidos:', ex);
                    return sAcc;
                }

                // Parsear reps de forma segura (puede ser "10", "8-12", "AMRAP")
                let reps = 10; // Valor por defecto
                if (ex.reps) {
                    // Si es un rango como "8-12", tomar el promedio
                    if (typeof ex.reps === 'string' && ex.reps.includes('-')) {
                        const [min, max] = ex.reps.split('-').map((r: string) => parseInt(r.trim()));
                        if (!isNaN(min) && !isNaN(max)) {
                            reps = Math.round((min + max) / 2);
                        }
                    } else if (typeof ex.reps === 'string' && ex.reps.toLowerCase() !== 'amrap') {
                        // Si es un número simple
                        const parsedReps = parseInt(ex.reps);
                        if (!isNaN(parsedReps) && parsedReps > 0) {
                            reps = parsedReps;
                        }
                    } else if (typeof ex.reps === 'number') {
                        reps = ex.reps;
                    }
                    // Si es AMRAP, usar valor por defecto de 10
                }

                return sAcc + (ex.sets * reps);
            }, 0);

            return acc + routineVolume;
        }, 0) || 0;

        console.log('📊 Analytics calculados:', {
            studentId,
            viewMode,
            totalPrescribedVolume,
            attendanceRate: calculateAttendanceRate(bookingsData)
        });

        return NextResponse.json({
            success: true,
            metrics: {
                attendance: attendanceMetrics,
                measurements: measurementsData,
                prescribedVolume: totalPrescribedVolume,
                summary: {
                    attendanceRate: calculateAttendanceRate(bookingsData),
                    totalAttended: bookingsData?.filter(b => b.status === 'attended').length || 0,
                }
            }
        });

    } catch (error) {
        console.error('❌ Analytics API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error al calcular analytics';

        // Logging mejorado para debugging
        const { searchParams } = new URL(req.url);
        console.error('Context:', {
            studentId: searchParams.get('studentId'),
            mode: searchParams.get('mode'),
            error: errorMessage
        });

        // Opcional: Integración con Sentry si está disponible
        try {
            const Sentry = require('@sentry/nextjs');
            Sentry.captureException(error, {
                extra: {
                    studentId: searchParams.get('studentId'),
                    mode: searchParams.get('mode')
                }
            });
        } catch (sentryError) {
            // Sentry no disponible, continuar sin él
        }

        return NextResponse.json({
            error: 'Internal Server Error',
            message: errorMessage
        }, { status: 500 });
    }
}

/**
 * Procesa datos de asistencia y calcula métricas por mes
 * @param bookings - Array de bookings de clases (solo necesita date y status)
 * @returns Array de métricas mensuales de asistencia
 */
function processAttendance(bookings: Pick<ClassBooking, 'date' | 'status'>[]): MonthlyAttendance[] {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();

    // Validación de entrada
    if (!Array.isArray(bookings)) {
        console.warn('⚠️ processAttendance recibió datos inválidos');
        return months.map(m => ({ month: m, rate: 0, attended: 0, total: 0 }));
    }

    const result = bookings.reduce((acc: Record<string, { month: string; attended: number; total: number }>, booking) => {
        // Validar estructura del booking
        if (!booking || !booking.date) {
            console.warn('⚠️ Booking sin fecha:', booking);
            return acc;
        }

        const date = new Date(booking.date);

        // Validar fecha válida
        if (isNaN(date.getTime())) {
            console.warn('⚠️ Fecha inválida en booking:', booking.date);
            return acc;
        }

        // Solo procesar bookings del año actual
        if (date.getFullYear() !== currentYear) return acc;

        const month = months[date.getMonth()];
        if (!acc[month]) acc[month] = { month, attended: 0, total: 0 };

        acc[month].total++;
        if (booking.status === 'attended') acc[month].attended++;
        return acc;
    }, {});

    return months.map(m => {
        const data = result[m] || { month: m, attended: 0, total: 0 };
        return {
            month: m,
            rate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
            attended: data.attended,
            total: data.total
        };
    });
}

/**
 * Calcula la tasa de asistencia general
 * @param bookings - Array de bookings de clases (solo necesita status)
 * @returns Porcentaje de asistencia (0-100)
 */
function calculateAttendanceRate(bookings: Pick<ClassBooking, 'status'>[]): number {
    // Validación de entrada
    if (!Array.isArray(bookings) || bookings.length === 0) {
        return 0;
    }

    const attended = bookings.filter(b => b && b.status === 'attended').length;

    // Prevenir división por cero
    if (bookings.length === 0) return 0;

    return Math.round((attended / bookings.length) * 100);
}
