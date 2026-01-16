export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            logros: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    icon: string | null
                    points_reward: number | null
                    category: string | null
                    condition_type: string | null
                    condition_value: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    icon?: string | null
                    points_reward?: number | null
                    category?: string | null
                    condition_type?: string | null
                    condition_value?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    icon?: string | null
                    points_reward?: number | null
                    category?: string | null
                    condition_type?: string | null
                    condition_value?: number | null
                    created_at?: string | null
                }
                Relationships: []
            }
            actividades: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: string | null
                    category: string | null
                    image_url: string | null
                    duration_minutes: number | null
                    difficulty: string | null
                    max_capacity: number | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                    color: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type?: string | null
                    category?: string | null
                    image_url?: string | null
                    duration_minutes?: number | null
                    difficulty?: string | null
                    max_capacity?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    color?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: string | null
                    category?: string | null
                    image_url?: string | null
                    duration_minutes?: number | null
                    difficulty?: string | null
                    max_capacity?: number | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    color?: string | null
                }
                Relationships: []
            }
            participantes_del_desafío: {
                Row: {
                    id: string
                    challenge_id: string | null
                    user_id: string | null
                    current_score: number | null
                    status: string | null
                    joined_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    challenge_id?: string | null
                    user_id?: string | null
                    current_score?: number | null
                    status?: string | null
                    joined_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    challenge_id?: string | null
                    user_id?: string | null
                    current_score?: number | null
                    status?: string | null
                    joined_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenge_participants_challenge_id_fkey"
                        columns: ["challenge_id"]
                        referencedRelation: "desafíos"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenge_participants_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            desafíos: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    rules: string | null
                    type: string | null
                    points_reward: number | null
                    status: string | null
                    created_by: string | null
                    judge_id: string | null
                    winner_id: string | null
                    start_date: string | null
                    end_date: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    rules?: string | null
                    type?: string | null
                    points_reward?: number | null
                    status?: string | null
                    created_by?: string | null
                    judge_id?: string | null
                    winner_id?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    rules?: string | null
                    type?: string | null
                    points_reward?: number | null
                    status?: string | null
                    created_by?: string | null
                    judge_id?: string | null
                    winner_id?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_judge_id_fkey"
                        columns: ["judge_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_winner_id_fkey"
                        columns: ["winner_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reservas_de_clase: {
                Row: {
                    id: string
                    user_id: string
                    class_schedule_id: string
                    date: string
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    class_schedule_id: string
                    date: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    class_schedule_id?: string
                    date?: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "class_bookings_class_schedule_id_fkey"
                        columns: ["class_schedule_id"]
                        referencedRelation: "horarios_de_clase"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_bookings_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            horarios_de_clase: {
                Row: {
                    id: string
                    activity_id: string | null
                    coach_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                    teacher_text: string | null
                }
                Insert: {
                    id?: string
                    activity_id?: string | null
                    coach_id?: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    teacher_text?: string | null
                }
                Update: {
                    id?: string
                    activity_id?: string | null
                    coach_id?: string | null
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    teacher_text?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "class_schedules_activity_id_fkey"
                        columns: ["activity_id"]
                        referencedRelation: "actividades"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "class_schedules_coach_id_fkey"
                        columns: ["coach_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            asistencias: {
                Row: {
                    id: string
                    user_id: string
                    role_at_time: Database["public"]["Enums"]["user_role"]
                    check_in: string | null
                    check_out: string | null
                    source: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    role_at_time: Database["public"]["Enums"]["user_role"]
                    check_in?: string | null
                    check_out?: string | null
                    source?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    role_at_time?: Database["public"]["Enums"]["user_role"]
                    check_in?: string | null
                    check_out?: string | null
                    source?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "asistencias_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            relacion_alumno_coach: {
                Row: {
                    id: string
                    user_id: string
                    coach_id: string
                    is_primary: boolean | null
                    assigned_at: string | null
                    is_active: boolean | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    coach_id: string
                    is_primary?: boolean | null
                    assigned_at?: string | null
                    is_active?: boolean | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    coach_id?: string
                    is_primary?: boolean | null
                    assigned_at?: string | null
                    is_active?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "relacion_alumno_coach_coach_id_fkey"
                        columns: ["coach_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "relacion_alumno_coach_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            conversaciones: {
                Row: {
                    id: string
                    created_at: string | null
                    type: string | null
                    metadata: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string | null
                    type?: string | null
                    metadata?: Json | null
                }
                Update: {
                    id?: string
                    created_at?: string | null
                    type?: string | null
                    metadata?: Json | null
                }
                Relationships: []
            }
            participantes_conversacion: {
                Row: {
                    conversation_id: string
                    user_id: string
                    joined_at: string | null
                }
                Insert: {
                    conversation_id: string
                    user_id: string
                    joined_at?: string | null
                }
                Update: {
                    conversation_id?: string
                    user_id?: string
                    joined_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "participantes_conversacion_conversation_id_fkey"
                        columns: ["conversation_id"]
                        referencedRelation: "conversaciones"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "participantes_conversacion_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            registros_de_ejercicio: {
                Row: {
                    id: string
                    session_id: string
                    exercise_id: string
                    actual_sets: number | null
                    actual_reps: string | null
                    actual_weight: number | null
                    rest_time_seconds: number | null
                    is_completed: boolean | null
                    difficulty_rating: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    session_id: string
                    exercise_id: string
                    actual_sets?: number | null
                    actual_reps?: string | null
                    actual_weight?: number | null
                    rest_time_seconds?: number | null
                    is_completed?: boolean | null
                    difficulty_rating?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    session_id?: string
                    exercise_id?: string
                    actual_sets?: number | null
                    actual_reps?: string | null
                    actual_weight?: number | null
                    rest_time_seconds?: number | null
                    is_completed?: boolean | null
                    difficulty_rating?: number | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercise_performance_logs_exercise_id_fkey"
                        columns: ["exercise_id"]
                        referencedRelation: "ejercicios"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "exercise_performance_logs_session_id_fkey"
                        columns: ["session_id"]
                        referencedRelation: "sesiones_de_entrenamiento"
                        referencedColumns: ["id"]
                    }
                ]
            }
            ejercicios: {
                Row: {
                    id: string
                    routine_id: string
                    name: string
                    description: string | null
                    muscle_group: string | null
                    equipment: string[] | null
                    sets: number | null
                    reps: string | null
                    rest_seconds: number | null
                    day_number: number
                    order_in_day: number
                    instructions: string | null
                    video_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    routine_id: string
                    name: string
                    description?: string | null
                    muscle_group?: string | null
                    equipment?: string[] | null
                    sets?: number | null
                    reps?: string | null
                    rest_seconds?: number | null
                    day_number: number
                    order_in_day: number
                    instructions?: string | null
                    video_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    routine_id?: string
                    name?: string
                    description?: string | null
                    muscle_group?: string | null
                    equipment?: string[] | null
                    sets?: number | null
                    reps?: string | null
                    rest_seconds?: number | null
                    day_number?: number
                    order_in_day?: number
                    instructions?: string | null
                    video_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercises_routine_id_fkey"
                        columns: ["routine_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    }
                ]
            }
            equipamiento: {
                Row: {
                    id: string
                    name: string
                    category: string
                    brand: string | null
                    quantity: number | null
                    is_available: boolean | null
                    condition: string | null
                    notes: string | null
                    image_url: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    brand?: string | null
                    quantity?: number | null
                    is_available?: boolean | null
                    condition?: string | null
                    notes?: string | null
                    image_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    brand?: string | null
                    quantity?: number | null
                    is_available?: boolean | null
                    condition?: string | null
                    notes?: string | null
                    image_url?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            mediciones: {
                Row: {
                    id: string
                    user_id: string
                    weight: number | null
                    body_fat: number | null
                    muscle_mass: number | null
                    notes: string | null
                    recorded_at: string | null
                    created_by: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    weight?: number | null
                    body_fat?: number | null
                    muscle_mass?: number | null
                    notes?: string | null
                    recorded_at?: string | null
                    created_by?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    weight?: number | null
                    body_fat?: number | null
                    muscle_mass?: number | null
                    notes?: string | null
                    recorded_at?: string | null
                    created_by?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "measurements_created_by_fkey"
                        columns: ["created_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "measurements_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            mensajes: {
                Row: {
                    id: string
                    sender_id: string
                    receiver_id: string
                    content: string
                    is_read: boolean | null
                    read_at: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    sender_id: string
                    receiver_id: string
                    content: string
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    sender_id?: string
                    receiver_id?: string
                    content?: string
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receiver_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            planes_nutricionales: {
                Row: {
                    id: string
                    user_id: string | null
                    coach_id: string | null
                    daily_calories: number | null
                    protein_grams: number | null
                    carbs_grams: number | null
                    fats_grams: number | null
                    meals: Json | null
                    supplements: Json | null
                    water_liters: number | null
                    general_guidelines: string | null
                    restrictions: string[] | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    coach_id?: string | null
                    daily_calories?: number | null
                    protein_grams?: number | null
                    carbs_grams?: number | null
                    fats_grams?: number | null
                    meals?: Json | null
                    supplements?: Json | null
                    water_liters?: number | null
                    general_guidelines?: string | null
                    restrictions?: string[] | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    coach_id?: string | null
                    daily_calories?: number | null
                    protein_grams?: number | null
                    carbs_grams?: number | null
                    fats_grams?: number | null
                    meals?: Json | null
                    supplements?: Json | null
                    water_liters?: number | null
                    general_guidelines?: string | null
                    restrictions?: string[] | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "nutrition_plans_coach_id_fkey"
                        columns: ["coach_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "nutrition_plans_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            pagos: {
                Row: {
                    id: string
                    user_id: string | null
                    amount: number
                    currency: string | null
                    concept: string
                    payment_method: string
                    payment_provider: string | null
                    provider_payment_id: string | null
                    status: string
                    approved_by: string | null
                    approved_at: string | null
                    notes: string | null
                    metadata: Json | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    amount: number
                    currency?: string | null
                    concept: string
                    payment_method: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: string
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    amount?: number
                    currency?: string | null
                    concept?: string
                    payment_method?: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: string
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    metadata?: Json | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_approved_by_fkey"
                        columns: ["approved_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            historial_de_cambios_de_perfil: {
                Row: {
                    id: string
                    profile_id: string | null
                    changed_by: string | null
                    field_changed: string
                    old_value: string | null
                    new_value: string | null
                    reason: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    profile_id?: string | null
                    changed_by?: string | null
                    field_changed: string
                    old_value?: string | null
                    new_value?: string | null
                    reason?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    profile_id?: string | null
                    changed_by?: string | null
                    field_changed?: string
                    old_value?: string | null
                    new_value?: string | null
                    reason?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profile_change_history_changed_by_fkey"
                        columns: ["changed_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profile_change_history_profile_id_fkey"
                        columns: ["profile_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            perfiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    phone: string | null
                    role: Database["public"]["Enums"]["user_role"]
                    membership_status: Database["public"]["Enums"]["membership_status_enum"] | null
                    membership_start_date: string | null
                    membership_end_date: string | null
                    created_at: string | null
                    updated_at: string | null
                    coach_observations: string | null
                    additional_restrictions: string | null
                    recommended_modifications: string | null
                    onboarding_completed: boolean | null
                    onboarding_completed_at: string | null
                    first_name: string | null
                    last_name: string | null
                    dni: string | null
                    address: string | null
                    city: string | null
                    birth_date: string | null
                    emergency_contact: Json | null
                    medical_info: Json | null
                    waiver_accepted: boolean | null
                    waiver_date: string | null
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    membership_status?: Database["public"]["Enums"]["membership_status_enum"] | null
                    membership_start_date?: string | null
                    membership_end_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    coach_observations?: string | null
                    additional_restrictions?: string | null
                    recommended_modifications?: string | null
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    dni?: string | null
                    address?: string | null
                    city?: string | null
                    birth_date?: string | null
                    emergency_contact?: Json | null
                    medical_info?: Json | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: Database["public"]["Enums"]["user_role"]
                    membership_status?: Database["public"]["Enums"]["membership_status_enum"] | null
                    membership_start_date?: string | null
                    membership_end_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    coach_observations?: string | null
                    additional_restrictions?: string | null
                    recommended_modifications?: string | null
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    dni?: string | null
                    address?: string | null
                    city?: string | null
                    birth_date?: string | null
                    emergency_contact?: Json | null
                    medical_info?: Json | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                }
                Relationships: []
            }
            registros_acceso_rutina: {
                Row: {
                    id: string
                    routine_id: string | null
                    user_id: string | null
                    action: string
                    ip_address: string | null
                    user_agent: string | null
                    device_info: Json | null
                    latitude: number | null
                    longitude: number | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    routine_id?: string | null
                    user_id?: string | null
                    action: string
                    ip_address?: string | null
                    user_agent?: string | null
                    device_info?: Json | null
                    latitude?: number | null
                    longitude?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    routine_id?: string | null
                    user_id?: string | null
                    action?: string
                    ip_address?: string | null
                    user_agent?: string | null
                    device_info?: Json | null
                    latitude?: number | null
                    longitude?: number | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routine_access_logs_routine_id_fkey"
                        columns: ["routine_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routine_access_logs_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            rutinas: {
                Row: {
                    id: string
                    user_id: string
                    coach_id: string | null
                    name: string
                    description: string | null
                    goal: string | null
                    duration_weeks: number | null
                    generated_by_ai: boolean | null
                    ai_prompt: string | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                    nutrition_plan_id: string | null
                    user_goal_id: string | null
                    status: string | null
                    approved_by: string | null
                    approved_at: string | null
                    medical_considerations: string | null
                    equipment_used: string[] | null
                    view_count: number | null
                    last_viewed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    coach_id?: string | null
                    name: string
                    description?: string | null
                    goal?: string | null
                    duration_weeks?: number | null
                    generated_by_ai?: boolean | null
                    ai_prompt?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    nutrition_plan_id?: string | null
                    user_goal_id?: string | null
                    status?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    medical_considerations?: string | null
                    equipment_used?: string[] | null
                    view_count?: number | null
                    last_viewed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    coach_id?: string | null
                    name?: string
                    description?: string | null
                    goal?: string | null
                    duration_weeks?: number | null
                    generated_by_ai?: boolean | null
                    ai_prompt?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                    nutrition_plan_id?: string | null
                    user_goal_id?: string | null
                    status?: string | null
                    approved_by?: string | null
                    approved_at?: string | null
                    medical_considerations?: string | null
                    equipment_used?: string[] | null
                    view_count?: number | null
                    last_viewed_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routines_approved_by_fkey"
                        columns: ["approved_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_coach_id_fkey"
                        columns: ["coach_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_nutrition_plan_id_fkey"
                        columns: ["nutrition_plan_id"]
                        referencedRelation: "planes_nutricionales"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_goal_id_fkey"
                        columns: ["user_goal_id"]
                        referencedRelation: "objetivos_del_usuario"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reportes_de_alumnos: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string | null
                    type: string
                    status: string | null
                    created_at: string | null
                    updated_at: string | null
                    resolved_at: string | null
                    resolved_by: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description?: string | null
                    type: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    resolved_at?: string | null
                    resolved_by?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    type?: string
                    status?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                    resolved_at?: string | null
                    resolved_by?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "student_reports_resolved_by_fkey"
                        columns: ["resolved_by"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "student_reports_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            logros_del_usuario: {
                Row: {
                    id: string
                    user_id: string
                    achievement_id: string
                    unlocked_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    achievement_id: string
                    unlocked_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    achievement_id?: string
                    unlocked_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_achievement_id_fkey"
                        columns: ["achievement_id"]
                        referencedRelation: "logros"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "user_achievements_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            gamificación_del_usuario: {
                Row: {
                    user_id: string
                    points: number | null
                    current_streak: number | null
                    longest_streak: number | null
                    level: number | null
                    last_activity_date: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    user_id: string
                    points?: number | null
                    current_streak?: number | null
                    longest_streak?: number | null
                    level?: number | null
                    last_activity_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    user_id?: string
                    points?: number | null
                    current_streak?: number | null
                    longest_streak?: number | null
                    level?: number | null
                    last_activity_date?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_gamification_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            objetivos_del_usuario: {
                Row: {
                    id: string
                    user_id: string | null
                    primary_goal: string
                    secondary_goals: string[] | null
                    target_weight: number | null
                    target_body_fat_percentage: number | null
                    target_muscle_mass: number | null
                    start_date: string
                    target_date: string | null
                    training_frequency_per_week: number | null
                    preferred_training_time: string | null
                    available_days: string[] | null
                    time_per_session_minutes: number | null
                    equipment_access: string[] | null
                    coach_notes: string | null
                    is_active: boolean | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    primary_goal: string
                    secondary_goals?: string[] | null
                    target_weight?: number | null
                    target_body_fat_percentage?: number | null
                    target_muscle_mass?: number | null
                    start_date?: string
                    target_date?: string | null
                    training_frequency_per_week?: number | null
                    preferred_training_time?: string | null
                    available_days?: string[] | null
                    time_per_session_minutes?: number | null
                    equipment_access?: string[] | null
                    coach_notes?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    primary_goal?: string
                    secondary_goals?: string[] | null
                    target_weight?: number | null
                    target_body_fat_percentage?: number | null
                    target_muscle_mass?: number | null
                    start_date?: string
                    target_date?: string | null
                    training_frequency_per_week?: number | null
                    preferred_training_time?: string | null
                    available_days?: string[] | null
                    time_per_session_minutes?: number | null
                    equipment_access?: string[] | null
                    coach_notes?: string | null
                    is_active?: boolean | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_goals_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
            sesiones_de_entrenamiento: {
                Row: {
                    id: string
                    user_id: string
                    routine_id: string
                    start_time: string | null
                    end_time: string | null
                    status: string | null
                    total_points: number | null
                    mood_rating: number | null
                    notes: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    routine_id: string
                    start_time?: string | null
                    end_time?: string | null
                    status?: string | null
                    total_points?: number | null
                    mood_rating?: number | null
                    notes?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    routine_id?: string
                    start_time?: string | null
                    end_time?: string | null
                    status?: string | null
                    total_points?: number | null
                    mood_rating?: number | null
                    notes?: string | null
                    created_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "workout_sessions_routine_id_fkey"
                        columns: ["routine_id"]
                        referencedRelation: "rutinas"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "workout_sessions_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            clases_con_disponibilidad: {
                Row: {
                    id: string
                    activity_id: string | null
                    coach_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_capacity: number
                    current_capacity: number
                    is_active: boolean
                    activity_name: string
                }
            }
            user_bookings_detailed: {
                Row: {
                    id: string
                    user_id: string
                    date: string
                    status: string
                    class_schedule_id: string
                    start_time: string
                    end_time: string
                    activity_name: string
                    coach_name: string
                }
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: "admin" | "coach" | "member"
            membership_status_enum: "active" | "inactive" | "suspended" | "expired"
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
