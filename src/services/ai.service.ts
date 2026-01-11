
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

        // Limpiar respuesta (remover markdown code blocks)
        text = text.replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
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
   * Construye el prompt interactivo de VirtudCoach 2.0
   * Actúa como Entrenador Profesional y Arquitecto de UX.
   */
  buildPrompt(context: RoutineGenerationContext): string {
    const { studentProfile, userGoal, gymEquipment, coachNotes, templateKey, includeNutrition } = context;

    const normalizedKey = templateKey?.toString().toUpperCase() as AITemplateKey;
    const template = (normalizedKey && AI_PROMPT_TEMPLATES[normalizedKey])
      ? AI_PROMPT_TEMPLATES[normalizedKey]
      : this.inferTemplate(userGoal?.primary_goal || '');

    const safeTemplate = template || AI_PROMPT_TEMPLATES.BEGINNER;

    return `
Actúa como un entrenador personal profesional, planificador deportivo y arquitecto de experiencia de usuario para aplicaciones de entrenamiento.

Tu tarea es generar una rutina de entrenamiento OPTIMIZADA, INTERACTIVA Y COMPARTIBLE entre profesor y alumno, basada EXCLUSIVAMENTE en los siguientes datos:

1️⃣ INVENTARIO DEL GIMNASIO (equipamiento disponible):
${gymEquipment.map(eq => `- ${eq.name} (${eq.category})`).join('\n')}

2️⃣ PLANILLA MÉDICA DEL ALUMNO:
- Alumno: ${studentProfile.full_name}
- Sexo: ${studentProfile.gender || 'No especificado'}
- Medidas: ${studentProfile.medical_info?.weight || '?'}kg, ${studentProfile.medical_info?.height || '?'}cm
- Condiciones médicas: ${studentProfile.medical_info?.chronic_diseases || 'Ninguna'}
- Lesiones/Restricciones: ${studentProfile.medical_info?.injuries || 'Ninguna'}

3️⃣ INDICACIONES DEL PROFESOR:
${coachNotes || 'Ninguna indicación previa.'}

4️⃣ OBJETIVO DEL ALUMNO:
- Objetivo principal: ${userGoal?.primary_goal || 'Fitness general'}
- Frecuencia: ${userGoal?.training_frequency_per_week || 3} días/semana
- Tiempo sesión: ${userGoal?.time_per_session_minutes || 60} min

5️⃣ TEMPLATE DE RUTINA SELECCIONADO:
${safeTemplate.promptSuffix}

---

### REGLAS OBLIGATORIAS
- ❌ No inventar equipamiento.
- ❌ No incluir ejercicios contraindicados.
- ❌ No ignorar indicaciones del profesor.
- ✅ Cada ejercicio debe ser MARCABLE como realizado.
- ✅ Los ejercicios o descansos cronometrados deben incluir configuración de tiempo.
- ✅ Los tiempos deben auto-configurarse según la intensidad de la rutina.
- ✅ La rutina debe permitir marcar: completado, incompleto o omitido.
- ✅ La finalización debe generar métricas y puntos de logro.

### CRITERIOS FUNCIONALES
- Determinar si requiere cronómetro (ejercicio por tiempo / descanso).
- Definir puntualje base por ejecución ( gamificación).
- Calcular duración estimada total.
- Asociar alertas médicas específicas a cada ejercicio si aplica.

---

### FORMATO DE SALIDA (OBLIGATORIO – SOLO JSON VÁLIDO)

\`\`\`json
{
  "rutina_metadata": {
    "id_rutina": "UUID_TEMP",
    "compartida_con_alumno": true,
    "objetivo_principal": "${userGoal?.primary_goal}",
    "nivel_alumno": "Determinado según perfil",
    "frecuencia_semanal": "${userGoal?.training_frequency_per_week} días",
    "duracion_estimada_minutos": 0,
    "editable_por_profesor": true,
    "editable_por_alumno": true
  },

  "sistema_de_logros": {
    "puntaje_maximo_sesion": 500,
    "criterios_puntaje": {
      "ejercicio_completado": 10,
      "rutina_finalizada": 50,
      "respeto_de_tiempos": 20,
      "constancia_semanal": 100
    }
  },

  "rutina": [
    {
      "dia": 1,
      "grupo_muscular": "Ej: Pecho y Tríceps",
      "bloques": [
        {
          "tipo": "ejercicio | descanso | circuito",
          "nombre": "Nombre del bloque",
          "cronometrado": true,
          "tiempo_recomendado_segundos": 60,
          "tiempo_editable": true,
          "ejercicios": [
            {
              "id_ejercicio": "ID_TEMP",
              "nombre": "Nombre del ejercicio",
              "equipamiento": "De la lista permitida",
              "series": 4,
              "repeticiones": "12",
              "tempo": "3-0-1-0",
              "descanso_segundos": 60,
              "descanso_editable": true,
              "marcable_como_realizado": true,
              "estado_inicial": "pendiente",
              "puntaje_base": 15,
              "indicaciones_tecnicas": "Instrucciones de ejecución",
              "alertas_medicas": "Cuidado con...",
              "alternativa_sin_equipo": "Flexiones"
            }
          ]
        }
      ]
    }
  ],

  ${includeNutrition ? `
  "plan_nutricional": {
    "calorias_diarias": 2500,
    "proteinas_gramos": 180,
    "carbohidratos_gramos": 300,
    "grasas_gramos": 70,
    "comidas": [
      { "nombre": "Desayuno", "ejemplo": "Avena con claras" },
      { "nombre": "Almuerzo", "ejemplo": "Pollo con arroz" }
    ],
    "litros_agua": 3,
    "suplementos": ["Creatina 5g"],
    "pautas_generales": "Consistencia ante todo",
    "restricciones": ["Evitar ultraprocesados"]
  },
  ` : ''}

  "finalizacion_sesion": {
    "requiere_confirmacion": true,
    "metricas_generadas": {
      "tiempo_total_real": true,
      "ejercicios_completados": true,
      "ejercicios_omitidos": true,
      "puntaje_obtenido": true
    }
  },

  "recomendaciones_post_entrenamiento": [
    "Incluye estiramientos",
    "Hidratación"
  ]
}
\`\`\`
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
  async generateChatResponse(message: string, history: { role: string; content: string }[] = []) {
    try {
      const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Optimización: Limitar el historial a los últimos 10 mensajes para ahorrar tokens y mejorar latencia
      const limitedHistory = history.slice(-10).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = chatModel.startChat({
        history: limitedHistory,
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    } catch (error: unknown) {
      console.error("AI Chat Error:", error);
      throw new Error(error instanceof Error ? error.message : "Error al procesar mensaje de IA");
    }
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
