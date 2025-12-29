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
                    created_at: string | null
                    description: string | null
                    icon: string | null
                    id: string
                    name: string
                    points_reward: number | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name: string
                    points_reward?: number | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: string
                    name?: string
                    points_reward?: number | null
                }
                Relationships: []
            }
            activities: {
                Row: {
                    category: string | null
                    color: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    is_active: boolean | null
                    name: string
                    type: string
                    updated_at: string | null
                }
                Insert: {
                    category?: string | null
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name: string
                    type: string
                    updated_at?: string | null
                }
                Update: {
                    category?: string | null
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    is_active?: boolean | null
                    name?: string
                    type?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            challenge_participants: {
                Row: {
                    challenge_id: string
                    created_at: string | null
                    id: string
                    score: number | null
                    status: string | null
                    user_id: string
                }
                Insert: {
                    challenge_id: string
                    created_at?: string | null
                    id?: string
                    score?: number | null
                    status?: string | null
                    user_id: string
                }
                Update: {
                    challenge_id?: string
                    created_at?: string | null
                    id?: string
                    score?: number | null
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
                    {
                        foreignKeyName: "challenge_participants_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            challenges: {
                Row: {
                    created_at: string | null
                    created_by: string | null
                    description: string | null
                    end_date: string | null
                    id: string
                    points_reward: number | null
                    start_date: string | null
                    status: string | null
                    title: string
                    type: string | null
                    winner_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    points_reward?: number | null
                    start_date?: string | null
                    status?: string | null
                    title: string
                    type?: string | null
                    winner_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    created_by?: string | null
                    description?: string | null
                    end_date?: string | null
                    id?: string
                    points_reward?: number | null
                    start_date?: string | null
                    status?: string | null
                    title?: string
                    type?: string | null
                    winner_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "challenges_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "challenges_winner_id_fkey"
                        columns: ["winner_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            class_bookings: {
                Row: {
                    class_schedule_id: string | null
                    created_at: string | null
                    date: string
                    id: string
                    status: string
                    user_id: string | null
                }
                Insert: {
                    class_schedule_id?: string | null
                    created_at?: string | null
                    date: string
                    id?: string
                    status?: string
                    user_id?: string | null
                }
                Update: {
                    class_schedule_id?: string | null
                    created_at?: string | null
                    date?: string
                    id?: string
                    status?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["class_schedule_id"]
                        isOneToOne: false
                        referencedRelation: "class_schedules"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            class_schedules: {
                Row: {
                    activity_id: string | null
                    coach_id: string | null
                    created_at: string | null
                    current_capacity: number | null
                    day_of_week: number
                    end_time: string
                    id: string
                    is_active: boolean | null
                    max_capacity: number | null
                    notes: string | null
                    start_time: string
                    teacher_text: string | null
                }
                Insert: {
                    activity_id?: string | null
                    coach_id?: string | null
                    created_at?: string | null
                    current_capacity?: number | null
                    day_of_week: number
                    end_time: string
                    id?: string
                    is_active?: boolean | null
                    max_capacity?: number | null
                    notes?: string | null
                    start_time: string
                    teacher_text?: string | null
                }
                Update: {
                    activity_id?: string | null
                    coach_id?: string | null
                    created_at?: string | null
                    current_capacity?: number | null
                    day_of_week?: number
                    end_time?: string
                    id?: string
                    is_active?: boolean | null
                    max_capacity?: number | null
                    notes?: string | null
                    start_time?: string
                    teacher_text?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_activity_id_fkey"
                        columns: ["activity_id"]
                        isOneToOne: false
                        referencedRelation: "activities"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "classes_coach_id_fkey"
                        columns: ["coach_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            exercises: {
                Row: {
                    created_at: string | null
                    day_number: number | null
                    description: string | null
                    equipment: string[] | null
                    id: string
                    instructions: string | null
                    muscle_group: string | null
                    name: string
                    order_in_day: number | null
                    reps: string | null
                    rest_seconds: number | null
                    routine_id: string
                    sets: number | null
                    updated_at: string | null
                    video_url: string | null
                }
                Insert: {
                    created_at?: string | null
                    day_number?: number | null
                    description?: string | null
                    equipment?: string[] | null
                    id?: string
                    instructions?: string | null
                    muscle_group?: string | null
                    name: string
                    order_in_day?: number | null
                    reps?: string | null
                    rest_seconds?: number | null
                    routine_id: string
                    sets?: number | null
                    updated_at?: string | null
                    video_url?: string | null
                }
                Update: {
                    created_at?: string | null
                    day_number?: number | null
                    description?: string | null
                    equipment?: string[] | null
                    id?: string
                    instructions?: string | null
                    muscle_group?: string | null
                    name?: string
                    order_in_day?: number | null
                    reps?: string | null
                    rest_seconds?: number | null
                    routine_id?: string
                    sets?: number | null
                    updated_at?: string | null
                    video_url?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "exercises_routine_id_fkey"
                        columns: ["routine_id"]
                        isOneToOne: false
                        referencedRelation: "routines"
                        referencedColumns: ["id"]
                    },
                ]
            }
            gym_equipment: {
                Row: {
                    category: string
                    condition: string | null
                    created_at: string | null
                    id: string
                    image_url: string | null
                    is_available: boolean | null
                    name: string
                    notes: string | null
                    quantity: number | null
                    updated_at: string | null
                }
                Insert: {
                    category: string
                    condition?: string | null
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    is_available?: boolean | null
                    name: string
                    notes?: string | null
                    quantity?: number | null
                    updated_at?: string | null
                }
                Update: {
                    category?: string
                    condition?: string | null
                    created_at?: string | null
                    id?: string
                    image_url?: string | null
                    is_available?: boolean | null
                    name?: string
                    notes?: string | null
                    quantity?: number | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            measurements: {
                Row: {
                    body_fat: number | null
                    created_at: string | null
                    created_by: string | null
                    id: string
                    muscle_mass: number | null
                    notes: string | null
                    recorded_at: string | null
                    updated_at: string | null
                    user_id: string
                    weight: number | null
                }
                Insert: {
                    body_fat?: number | null
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    muscle_mass?: number | null
                    notes?: string | null
                    recorded_at?: string | null
                    updated_at?: string | null
                    user_id: string
                    weight?: number | null
                }
                Update: {
                    body_fat?: number | null
                    created_at?: string | null
                    created_by?: string | null
                    id?: string
                    muscle_mass?: number | null
                    notes?: string | null
                    recorded_at?: string | null
                    updated_at?: string | null
                    user_id?: string
                    weight?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "measurements_created_by_fkey"
                        columns: ["created_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "measurements_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            messages: {
                Row: {
                    content: string
                    created_at: string | null
                    id: string
                    is_read: boolean | null
                    read_at: string | null
                    receiver_id: string
                    sender_id: string
                    updated_at: string | null
                }
                Insert: {
                    content: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    read_at?: string | null
                    receiver_id: string
                    sender_id: string
                    updated_at?: string | null
                }
                Update: {
                    content?: string
                    created_at?: string | null
                    id?: string
                    is_read?: boolean | null
                    read_at?: string | null
                    receiver_id?: string
                    sender_id?: string
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "messages_receiver_id_fkey"
                        columns: ["receiver_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "messages_sender_id_fkey"
                        columns: ["sender_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            nutrition_plans: {
                Row: {
                    carbs_grams: number | null
                    coach_id: string | null
                    created_at: string | null
                    daily_calories: number | null
                    fats_grams: number | null
                    general_guidelines: string | null
                    id: string
                    is_active: boolean | null
                    meals: Json | null
                    protein_grams: number | null
                    restrictions: string[] | null
                    supplements: Json | null
                    user_id: string | null
                    water_liters: number | null
                }
                Insert: {
                    carbs_grams?: number | null
                    coach_id?: string | null
                    created_at?: string | null
                    daily_calories?: number | null
                    fats_grams?: number | null
                    general_guidelines?: string | null
                    id?: string
                    is_active?: boolean | null
                    meals?: Json | null
                    protein_grams?: number | null
                    restrictions?: string[] | null
                    supplements?: Json | null
                    user_id?: string | null
                    water_liters?: number | null
                }
                Update: {
                    carbs_grams?: number | null
                    coach_id?: string | null
                    created_at?: string | null
                    daily_calories?: number | null
                    fats_grams?: number | null
                    general_guidelines?: string | null
                    id?: string
                    is_active?: boolean | null
                    meals?: Json | null
                    protein_grams?: number | null
                    restrictions?: string[] | null
                    supplements?: Json | null
                    user_id?: string | null
                    water_liters?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "nutrition_plans_coach_id_fkey"
                        columns: ["coach_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "nutrition_plans_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            payments: {
                Row: {
                    amount: number
                    approved_at: string | null
                    approved_by: string | null
                    concept: string
                    created_at: string | null
                    currency: string | null
                    id: string
                    metadata: Json | null
                    notes: string | null
                    payment_method: string
                    payment_provider: string | null
                    provider_payment_id: string | null
                    status: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    amount: number
                    approved_at?: string | null
                    approved_by?: string | null
                    concept: string
                    created_at?: string | null
                    currency?: string | null
                    id?: string
                    metadata?: Json | null
                    notes?: string | null
                    payment_method: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    amount?: number
                    approved_at?: string | null
                    approved_by?: string | null
                    concept?: string
                    created_at?: string | null
                    currency?: string | null
                    id?: string
                    metadata?: Json | null
                    notes?: string | null
                    payment_method?: string
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "payments_approved_by_fkey"
                        columns: ["approved_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "payments_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profile_change_history: {
                Row: {
                    changed_by: string | null
                    created_at: string | null
                    field_changed: string
                    id: string
                    new_value: string | null
                    old_value: string | null
                    profile_id: string | null
                    reason: string | null
                }
                Insert: {
                    changed_by?: string | null
                    created_at?: string | null
                    field_changed: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    profile_id?: string | null
                    reason?: string | null
                }
                Update: {
                    changed_by?: string | null
                    created_at?: string | null
                    field_changed?: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    profile_id?: string | null
                    reason?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "profile_change_history_changed_by_fkey"
                        columns: ["changed_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "profile_change_history_profile_id_fkey"
                        columns: ["profile_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    additional_restrictions: string | null
                    address: string | null
                    assigned_coach_id: string | null
                    avatar_url: string | null
                    birth_date: string | null
                    city: string | null
                    coach_observations: string | null
                    created_at: string | null
                    date_of_birth: string | null
                    dni: string | null
                    email: string
                    emergency_contact: Json | null
                    emergency_contact_name: string | null
                    emergency_contact_phone: string | null
                    first_name: string | null
                    full_name: string | null
                    gender: string | null
                    id: string
                    injuries: string[] | null
                    last_name: string | null
                    medical_conditions: string[] | null
                    medical_info: Json | null
                    medications: string | null
                    membership_end_date: string | null
                    membership_start_date: string | null
                    membership_status: string | null
                    onboarding_completed: boolean | null
                    onboarding_completed_at: string | null
                    phone: string | null
                    recommended_modifications: string | null
                    restrictions: string | null
                    role: string
                    updated_at: string | null
                    waiver_accepted: boolean | null
                    waiver_date: string | null
                }
                Insert: {
                    additional_restrictions?: string | null
                    address?: string | null
                    assigned_coach_id?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    city?: string | null
                    coach_observations?: string | null
                    created_at?: string | null
                    date_of_birth?: string | null
                    dni?: string | null
                    email: string
                    emergency_contact?: Json | null
                    emergency_contact_name?: string | null
                    emergency_contact_phone?: string | null
                    first_name?: string | null
                    full_name?: string | null
                    gender?: string | null
                    id: string
                    injuries?: string[] | null
                    last_name?: string | null
                    medical_conditions?: string[] | null
                    medical_info?: Json | null
                    medications?: string | null
                    membership_end_date?: string | null
                    membership_start_date?: string | null
                    membership_status?: string | null
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    phone?: string | null
                    recommended_modifications?: string | null
                    restrictions?: string | null
                    role?: string
                    updated_at?: string | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                }
                Update: {
                    additional_restrictions?: string | null
                    address?: string | null
                    assigned_coach_id?: string | null
                    avatar_url?: string | null
                    birth_date?: string | null
                    city?: string | null
                    coach_observations?: string | null
                    created_at?: string | null
                    date_of_birth?: string | null
                    dni?: string | null
                    email?: string
                    emergency_contact?: Json | null
                    emergency_contact_name?: string | null
                    emergency_contact_phone?: string | null
                    first_name?: string | null
                    full_name?: string | null
                    gender?: string | null
                    id?: string
                    injuries?: string[] | null
                    last_name?: string | null
                    medical_conditions?: string[] | null
                    medical_info?: Json | null
                    medications?: string | null
                    membership_end_date?: string | null
                    membership_start_date?: string | null
                    membership_status?: string | null
                    onboarding_completed?: boolean | null
                    onboarding_completed_at?: string | null
                    phone?: string | null
                    recommended_modifications?: string | null
                    restrictions?: string | null
                    role?: string
                    updated_at?: string | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                }
                Relationships: []
            }
            routine_access_logs: {
                Row: {
                    action: string
                    created_at: string | null
                    device_info: Json | null
                    id: string
                    ip_address: string | null
                    latitude: number | null
                    longitude: number | null
                    routine_id: string | null
                    user_agent: string | null
                    user_id: string | null
                }
                Insert: {
                    action: string
                    created_at?: string | null
                    device_info?: Json | null
                    id?: string
                    ip_address?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    routine_id?: string | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Update: {
                    action?: string
                    created_at?: string | null
                    device_info?: Json | null
                    id?: string
                    ip_address?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    routine_id?: string | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routine_access_logs_routine_id_fkey"
                        columns: ["routine_id"]
                        isOneToOne: false
                        referencedRelation: "routines"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routine_access_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            routines: {
                Row: {
                    ai_prompt: string | null
                    approved_at: string | null
                    approved_by: string | null
                    coach_id: string | null
                    created_at: string | null
                    description: string | null
                    duration_weeks: number | null
                    equipment_used: string[] | null
                    generated_by_ai: boolean | null
                    goal: string | null
                    id: string
                    is_active: boolean | null
                    last_viewed_at: string | null
                    medical_considerations: string | null
                    name: string
                    nutrition_plan_id: string | null
                    status: string | null
                    updated_at: string | null
                    user_goal_id: string | null
                    user_id: string
                    view_count: number | null
                }
                Insert: {
                    ai_prompt?: string | null
                    approved_at?: string | null
                    approved_by?: string | null
                    coach_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    duration_weeks?: number | null
                    equipment_used?: string[] | null
                    generated_by_ai?: boolean | null
                    goal?: string | null
                    id?: string
                    is_active?: boolean | null
                    last_viewed_at?: string | null
                    medical_considerations?: string | null
                    name: string
                    nutrition_plan_id?: string | null
                    status?: string | null
                    updated_at?: string | null
                    user_goal_id?: string | null
                    user_id: string
                    view_count?: number | null
                }
                Update: {
                    ai_prompt?: string | null
                    approved_at?: string | null
                    approved_by?: string | null
                    coach_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    duration_weeks?: number | null
                    equipment_used?: string[] | null
                    generated_by_ai?: boolean | null
                    goal?: string | null
                    id?: string
                    is_active?: boolean | null
                    last_viewed_at?: string | null
                    medical_considerations?: string | null
                    name?: string
                    nutrition_plan_id?: string | null
                    status?: string | null
                    updated_at?: string | null
                    user_goal_id?: string | null
                    user_id?: string
                    view_count?: number | null
                }
                Relationships: [
                    {
                        foreignKeyName: "routines_approved_by_fkey"
                        columns: ["approved_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_coach_id_fkey"
                        columns: ["coach_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_nutrition_plan_id_fkey"
                        columns: ["nutrition_plan_id"]
                        isOneToOne: false
                        referencedRelation: "nutrition_plans"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_goal_id_fkey"
                        columns: ["user_goal_id"]
                        isOneToOne: false
                        referencedRelation: "user_goals"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "routines_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            student_reports: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    resolved_at: string | null
                    resolved_by: string | null
                    status: string | null
                    title: string
                    type: string
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    resolved_at?: string | null
                    resolved_by?: string | null
                    status?: string | null
                    title: string
                    type: string
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    resolved_at?: string | null
                    resolved_by?: string | null
                    status?: string | null
                    title?: string
                    type?: string
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "student_reports_resolved_by_fkey"
                        columns: ["resolved_by"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "student_reports_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_achievements: {
                Row: {
                    achievement_id: string
                    id: string
                    unlocked_at: string | null
                    user_id: string
                }
                Insert: {
                    achievement_id: string
                    id?: string
                    unlocked_at?: string | null
                    user_id: string
                }
                Update: {
                    achievement_id?: string
                    id?: string
                    unlocked_at?: string | null
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
                    {
                        foreignKeyName: "user_achievements_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_gamification: {
                Row: {
                    created_at: string | null
                    current_streak: number | null
                    last_activity_date: string | null
                    level: number | null
                    longest_streak: number | null
                    points: number | null
                    updated_at: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    current_streak?: number | null
                    last_activity_date?: string | null
                    level?: number | null
                    longest_streak?: number | null
                    points?: number | null
                    updated_at?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    current_streak?: number | null
                    last_activity_date?: string | null
                    level?: number | null
                    longest_streak?: number | null
                    points?: number | null
                    updated_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_gamification_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_goals: {
                Row: {
                    available_days: string[] | null
                    coach_notes: string | null
                    created_at: string | null
                    equipment_access: string[] | null
                    id: string
                    is_active: boolean | null
                    preferred_training_time: string | null
                    primary_goal: string
                    secondary_goals: string[] | null
                    start_date: string
                    target_body_fat_percentage: number | null
                    target_date: string | null
                    target_muscle_mass: number | null
                    target_weight: number | null
                    time_per_session_minutes: number | null
                    training_frequency_per_week: number | null
                    updated_at: string | null
                    user_id: string | null
                }
                Insert: {
                    available_days?: string[] | null
                    coach_notes?: string | null
                    created_at?: string | null
                    equipment_access?: string[] | null
                    id?: string
                    is_active?: boolean | null
                    preferred_training_time?: string | null
                    primary_goal: string
                    secondary_goals?: string[] | null
                    start_date?: string
                    target_body_fat_percentage?: number | null
                    target_date?: string | null
                    target_muscle_mass?: number | null
                    target_weight?: number | null
                    time_per_session_minutes?: number | null
                    training_frequency_per_week?: number | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Update: {
                    available_days?: string[] | null
                    coach_notes?: string | null
                    created_at?: string | null
                    equipment_access?: string[] | null
                    id?: string
                    is_active?: boolean | null
                    preferred_training_time?: string | null
                    primary_goal?: string
                    secondary_goals?: string[] | null
                    start_date?: string
                    target_body_fat_percentage?: number | null
                    target_date?: string | null
                    target_muscle_mass?: number | null
                    target_weight?: number | null
                    time_per_session_minutes?: number | null
                    training_frequency_per_week?: number | null
                    updated_at?: string | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_goals_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            classes_with_availability: {
                Row: {
                    activity_color: string | null
                    activity_id: string | null
                    activity_image: string | null
                    activity_name: string | null
                    booked_count: number | null
                    coach_id: string | null
                    coach_name: string | null
                    created_at: string | null
                    current_capacity: number | null
                    day_of_week: number | null
                    end_time: string | null
                    id: string | null
                    is_active: boolean | null
                    max_capacity: number | null
                    notes: string | null
                    start_time: string | null
                    teacher_text: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "classes_activity_id_fkey"
                        columns: ["activity_id"]
                        isOneToOne: false
                        referencedRelation: "activities"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "classes_coach_id_fkey"
                        columns: ["coach_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_bookings_detailed: {
                Row: {
                    activity_image: string | null
                    activity_name: string | null
                    class_schedule_id: string | null
                    coach_name: string | null
                    created_at: string | null
                    date: string | null
                    day_of_week: number | null
                    end_time: string | null
                    id: string | null
                    start_time: string | null
                    status: string | null
                    user_id: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "bookings_class_id_fkey"
                        columns: ["class_schedule_id"]
                        isOneToOne: false
                        referencedRelation: "class_schedules"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "bookings_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Functions: {
            increment_points: {
                Args: {
                    user_id: string
                    amount: number
                }
                Returns: undefined
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
    ? keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? TableName extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[TableName] extends {
        Row: infer R
    }
    ? R
    : never
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
    ? keyof PublicSchema["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? TableName extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
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
    ? keyof PublicSchema["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? TableName extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
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
    ? keyof PublicSchema["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? EnumName extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][EnumName]
    : never
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
