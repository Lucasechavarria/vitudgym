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

export type UserRole = 'admin' | 'coach' | 'member';

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
    nombre_completo: string | null;
    correo: string;
    email?: string; // Legacy/Alias support
    rol: UserRole;
    url_avatar?: string | null;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
    genero?: string | null;
    informacion_medica?: any | null;
    contacto_emergencia?: any | null;
    exencion_aceptada?: boolean;
    fecha_exencion?: string | null;
    estado_membresia?: 'active' | 'inactive' | 'pending' | 'expired';
    fecha_fin_membresia?: string | null;
    creado_en?: string;
    actualizado_en?: string;
    [key: string]: any; // Allow extra fields
}

export interface AdminUserListResponse extends SupabaseUserProfile {
    name: string;
    membershipStatus: string;
    membershipEnds?: string | null;
}
