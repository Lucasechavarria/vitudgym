export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "13.0.5"
    }
    public: {
        Tables: {
            achievements: {
                Row: {
                    created_at: string
                    description: string
                    icon: string
                    id: string
                    name: string
                    points_reward: number
                }
                Insert: {
                    created_at?: string
                    description: string
                    icon: string
                    id?: string
                    name: string
                    points_reward?: number
                }
                Update: {
                    created_at?: string
                    description?: string
                    icon?: string
                    id?: string
                    name?: string
                    points_reward?: number
                }
                Relationships: []
            }
            activities: {
                Row: {
                    booked_spots: number | null
                    capacity: number | null
                    created_at: string | null
                    date: string | null
                    description: string | null
                    id: string
                    is_paid: boolean | null
                    name: string | null
                    price: number | null
                    status: string | null
                    time: string | null
                    trainer: string | null
                    type: string | null
                }
                Insert: {
                    booked_spots?: number | null
                    capacity?: number | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    id?: string
                    is_paid?: boolean | null
                    name?: string | null
                    price?: number | null
                    status?: string | null
                    time?: string | null
                    trainer?: string | null
                    type?: string | null
                }
                Update: {
                    booked_spots?: number | null
                    capacity?: number | null
                    created_at?: string | null
                    date?: string | null
                    description?: string | null
                    id?: string
                    is_paid?: boolean | null
                    name?: string | null
                    price?: number | null
                    status?: string | null
                    time?: string | null
                    trainer?: string | null
                    type?: string | null
                }
                Relationships: []
            }
            challenge_participants: {
                Row: {
                    challenge_id: string
                    joined_at: string | null
                    progress: number | null
                    status: string | null
                    user_id: string
                }
                Insert: {
                    challenge_id: string
                    joined_at?: string | null
                    progress?: number | null
                    status?: string | null
                    user_id: string
                }
                Update: {
                    challenge_id?: string
                    joined_at?: string | null
                    progress?: number | null
                    status?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "challenge_participants_challenge_id_fkey"
                        columns: ["challenge_id"]
                        isOneToOne: false
                        referencedRelation: "challenges"
                        referencedColumns: ["id"]
                    },
                ]
            }
            challenges: {
                Row: {
                    created_at: string | null
                    description: string | null
                    end_date: string | null
                    id: string
                    participants: number | null
                    prize: string | null
                    start_date: string | null
                    status: string | null
                    title: string | null
                    type: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    participants?: number | null
                    prize?: string | null
                    start_date?: string | null
                    status?: string | null
                    title?: string | null
                    type?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    participants?: number | null
                    prize?: string | null
                    start_date?: string | null
                    status?: string | null
                    title?: string | null
                    type?: string | null
                }
                Relationships: []
            }
            chatmessage: {
                Row: {
                    created_at: string
                    family_id: number
                    id: number
                    message: string
                    user_id: number
                }
                Insert: {
                    created_at: string
                    family_id: number
                    id?: number
                    message: string
                    user_id: number
                }
                Update: {
                    created_at?: string
                    family_id?: number
                    id?: number
                    message?: string
                    user_id?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "chatmessage_family_id_fkey"
                        columns: ["family_id"]
                        isOneToOne: false
                        referencedRelation: "family"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "chatmessage_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "user"
                        referencedColumns: ["id"]
                    },
                ]
            }
            class_bookings: {
                Row: {
                    attended: boolean | null
                    booking_date: string | null
                    class_id: string | null
                    created_at: string | null
                    id: string
                    payment_id: string | null
                    payment_status: string | null
                    status: string | null
                    user_id: string | null
                }
                Insert: {
                    attended?: boolean | null
                    booking_date?: string | null
                    class_id?: string | null
                    created_at?: string | null
                    id?: string
                    payment_id?: string | null
                    payment_status?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Update: {
                    attended?: boolean | null
                    booking_date?: string | null
                    class_id?: string | null
                    created_at?: string | null
                    id?: string
                    payment_id?: string | null
                    payment_status?: string | null
                    status?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "class_bookings_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "activities"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_bookings_class_id_fkey"
                        columns: ["class_id"]
                        isOneToOne: false
                        referencedRelation: "classes_with_availability"
                        referencedColumns: ["id"]
                    },
                ]
            }
            class_schedules: {
                Row: {
                    capacity: number
                    created_at: string | null
                    day_of_week: number
                    description: string | null
                    duration_minutes: number
                    end_time: string
                    id: string
                    is_active: boolean | null
                    recurrence_pattern: string | null
                    start_time: string
                    title: string
                    trainer_id: string | null
                }
                Insert: {
                    capacity?: number
                    created_at?: string | null
                    day_of_week: number
                    description?: string | null
                    duration_minutes?: number
                    end_time: string
                    id?: string
                    is_active?: boolean | null
                    recurrence_pattern?: string | null
                    start_time: string
                    title: string
                    trainer_id?: string | null
                }
                Update: {
                    capacity?: number
                    created_at?: string | null
                    day_of_week?: number
                    description?: string | null
                    duration_minutes?: number
                    end_time?: string
                    id?: string
                    is_active?: boolean | null
                    recurrence_pattern?: string | null
                    start_time?: string
                    title?: string
                    trainer_id?: string | null
                }
                Relationships: []
            }
            event: {
                Row: {
                    assigned_to_id: number | null
                    category: string
                    completed_by_id: number | null
                    description: string | null
                    end_time: string
                    family_id: number | null
                    id: number
                    location: string | null
                    owner_auth_id: string | null
                    owner_id: number | null
                    start_time: string
                    title: string
                    visibility: string | null
                }
                Insert: {
                    assigned_to_id?: number | null
                    category: string
                    completed_by_id?: number | null
                    description?: string | null
                    end_time: string
                    family_id?: number | null
                    id?: number
                    location?: string | null
                    owner_auth_id?: string | null
                    owner_id?: number | null
                    start_time: string
                    title: string
                    visibility?: string | null
                }
                Update: {
                    assigned_to_id?: number | null
                    category?: string
                    completed_by_id?: number | null
                    description?: string | null
                    end_time?: string
                    family_id?: number | null
                    id?: number
                    location?: string | null
                    owner_auth_id?: string | null
                    owner_id?: number | null
                    start_time?: string
                    title?: string
                    visibility?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "event_assigned_to_id_fkey"
                        columns: ["assigned_to_id"]
                        isOneToOne: false
                        referencedRelation: "user"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_completed_by_id_fkey"
                        columns: ["completed_by_id"]
                        isOneToOne: false
                        referencedRelation: "user"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_family_id_fkey"
                        columns: ["family_id"]
                        isOneToOne: false
                        referencedRelation: "family"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "event_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "user"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exercise_performance_logs: {
                Row: {
                    actual_reps: string | null
                    actual_sets: number | null
                    actual_weight: number | null
                    created_at: string | null
                    difficulty_rating: number | null
                    exercise_id: string
                    id: string
                    is_completed: boolean | null
                    rest_time_seconds: number | null
                    session_id: string
                }
                Insert: {
                    actual_reps?: string | null
                    actual_sets?: number | null
                    actual_weight?: number | null
                    created_at?: string | null
                    difficulty_rating?: number | null
                    exercise_id: string
                    id?: string
                    is_completed?: boolean | null
                    rest_time_seconds?: number | null
                    session_id: string
                }
                Update: {
                    actual_reps?: string | null
                    actual_sets?: number | null
                    actual_weight?: number | null
                    created_at?: string | null
                    difficulty_rating?: number | null
                    exercise_id?: string
                    id?: string
                    is_completed?: boolean | null
                    rest_time_seconds?: number | null
                    session_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "exercise_performance_logs_exercise_id_fkey"
                        columns: ["exercise_id"]
                        isOneToOne: false
                        referencedRelation: "exercises"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exercise_performance_logs_session_id_fkey"
                        columns: ["session_id"]
                        isOneToOne: false
                        referencedRelation: "workout_sessions"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exercises: {
                Row: {
                    category: string
                    created_at: string
                    description: string | null
                    difficulty: string
                    equipment: string[] | null
                    id: string
                    image_url: string | null
                    muscle_group: string
                    name: string
                    video_url: string | null
                }
                Insert: {
                    category: string
                    created_at?: string
                    description?: string | null
                    difficulty: string
                    equipment?: string[] | null
                    id?: string
                    image_url?: string | null
                    muscle_group: string
                    name: string
                    video_url?: string | null
                }
                Update: {
                    category?: string
                    created_at?: string
                    description?: string | null
                    difficulty?: string
                    equipment?: string[] | null
                    id?: string
                    image_url?: string | null
                    muscle_group?: string
                    name?: string
                    video_url?: string | null
                }
                Relationships: []
            }
            family: {
                Row: {
                    created_at: string | null
                    id: number
                    name: string
                }
                Insert: {
                    created_at?: string | null
                    id?: number
                    name: string
                }
                Update: {
                    created_at?: string | null
                    id?: number
                    name?: string
                }
                Relationships: []
            }
            gym_equipment: {
                Row: {
                    category: string
                    condition: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    last_maintenance: string | null
                    name: string
                    quantity: number | null
                    status: string | null
                }
                Insert: {
                    category: string
                    condition?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    last_maintenance?: string | null
                    name: string
                    quantity?: number | null
                    status?: string | null
                }
                Update: {
                    category?: string
                    condition?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    last_maintenance?: string | null
                    name?: string
                    quantity?: number | null
                    status?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    coach_notes: string | null
                    created_at: string
                    email: string
                    full_name: string | null
                    id: string
                    medical_info: Json | null
                    role: string | null
                    updated_at: string
                }
                Insert: {
                    avatar_url?: string | null
                    coach_notes?: string | null
                    created_at?: string
                    email: string
                    full_name?: string | null
                    id: string
                    medical_info?: Json | null
                    role?: string | null
                    updated_at?: string
                }
                Update: {
                    avatar_url?: string | null
                    coach_notes?: string | null
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    id?: string
                    medical_info?: Json | null
                    role?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            routines: {
                Row: {
                    created_at: string
                    description: string | null
                    difficulty_level: string | null
                    duration_weeks: number
                    exercises: Json
                    goal: string | null
                    id: string
                    is_active: boolean | null
                    is_generated_by_ai: boolean | null
                    name: string
                    student_id: string
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    description?: string | null
                    difficulty_level?: string | null
                    duration_weeks?: number
                    exercises?: Json
                    goal?: string | null
                    id?: string
                    is_active?: boolean | null
                    is_generated_by_ai?: boolean | null
                    name: string
                    student_id: string
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    description?: string | null
                    difficulty_level?: string | null
                    duration_weeks?: number
                    exercises?: Json
                    goal?: string | null
                    id?: string
                    is_active?: boolean | null
                    is_generated_by_ai?: boolean | null
                    name?: string
                    student_id?: string
                    updated_at?: string
                }
                Relationships: []
            }
            user: {
                Row: {
                    auth_id: string | null
                    avatar_url: string | null
                    color: string | null
                    created_at: string | null
                    date_of_birth: string | null
                    family_id: number | null
                    first_name: string
                    id: number
                    last_name: string | null
                    role: string
                }
                Insert: {
                    auth_id?: string | null
                    avatar_url?: string | null
                    color?: string | null
                    created_at?: string | null
                    date_of_birth?: string | null
                    family_id?: number | null
                    first_name: string
                    id?: number
                    last_name?: string | null
                    role: string
                }
                Update: {
                    auth_id?: string | null
                    avatar_url?: string | null
                    color?: string | null
                    created_at?: string | null
                    date_of_birth?: string | null
                    family_id?: number | null
                    first_name?: string
                    id?: number
                    last_name?: string | null
                    role?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_family_id_fkey"
                        columns: ["family_id"]
                        isOneToOne: false
                        referencedRelation: "family"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_achievements: {
                Row: {
                    achievement_id: string
                    earned_at: string | null
                    metadata: Json | null
                    user_id: string
                }
                Insert: {
                    achievement_id: string
                    earned_at?: string | null
                    metadata?: Json | null
                    user_id: string
                }
                Update: {
                    achievement_id?: string
                    earned_at?: string | null
                    metadata?: Json | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_achievement_id_fkey"
                        columns: ["achievement_id"]
                        isOneToOne: false
                        referencedRelation: "achievements"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_gamification: {
                Row: {
                    current_streak: number | null
                    last_activity_date: string | null
                    level: number | null
                    longest_streak: number | null
                    points: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    current_streak?: number | null
                    last_activity_date?: string | null
                    level?: number | null
                    longest_streak?: number | null
                    points?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    current_streak?: number | null
                    last_activity_date?: string | null
                    level?: number | null
                    longest_streak?: number | null
                    points?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            user_goals: {
                Row: {
                    created_at: string | null
                    current_value: number
                    deadline: string | null
                    description: string | null
                    id: string
                    is_completed: boolean | null
                    metric: string | null
                    start_value: number
                    target_value: number
                    title: string
                    type: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    current_value?: number
                    deadline?: string | null
                    description?: string | null
                    id?: string
                    is_completed?: boolean | null
                    metric?: string | null
                    start_value?: number
                    target_value: number
                    title: string
                    type: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    current_value?: number
                    deadline?: string | null
                    description?: string | null
                    id?: string
                    is_completed?: boolean | null
                    metric?: string | null
                    start_value?: number
                    target_value: number
                    title?: string
                    type?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            workout_sessions: {
                Row: {
                    created_at: string | null
                    end_time: string | null
                    id: string
                    mood_rating: number | null
                    notes: string | null
                    routine_id: string
                    start_time: string | null
                    status: string | null
                    total_points: number | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    end_time?: string | null
                    id?: string
                    mood_rating?: number | null
                    notes?: string | null
                    routine_id: string
                    start_time?: string | null
                    status?: string | null
                    total_points?: number | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    end_time?: string | null
                    id?: string
                    mood_rating?: number | null
                    notes?: string | null
                    routine_id?: string
                    start_time?: string | null
                    status?: string | null
                    total_points?: number | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_sessions_routine_id_fkey"
                        columns: ["routine_id"]
                        isOneToOne: false
                        referencedRelation: "routines"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            classes_with_availability: {
                Row: {
                    booked_count: number | null
                    capacity: number | null
                    day_of_week: number | null
                    description: string | null
                    duration_minutes: number | null
                    end_time: string | null
                    id: string | null
                    is_active: boolean | null
                    recurrence_pattern: string | null
                    remaining_spots: number | null
                    start_time: string | null
                    title: string | null
                    trainer_name: string | null
                }
                Relationships: []
            }
            user_bookings_detailed: {
                Row: {
                    booking_date: string | null
                    booking_id: string | null
                    booking_status: string | null
                    class_description: string | null
                    class_title: string | null
                    duration_minutes: number | null
                    end_time: string | null
                    payment_status: string | null
                    start_time: string | null
                    student_email: string | null
                    student_name: string | null
                    trainer_name: string | null
                    user_id: string | null
                }
                Relationships: []
            }
        }
        Functions: {
            after_session_completed: {
                Args: Record<PropertyKey, never>
                Returns: unknown
            }
            archive_past_bookings: {
                Args: Record<PropertyKey, never>
                Returns: undefined
            }
            check_class_availability: {
                Args: {
                    p_class_id: string
                    p_date: string
                }
                Returns: boolean
            }
            create_booking: {
                Args: {
                    p_class_id: string
                    p_user_id: string
                    p_date: string
                }
                Returns: string
            }
            get_available_classes: {
                Args: {
                    query_date: string
                }
                Returns: {
                    class_id: string
                    title: string
                    description: string
                    start_time: string
                    end_time: string
                    trainer_name: string
                    capacity: number
                    booked_count: number
                    remaining_spots: number
                    is_booked_by_user: boolean
                }[]
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]


export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) |
    keyof (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Views"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Row: infer R } }
    ? R
    : (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Views"]
        : never) extends { [key in TableName]: { Row: infer R } }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Insert: infer I } }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never)
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
        ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
        : never) extends { [key in TableName]: { Update: infer U } }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
        ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never)
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
        ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
        : never) extends { [key in EnumName]: infer E }
    ? E
    : never
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof (Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
        ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never)
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
        ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
        : never) extends { [key in CompositeTypeName]: infer C }
    ? C
    : never
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
