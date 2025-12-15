/**
 * AI Routine Types
 */

export interface Routine {
    id?: string;
    routineName: string;
    motivationalQuote: string;
    duration: string;
    medicalConsiderations?: string;
    warmup: Exercise[];
    mainWorkout: WorkoutExercise[];
    cooldown: Exercise[];
    createdAt?: Date;
    createdBy?: string; // coach ID
    assignedTo?: string; // student ID
}

export interface Exercise {
    exercise: string;
    duration: string;
    notes: string;
}

export interface WorkoutExercise {
    name: string;
    sets: number;
    reps: string;
    rest: string;
    equipment: string;
    notes: string;
}

export interface RoutineParams {
    studentId: string;
    goal: string;
    coachNotes?: string;
}

export type TrainingGoal =
    | 'Hipertrofia'
    | 'Pérdida de Peso'
    | 'Fuerza Máxima'
    | 'Resistencia'
    | 'Rehabilitación'
    | 'Movilidad';
