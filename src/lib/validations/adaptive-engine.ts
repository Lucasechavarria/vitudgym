import { z } from 'zod';

export const AdaptiveSuggestionSchema = z.object({
    tipo: z.enum(['nutricion', 'entrenamiento', 'biomedico', 'general']),
    prioridad: z.enum(['baja', 'media', 'alta', 'critica']),
    titulo: z.string(),
    descripcion: z.string(),
    justificacion: z.string(),
    ajuste_propuesto: z.string(),
    metricas_afectadas: z.array(z.string()),
    riesgos_si_no_se_aplica: z.string().optional()
});

export const AdaptiveReportSchema = z.object({
    timestamp: z.string(),
    estatus_alumno: z.string(),
    sugerencias: z.array(AdaptiveSuggestionSchema),
    resumen_periodo: z.string(),
    puntaje_adherencia_estimado: z.number().min(0).max(100),
    riesgo_lesion: z.object({
        nivel: z.enum(['bajo', 'moderado', 'alto', 'critico']),
        puntaje: z.number().min(0).max(100),
        factores_detonantes: z.array(z.string()),
        recomendacion_inmediata: z.string(),
        analisis_fatiga: z.string()
    }),
    proyeccion_meta: z.object({
        fecha_estimada: z.string(),
        dias_restantes: z.number(),
        probabilidad_exito: z.number().min(0).max(100),
        mensaje_tactico: z.string()
    }).optional(),
    analisis_eficiencia: z.object({
        estado: z.string(),
        sugerencia_timing: z.string(),
        rating_metabolico: z.number().min(1).max(5)
    }).optional(),
    soporte_mental: z.object({
        estado_animo: z.string(),
        nivel_estres: z.string(),
        calidad_descanso: z.string(),
        recomendacion_bienestar: z.string()
    }).optional(),
    alertas_criticas: z.array(z.string())
});

export type AdaptiveSuggestion = z.infer<typeof AdaptiveSuggestionSchema>;
export type AdaptiveReport = z.infer<typeof AdaptiveReportSchema>;
