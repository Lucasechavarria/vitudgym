
import { model, genAI } from '@/lib/config/gemini';
import { AI_PROMPT_TEMPLATES, AITemplateKey } from '@/lib/constants/ai-templates';

/**
 * Parámetros para generar una rutina mejorada
 */
export interface RoutineGenerationContext {
  studentProfile: Record<string, any>;
  userGoal: Record<string, any>;
  gymEquipment: Record<string, any>[];
  coachNotes?: string;
  templateKey?: AITemplateKey;
  includeNutrition?: boolean;
}

/**
 * Estructura de una rutina generada
 */
export interface Routine {
  id?: string;
  routineName: string;
  durationWeeks: number;
  medicalConsiderations: string;
  motivationalQuote: string;
  weeklySchedule: Record<string, any>[];
  nutritionPlan?: Record<string, any>;
}

/**
 * Servicio de IA para generación de rutinas personalizadas
 * 
 * Utiliza Google Gemini para crear rutinas de entrenamiento integrando
 * datos de salud, objetivos e inventario del gimnasio.
 */
export class AIService {
  /**
   * Genera una rutina desde un prompt personalizado
   * 
   * @param prompt - Prompt completo para Gemini
   * @returns Rutina completa parseada desde JSON
   * @throws Error si la API de Gemini falla o la respuesta no es válida
   */
  async generateRoutineFromPrompt(prompt: string): Promise<any> {
    let lastError: any;
    const maxRetries = 2;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        if (i > 0) {
          console.log(`Retry attempt ${i} for AI generation...`);
          // Espera exponencial breve
          await new Promise(resolve => setTimeout(resolve, i * 1000));
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpiar respuesta (remover markdown code blocks y caracteres de control)
        text = text.replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
          .trim();

        try {
          return JSON.parse(text);
        } catch (e) {
          console.error(`Attempt ${i + 1}: Failed to parse AI response. Text length: ${text.length}`);
          lastError = new Error("La respuesta de la IA no es un JSON válido.");
          if (i === maxRetries) throw lastError;
        }
      } catch (error: any) {
        console.error(`AI Generation Attempt ${i + 1} failed:`, error.message);
        lastError = error;
        if (i === maxRetries) break;
      }
    }

    throw lastError || new Error("Error desconocido al generar la rutina con IA.");
  }

  /**
   * Construye el prompt para Gemini basado en el contexto real del alumno
   */
  buildPrompt(context: RoutineGenerationContext): string {
    const { studentProfile, userGoal, gymEquipment, coachNotes, templateKey, includeNutrition } = context;

    // Seleccionar plantilla según el objetivo o key
    const template = templateKey ? AI_PROMPT_TEMPLATES[templateKey] : this.inferTemplate(userGoal.primary_goal);

    return `
Genera una rutina de entrenamiento COMPLETA Y PERSONALIZADA en formato JSON con los siguientes datos:

INFORMACIÓN DEL ALUMNO:
- Nombre: ${studentProfile.full_name}
- Condiciones médicas: ${studentProfile.medical_info?.chronic_diseases || 'Ninguna'}
- Lesiones: ${studentProfile.medical_info?.injuries || 'Ninguna'}
- Peso actual: ${studentProfile.medical_info?.weight || 'No especificado'}kg
- Observaciones previas: ${studentProfile.coach_observations || 'Ninguna'}

OBJETIVOS:
- Objetivo principal: ${userGoal.primary_goal}
- Objetivos secundarios: ${userGoal.secondary_goals?.join(', ') || 'Ninguno'}
- Frecuencia semanal: ${userGoal.training_frequency_per_week} días
- Tiempo por sesión: ${userGoal.time_per_session_minutes} minutos
- Notas del coach para esta rutina: ${coachNotes || 'Ninguna'}

EQUIPAMIENTO DISPONIBLE:
${gymEquipment.map(eq => `- ${eq.name} (${eq.category})`).join('\n')}

${template.promptSuffix}

INSTRUCCIONES ADICIONALES:
1. Considera TODAS las condiciones médicas y lesiones.
2. Usa SOLO el equipamiento disponible.
3. ${includeNutrition ? 'Genera un plan nutricional acorde al objetivo.' : 'NO incluyas plan nutricional.'}

FORMATO DE RESPUESTA (JSON estricto):
{
    "routineName": "Nombre motivador",
    "durationWeeks": 8,
    "medicalConsiderations": "Pautas de seguridad específicas",
    "motivationalQuote": "Frase inspiradora",
    "weeklySchedule": [
        {
            "day": 1,
            "dayName": "Lunes",
            "focus": "Grupo muscular",
            "warmup": [{ "name": "Ejercicio", "duration": "5 min", "description": "..." }],
            "mainWorkout": [{
                "name": "Ejercicio",
                "equipment": "...",
                "sets": 3,
                "reps": "12",
                "rest": 60,
                "instructions": "Técnica",
                "modifications": "Si aplica por lesión"
            }],
            "cooldown": [{ "name": "Estiramiento", "duration": "5 min", "description": "..." }]
        }
    ],
    ${includeNutrition ? `"nutritionPlan": { "dailyCalories": 2000, "proteinGrams": 150, "carbsGrams": 200, "fatsGrams": 60, "meals": [...] }` : ''}
}
`;
  }

  private inferTemplate(goal: string): any {
    const g = goal.toLowerCase();
    if (g.includes('rehab') || g.includes('salud') || g.includes('lesión') || g.includes('dolor')) return AI_PROMPT_TEMPLATES.REHAB;
    if (g.includes('fuerza') || g.includes('músculo') || g.includes('hipertrofia') || g.includes('volumen')) return AI_PROMPT_TEMPLATES.HYPERTROPHY;
    return AI_PROMPT_TEMPLATES.BEGINNER;
  }
  /**
   * Genera una respuesta de chat manteniendo el contexto
   * 
   * @param message - Mensaje actual del usuario
   * @param history - Historial de la conversación previa
   * @returns Respuesta del asistente
   */
  async generateChatResponse(message: string, history: { role: 'user' | 'model', parts: string }[]): Promise<string> {
    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts }]
      })),
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  }
  /**
   * Analiza un video o imagen para corrección técnica
   * @param filePart Base64 string del archivo
   * @param mimeType Tipo de archivo (video/mp4, image/jpeg)
   */
  async analyzeMovement(filePart: string, mimeType: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Actúa como un entrenador experto en biomecánica.Analiza este video / imagen del ejercicio.
  Identifica:
1. Qué ejercicio es.
      2. 3 Puntos positivos de la técnica.
      3. 3 Correcciones o errores detectados(si los hay).
      4. Veredicto final: "Buena técnica", "Mejorable" o "Riesgo de lesión".
      
      Formatea la respuesta en Markdown claro y conciso.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: filePart,
          mimeType: mimeType
        }
      }
    ]);

    return result.response.text();
  }
}

export const aiService = new AIService();
