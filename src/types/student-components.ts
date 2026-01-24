import { Variants } from 'framer-motion';

export interface RoutineExercise {
    nombre: string;
    series: number | string;
    repeticiones: string;
}

export interface StudentRoutine {
    id?: string;
    nombre: string;
    objetivo?: string;
    ejercicios: RoutineExercise[];
    plan_nutricional_id?: string | null;
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
