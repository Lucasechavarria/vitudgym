import { z } from 'zod';

// ============================================================================
// VALIDACIONES PARA PLANES NUTRICIONALES
// ============================================================================

/**
 * Schema para una comida individual
 */
const ComidaSchema = z.object({
    nombre: z.string().min(1, 'El nombre de la comida es requerido'),
    calorias: z.number().min(0).optional(),
    proteinas: z.number().min(0).optional(),
    carbohidratos: z.number().min(0).optional(),
    grasas: z.number().min(0).optional(),
    descripcion: z.string().optional()
});

/**
 * Schema de validación para comidas del plan nutricional
 * Estructura: { "desayuno": [...], "almuerzo": [...], etc }
 */
export const ComidasSchema = z.record(
    z.string(),
    z.array(ComidaSchema)
);

export type Comidas = z.infer<typeof ComidasSchema>;

/**
 * Schema de validación para suplementos
 */
export const SuplementosSchema = z.array(
    z.object({
        nombre: z.string().min(1, 'El nombre del suplemento es requerido'),
        dosis: z.string().min(1, 'La dosis es requerida'),
        momento: z.string().min(1, 'El momento de toma es requerido')
    })
);

export type Suplementos = z.infer<typeof SuplementosSchema>;

/**
 * Schema para el análisis de nutrición por IA (MacroSnap)
 */
export const NutritionAnalysisSchema = z.object({
    comida_nombre: z.string(),
    ingredientes_detectados: z.array(z.string()),
    calorias_estimadas: z.number(),
    macros: z.object({
        proteinas: z.number(),
        carbohidratos: z.number(),
        grasas: z.number()
    }),
    puntuacion_salud: z.number().min(1).max(10),
    recomendacion_tactica: z.string()
});

export type NutritionAnalysis = z.infer<typeof NutritionAnalysisSchema>;
