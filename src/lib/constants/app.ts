export const APP_NAME = 'Virtud Gym';
export const APP_VERSION = '1.0.0';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
    ADMIN: '/admin',
    COACH: '/coach',
    ONBOARDING: '/onboarding',
} as const;

export const ROLES = {
    MEMBER: 'member',
    COACH: 'coach',
    ADMIN: 'admin'
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
} as const;

export const ROUTINE_STATUS = {
    PENDING: 'pending_approval',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
} as const;

export const FITNESS_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
} as const;

export const GOALS = {
    LOSE_WEIGHT: 'lose_weight',
    GAIN_MUSCLE: 'gain_muscle',
    IMPROVE_ENDURANCE: 'improve_endurance',
    GENERAL_FITNESS: 'general_fitness'
} as const;

export const GENDERS = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'prefer_not_to_say'
} as const;
