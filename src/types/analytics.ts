// Tipos para Analytics y Métricas del Coach

/**
 * Estructura de un booking de clase
 */
export interface ClassBooking {
    id: string;
    usuario_id: string;
    clase_id: string;
    fecha: string; // ISO 8601
    estado: 'confirmed' | 'attended' | 'no_show' | 'cancelled' | 'reservada' | 'asistida' | 'cancelada' | 'en_lista_espera' | 'no_asistio';
    creado_en: string;
}

/**
 * Estructura de una medición física
 */
export interface Measurement {
    id: string;
    usuario_id: string;
    weight?: number; // kg
    height?: number; // cm
    body_fat_percentage?: number;
    muscle_mass?: number; // kg
    registrado_en: string; // ISO 8601
    notes?: string;
}

/**
 * Estructura de un ejercicio en una rutina
 */
export interface RoutineExercise {
    id: string;
    rutina_id: string;
    nombre_ejercicio: string;
    series: number;
    repeticiones: string; // Puede ser "10" o "8-12" o "AMRAP"
    peso?: number;
    descanso_segundos?: number;
    notas?: string;
}

/**
 * Estructura de una rutina
 */
export interface Routine {
    id: string;
    usuario_id: string;
    nombre: string;
    descripcion?: string;
    esta_activa: boolean;
    ejercicios?: RoutineExercise[];
    creado_en: string;
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
