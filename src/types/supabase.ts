export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    dni: string | null
                    address: string | null
                    city: string | null
                    emergency_contact: Json | null
                    medical_info: Json | null
                    waiver_accepted: boolean | null
                    waiver_date: string | null
                    // Keep existing below
                    id: string
                    email: string
                    full_name: string | null
                    first_name: string | null
                    last_name: string | null
                    avatar_url: string | null
                    phone: string | null
                    role: 'member' | 'coach' | 'admin' | 'superadmin'
                    date_of_birth: string | null
                    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
                    membership_status: 'active' | 'inactive' | 'suspended' | 'expired'
                    membership_start_date: string | null
                    membership_end_date: string | null
                    created_at: string
                    updated_at: string
                    onboarding_completed?: boolean
                    onboarding_completed_at?: string
                }
                Insert: {
                    dni?: string | null
                    address?: string | null
                    city?: string | null
                    emergency_contact?: Json | null
                    medical_info?: Json | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                    // Keep existing below
                    id: string
                    email: string
                    full_name?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: 'member' | 'coach' | 'admin' | 'superadmin'
                    date_of_birth?: string | null
                    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
                    membership_status?: 'active' | 'inactive' | 'suspended' | 'expired'
                    membership_start_date?: string | null
                    membership_end_date?: string | null
                    created_at?: string
                    updated_at?: string
                    onboarding_completed?: boolean
                    onboarding_completed_at?: string
                }
                Update: {
                    dni?: string | null
                    address?: string | null
                    city?: string | null
                    emergency_contact?: Json | null
                    medical_info?: Json | null
                    waiver_accepted?: boolean | null
                    waiver_date?: string | null
                    // Keep existing below
                    id?: string
                    email?: string
                    full_name?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: 'member' | 'coach' | 'admin' | 'superadmin'
                    date_of_birth?: string | null
                    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
                    membership_status?: 'active' | 'inactive' | 'suspended' | 'expired'
                    membership_start_date?: string | null
                    membership_end_date?: string | null
                    created_at?: string
                    updated_at?: string
                    onboarding_completed?: boolean
                    onboarding_completed_at?: string
                }
            }
            user_goals: {
                Row: {
                    id: string
                    user_id: string
                    primary_goal: string
                    training_frequency_per_week: number | null
                    coach_notes: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    primary_goal: string
                    training_frequency_per_week?: number | null
                    coach_notes?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    primary_goal?: string
                    training_frequency_per_week?: number | null
                    coach_notes?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            gym_equipment: {
                Row: {
                    id: string
                    name: string
                    category: string
                    description: string | null
                    image_url: string | null
                    is_available: boolean
                    condition: 'excellent' | 'good' | 'fair' | 'needs_repair' | null
                    created_at: string
                    updated_at: string
                    quantity: number
                }
                Insert: {
                    id?: string
                    name: string
                    category: string
                    description?: string | null
                    image_url?: string | null
                    is_available?: boolean
                    condition?: 'excellent' | 'good' | 'fair' | 'needs_repair' | null
                    created_at?: string
                    updated_at?: string
                    quantity?: number
                }
                Update: {
                    id?: string
                    name?: string
                    category?: string
                    description?: string | null
                    image_url?: string | null
                    is_available?: boolean
                    condition?: 'excellent' | 'good' | 'fair' | 'needs_repair' | null
                    created_at?: string
                    updated_at?: string
                    quantity?: number
                }
            }
            nutrition_plans: {
                Row: {
                    id: string
                    user_id: string
                    coach_id: string | null
                    routine_id: string | null
                    name: string | null
                    description: string | null
                    meals: Json | null
                    supplements: Json | null
                    daily_calories: number | null
                    protein_grams: number | null
                    carbs_grams: number | null
                    fats_grams: number | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    coach_id?: string | null
                    routine_id?: string | null
                    name?: string | null
                    description?: string | null
                    meals?: Json | null
                    supplements?: Json | null
                    daily_calories?: number | null
                    protein_grams?: number | null
                    carbs_grams?: number | null
                    fats_grams?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    coach_id?: string | null
                    routine_id?: string | null
                    name?: string | null
                    description?: string | null
                    meals?: Json | null
                    supplements?: Json | null
                    daily_calories?: number | null
                    protein_grams?: number | null
                    carbs_grams?: number | null
                    fats_grams?: number | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            activities: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: 'gym' | 'martial_arts' | 'tcm' | 'wellness'
                    category: string | null
                    image_url: string | null
                    duration_minutes: number
                    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all_levels' | null
                    max_capacity: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    type: 'gym' | 'martial_arts' | 'tcm' | 'wellness'
                    category?: string | null
                    image_url?: string | null
                    duration_minutes?: number
                    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels' | null
                    max_capacity?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    type?: 'gym' | 'martial_arts' | 'tcm' | 'wellness'
                    category?: string | null
                    image_url?: string | null
                    duration_minutes?: number
                    difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels' | null
                    max_capacity?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    activity_id: string
                    coach_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_capacity: number
                    current_capacity: number
                    waitlist_enabled: boolean
                    is_active: boolean
                    is_recurring: boolean
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    activity_id: string
                    coach_id?: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_capacity?: number
                    current_capacity?: number
                    waitlist_enabled?: boolean
                    is_active?: boolean
                    is_recurring?: boolean
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    activity_id?: string
                    coach_id?: string | null
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    max_capacity?: number
                    current_capacity?: number
                    waitlist_enabled?: boolean
                    is_active?: boolean
                    is_recurring?: boolean
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            bookings: {
                Row: {
                    id: string
                    user_id: string
                    class_id: string
                    booking_date: string
                    status: 'confirmed' | 'cancelled' | 'waitlist' | 'attended' | 'no_show'
                    is_waitlist: boolean
                    waitlist_position: number | null
                    checked_in_at: string | null
                    checked_in_by: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    class_id: string
                    booking_date: string
                    status?: 'confirmed' | 'cancelled' | 'waitlist' | 'attended' | 'no_show'
                    is_waitlist?: boolean
                    waitlist_position?: number | null
                    checked_in_at?: string | null
                    checked_in_by?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    class_id?: string
                    booking_date?: string
                    status?: 'confirmed' | 'cancelled' | 'waitlist' | 'attended' | 'no_show'
                    is_waitlist?: boolean
                    waitlist_position?: number | null
                    checked_in_at?: string | null
                    checked_in_by?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            payments: {
                Row: {
                    id: string
                    user_id: string
                    amount: number
                    currency: string
                    concept: string
                    payment_method: 'cash' | 'card' | 'transfer' | 'mercadopago'
                    payment_provider: string | null
                    provider_payment_id: string | null
                    status: 'pending' | 'approved' | 'rejected' | 'refunded'
                    approved_by: string | null
                    approved_at: string | null
                    notes: string | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    amount: number
                    currency?: string
                    concept: string
                    payment_method: 'cash' | 'card' | 'transfer' | 'mercadopago'
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: 'pending' | 'approved' | 'rejected' | 'refunded'
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    amount?: number
                    currency?: string
                    concept?: string
                    payment_method?: 'cash' | 'card' | 'transfer' | 'mercadopago'
                    payment_provider?: string | null
                    provider_payment_id?: string | null
                    status?: 'pending' | 'approved' | 'rejected' | 'refunded'
                    approved_by?: string | null
                    approved_at?: string | null
                    notes?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            routines: {
                Row: {
                    id: string
                    user_id: string
                    coach_id: string | null
                    name: string
                    description: string | null
                    goal: string | null
                    duration_weeks: number | null
                    generated_by_ai: boolean
                    ai_prompt: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    coach_id?: string | null
                    name: string
                    description?: string | null
                    goal?: string | null
                    duration_weeks?: number | null
                    generated_by_ai?: boolean
                    ai_prompt?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    coach_id?: string | null
                    name?: string
                    description?: string | null
                    goal?: string | null
                    duration_weeks?: number | null
                    generated_by_ai?: boolean
                    ai_prompt?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            exercises: {
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
                    created_at: string
                    updated_at: string
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
                    created_at?: string
                    updated_at?: string
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
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            classes_with_availability: {
                Row: {
                    id: string
                    activity_id: string
                    coach_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    max_capacity: number
                    current_capacity: number
                    activity_name: string
                    activity_type: string
                    activity_image: string | null
                    coach_name: string | null
                    available_spots: number
                    availability_status: 'full' | 'almost_full' | 'available'
                }
            }
            user_bookings_detailed: {
                Row: {
                    id: string
                    user_id: string
                    class_id: string
                    booking_date: string
                    status: string
                    day_of_week: number
                    start_time: string
                    end_time: string
                    activity_name: string
                    activity_type: string
                    activity_image: string | null
                    coach_name: string | null
                }
            }
            active_memberships: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    membership_status: string
                    membership_start_date: string | null
                    membership_end_date: string | null
                    membership_alert: 'expired' | 'expiring_soon' | 'active'
                }
            }
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
