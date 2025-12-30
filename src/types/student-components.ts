import { Variants } from 'framer-motion';

export interface RoutineExercise {
    name: string;
    sets: number | string;
    reps: string;
}

export interface StudentRoutine {
    id?: string;
    name: string;
    goal?: string;
    exercises: RoutineExercise[];
    nutrition_plan_id?: string | null;
}

export interface EvolutionChartData {
    week: string;
    peso: number;
    musculo: number;
}

export interface AttendanceChartData {
    month: string;
    rate: number;
}

// Re-export Variants for easier usage in components without importing framer-motion everywhere
export type ItemVariants = Variants;
