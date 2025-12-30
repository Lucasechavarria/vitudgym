/**
 * User and Authentication Types
 */

export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRole = 'admin' | 'coach' | 'member' | 'superadmin';

export interface UserProfile extends User {
    nombre: string;
    edad?: number;
    peso?: number;
    altura?: number;
    experiencia?: 'Principiante' | 'Intermedio' | 'Avanzado';
    historialMedico?: MedicalHistory;
}

export interface MedicalHistory {
    lesiones?: string[];
    patologias?: string[];
    cirugias?: string[];
    medicacion?: string;
    restricciones?: string;
}

// --- Supabase & Admin Types ---

export interface SupabaseUserProfile {
    id: string;
    full_name: string | null;
    email: string;
    role: UserRole;
    avatar_url?: string | null;
    phone?: string | null;
    birth_date?: string | null;
    gender?: string | null;
    medical_info?: any | null;
    waiver_accepted?: boolean;
    membership_status?: 'active' | 'inactive' | 'pending' | 'expired';
    membership_end_date?: string | null;
    created_at?: string;
    [key: string]: any; // Allow extra fields
}

export interface AdminUserListResponse extends SupabaseUserProfile {
    name: string;
    membershipStatus: string;
    membershipEnds?: string | null;
}
