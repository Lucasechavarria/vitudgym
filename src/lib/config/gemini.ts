import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables');
}

// Inicializar el cliente SDK estándar
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Exportar el cliente para uso general (aunque el servicio usará getGenerativeModel)
export const aiClient = genAI;

// Modelo principal para interacciones rápidas
export const DEFAULT_MODEL = "gemini-1.5-flash";

// Esquema Zod para la salida estructurada de rutinas según el Prompt Maestro
export const RoutineSchema = z.object({
    rutina_metadata: z.object({
        id_rutina: z.string(),
        compartida_con_alumno: z.boolean(),
        objetivo_principal: z.string(),
        nivel_alumno: z.string(),
        frecuencia_semanal: z.string(),
        duracion_estimada_minutos: z.number(),
        editable_por_profesor: z.boolean(),
        editable_por_alumno: z.boolean()
    }),
    sistema_de_logros: z.object({
        puntaje_maximo_sesion: z.number(),
        criterios_puntaje: z.object({
            ejercicio_completado: z.number(),
            rutina_finalizada: z.number(),
            respeto_de_tiempos: z.number(),
            constancia_semanal: z.number()
        })
    }),
    rutina: z.array(z.object({
        dia: z.union([z.number(), z.string()]),
        grupo_muscular: z.string(),
        bloques: z.array(z.object({
            tipo: z.enum(['ejercicio', 'descanso', 'circuito']),
            nombre: z.string(),
            cronometrado: z.boolean(),
            tiempo_recomendado_segundos: z.number(),
            tiempo_editable: z.boolean(),
            ejercicios: z.array(z.object({
                id_ejercicio: z.string(),
                nombre: z.string(),
                equipamiento: z.string(),
                series: z.number(),
                repeticiones: z.string(),
                tempo: z.string(),
                descanso_segundos: z.number(),
                descanso_editable: z.boolean(),
                marcable_como_realizado: z.boolean().default(true),
                estado_inicial: z.string().default('pendiente'),
                puntaje_base: z.number(),
                indicaciones_tecnicas: z.string(),
                alertas_medicas: z.string(),
                alternativa_sin_equipo: z.string()
            }))
        }))
    })),
    finalizacion_sesion: z.object({
        requiere_confirmacion: z.boolean(),
        metricas_generadas: z.object({
            tiempo_total_real: z.boolean(),
            ejercicios_completados: z.boolean(),
            ejercicios_omitidos: z.boolean(),
            puntaje_obtenido: z.boolean()
        })
    }),
    recomendaciones_post_entrenamiento: z.array(z.string()),
    alertas_y_advertencias: z.array(z.string()).optional(),
    plan_nutricional: z.any().optional() // Opcional según contexto
});

export const GEMINI_CONFIG = {
    model: "gemini-1.5-flash",
    temperature: 0.7,
    maxOutputTokens: 2048,
} as const;
