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
