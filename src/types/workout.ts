
export interface ExerciseLog {
    exercise_id: string;
    actual_sets: number;
    actual_reps: string;
    actual_weight: number;
    rest_time_seconds: number;
    is_completed: boolean;
}

export interface WorkoutSessionState {
    id: string;
    routine_id: string;
    start_time: string;
    status: 'active' | 'paused' | 'completed';
    current_exercise_index: number;
    logs: Record<string, ExerciseLog>;
    total_points: number;
}
