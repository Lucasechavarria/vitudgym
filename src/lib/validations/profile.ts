import { z } from 'zod';

// ============================================================================
// VALIDACIONES PARA PERFILES
// ============================================================================

/**
 * Schema de validación para contacto de emergencia
 * Campos requeridos: nombre, telefono, parentesco
 */
export const ContactoEmergenciaSchema = z.object({
    nombre: z.string().min(1, 'El nombre del contacto es requerido'),
    telefono: z.string()
        .min(7, 'El teléfono debe tener al menos 7 dígitos')
        .max(20, 'El teléfono no puede exceder 20 caracteres'),
    parentesco: z.string().min(1, 'El parentesco es requerido')
});

export type ContactoEmergencia = z.infer<typeof ContactoEmergenciaSchema>;

/**
 * Schema de validación para información médica
 * Campos requeridos: grupo_sanguineo, presion_arterial
 * Campos opcionales: fuma, lesiones, alergias, enfermedades_cronicas
 */
export const InformacionMedicaSchema = z.object({
    grupo_sanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const, {
        message: 'Grupo sanguíneo inválido'
    }),
    presion_arterial: z.enum(['normal', 'alta', 'baja'] as const, {
        message: 'Presión arterial debe ser: normal, alta o baja'
    }),
    fuma: z.boolean().optional(),
    lesiones: z.string().max(500, 'Las lesiones no pueden exceder 500 caracteres').optional(),
    alergias: z.string().max(500, 'Las alergias no pueden exceder 500 caracteres').optional(),
    enfermedades_cronicas: z.string().max(500, 'Las enfermedades crónicas no pueden exceder 500 caracteres').optional()
});

export type InformacionMedica = z.infer<typeof InformacionMedicaSchema>;
