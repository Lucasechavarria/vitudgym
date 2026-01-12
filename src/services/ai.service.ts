
import { aiClient, DEFAULT_MODEL, RoutineSchema } from '@/lib/config/gemini';
import { AI_PROMPT_TEMPLATES, AITemplateKey } from '@/lib/constants/ai-templates';
import { zodToJsonSchema } from 'zod-to-json-schema';

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
   * Genera una rutina utilizando la API estándar de Gemini
   */
  async generateRoutineFromPrompt(prompt: string): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`Generating routine with Gemini (Model: ${DEFAULT_MODEL}, Attempt: ${attempt + 1})...`);

        // @ts-ignore - Schema conversion
        const jsonSchema = zodToJsonSchema(RoutineSchema);
        if (jsonSchema && typeof jsonSchema === 'object' && '$schema' in jsonSchema) {
          delete (jsonSchema as any).$schema;
        }

        const model = aiClient.getGenerativeModel({
          model: DEFAULT_MODEL,
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema as any,
            temperature: 0.1
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error("La IA no devolvió texto.");
        }

        return JSON.parse(text);



      } catch (error: any) {
        console.error(`Gemini Attempt ${attempt + 1} Error:`, error.message);

        // Retry on 429 or 503
        if (error.status === 429 || error.status === 503 || error.message?.includes('429')) {
          attempt++;
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        throw new Error(`Fallo en la generación de rutina: ${error.message}`);
      }
    }
    throw new Error("Fallo en la generación de rutina tras varios intentos.");
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
   * Genera una respuesta de chat manteniendo el contexto vía Interaction ID
   */
  async generateChatResponse(message: string, history: { role: string; content: string }[] = [], _previousInteractionId?: string) {
    try {
      console.log('Chat response with Gemini (Standard)...');

      // Map history for standard model
      const chatHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const model = aiClient.getGenerativeModel({ model: DEFAULT_MODEL });
      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.7,
        }
      });

      const result = await chat.sendMessage(message);
      const response = await result.response;

      return {
        text: response.text(),
        interactionId: undefined // Standard chat doesn't persist ID in the same way, consumer must manage history
      };
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      throw new Error(error.message || "Error al procesar mensaje de IA");
    }
  }

  /**
   * Analiza un movimiento (visión) utilizando Gemini 3
   */
  async analyzeMovement(filePart: string, mimeType: string): Promise<string> {
    try {
      const prompt = `
        Actúa como un entrenador experto en biomecánica. Analiza este video/imagen del ejercicio.
        Identifica:
        1. Qué ejercicio es.
        2. 3 Puntos positivos de la técnica.
        3. 3 Correcciones o errores detectados.
        4. Veredicto final: "Buena técnica", "Mejorable" o "Riesgo de lesión".
        
        Formatea en Markdown claro.
      `;

      const model = aiClient.getGenerativeModel({ model: DEFAULT_MODEL });
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: filePart, mimeType: mimeType } }
      ]);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error("Vision Analyze Error:", error);
      return "Error analizando el movimiento con Gemini 3.";
    }
  }
}

export const aiService = new AIService();
