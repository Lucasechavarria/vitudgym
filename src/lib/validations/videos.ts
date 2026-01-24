import { z } from 'zod';

// ============================================================================
// VALIDACIONES PARA VIDEOS DE EJERCICIO
// ============================================================================

/**
 * Schema de validación para correcciones de IA en videos
 * Estructura del análisis de técnica con IA
 */
export const CorreccionesIASchema = z.object({
    postura: z.array(z.string()).optional(),
    tecnica: z.array(z.string()).optional(),
    recomendaciones: z.array(z.string()).optional(),
    puntos_fuertes: z.array(z.string()).optional(),
    puntaje_general: z.number().min(0).max(100).optional(),
    timestamp_correcciones: z.array(
        z.object({
            segundo: z.number(),
            correccion: z.string()
        })
    ).optional()
});

export type CorreccionesIA = z.infer<typeof CorreccionesIASchema>;
