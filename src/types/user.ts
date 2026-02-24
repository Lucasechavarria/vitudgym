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
    nombre_completo: string | null;
    nombre?: string | null;
    apellido?: string | null;
    correo: string;
    email?: string; // Legacy/Alias support
    rol: UserRole;
    url_avatar?: string | null;
    telefono?: string | null;
    dni?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    fecha_nacimiento?: string | null;
    gender?: string | null;
    informacion_medica?: any | null;
    contacto_emergencia?: any | null;
    exencion_aceptada?: boolean;
    fecha_exencion?: string | null;
    estado_membresia?: 'active' | 'inactive' | 'pending' | 'expired';
    fecha_inicio_membresia?: string | null;
    fecha_fin_membresia?: string | null;
    observaciones_entrenador?: string | null;
    restricciones_adicionales?: string | null;
    modificaciones_recomendadas?: string | null;
    onboarding_completado?: boolean;
    onboarding_completado_en?: string | null;
    creado_en?: string;
    actualizado_en?: string;
    [key: string]: any;
}

export interface AdminUserListResponse extends SupabaseUserProfile {
    name: string;
    membershipStatus: string;
    membershipEnds?: string | null;
}
