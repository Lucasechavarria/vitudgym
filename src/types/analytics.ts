// Tipos para Analytics y Métricas del Coach

/**
 * Estructura de un booking de clase
 */
export interface ClassBooking {
    id: string;
    user_id: string;
    class_id: string;
    date: string; // ISO 8601
    status: 'confirmed' | 'attended' | 'no_show' | 'cancelled';
    created_at: string;
}

/**
 * Estructura de una medición física
 */
export interface Measurement {
    id: string;
    user_id: string;
    weight?: number; // kg
    height?: number; // cm
    body_fat_percentage?: number;
    muscle_mass?: number; // kg
    recorded_at: string; // ISO 8601
    notes?: string;
}

/**
 * Estructura de un ejercicio en una rutina
 */
export interface RoutineExercise {
    id: string;
    routine_id: string;
    exercise_name: string;
    sets: number;
    reps: string; // Puede ser "10" o "8-12" o "AMRAP"
    weight?: number;
    rest_seconds?: number;
    notes?: string;
}

/**
 * Estructura de una rutina
 */
export interface Routine {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    is_active: boolean;
    exercises?: RoutineExercise[];
    created_at: string;
}

/**
 * Métricas de asistencia por mes
 */
export interface MonthlyAttendance {
    month: string; // "Ene", "Feb", etc.
    rate: number; // Porcentaje 0-100
    attended?: number; // Número de clases asistidas
    total?: number; // Total de clases
}

/**
 * Resumen de métricas del coach
 */
export interface CoachAnalytics {
    attendance: MonthlyAttendance[];
    measurements: Measurement[];
    prescribedVolume: number;
    summary: {
        attendanceRate: number; // Porcentaje 0-100
        totalAttended: number;
    };
}
