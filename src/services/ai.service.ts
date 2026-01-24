
import { aiClient, DEFAULT_MODEL, RoutineSchema, SAFETY_SETTINGS } from '@/lib/config/gemini';
import { AI_PROMPT_TEMPLATES, AITemplateKey } from '@/lib/constants/ai-templates';
import { zodToJsonSchema } from 'zod-to-json-schema';

// ... (imports)

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

// ... (Rest of the class)

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
          safetySettings: SAFETY_SETTINGS, // Aplicar configuración de seguridad permisiva para salud
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: jsonSchema as any,
            temperature: 0.1
          }
        });

        const result = await model.generateContent(prompt);
        const response = await result.response;

        let text = '';
        try {
          text = response.text();
        } catch (e) {
          console.error("Error retrieving text (likely blocked):", e);
          console.log("Candidates:", JSON.stringify(response.candidates, null, 2));
          console.log("PromptFeedback:", JSON.stringify(response.promptFeedback, null, 2));
        }

        if (!text) {
          console.error("Empty text received. Full response:", JSON.stringify(result, null, 2));
          throw new Error("La IA no devolvió texto. Revise logs del servidor para detalles de seguridad/bloqueo.");
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
    const medicalData = studentProfile.informacion_medica || {};

    return `
Actúa como un entrenador personal profesional, planificador deportivo y arquitecto de experiencia de usuario para aplicaciones de entrenamiento.

Tu tarea es generar una rutina de entrenamiento OPTIMIZADA, INTERACTIVA Y COMPARTIBLE entre profesor y alumno, basada EXCLUSIVAMENTE en los siguientes datos:

1️⃣ INVENTARIO DEL GIMNASIO (equipamiento disponible):
${gymEquipment.map(eq => `- ${eq.name || eq.nombre} (${eq.category || eq.categoria})`).join('\n')}

2️⃣ PLANILLA MÉDICA DEL ALUMNO:
- Alumno: ${studentProfile.nombre_completo || studentProfile.full_name}
- Sexo: ${studentProfile.gender || 'No especificado'}
- Medidas: ${medicalData.weight || '?'}kg, ${medicalData.height || '?'}cm
- Condiciones médicas: ${medicalData.chronic_diseases || 'Ninguna'}
- Lesiones/Restricciones: ${medicalData.injuries || 'Ninguna'}

3️⃣ INDICACIONES DEL PROFESOR:
${coachNotes || 'Ninguna indicación previa.'}

4️⃣ OBJETIVO DEL ALUMNO:
- Objetivo principal: ${userGoal?.objetivo_principal || userGoal?.primary_goal || 'Fitness general'}
- Frecuencia: ${userGoal?.frecuencia_entrenamiento_por_semana || userGoal?.training_frequency_per_week || 3} días/semana
- Tiempo sesión: ${userGoal?.tiempo_por_sesion_minutos || userGoal?.time_per_session_minutes || 60} min

5️⃣ TEMPLATE DE RUTINA SELECCIONADO:
${safeTemplate.promptSuffix}

6️⃣ PLAN NUTRICIONAL Y SALUD (Si aplica):
  - Enfermedades Crónicas: ${medicalData.chronic_diseases || 'Ninguna'}
  - Alergias Alimentarias: ${medicalData.allergies || 'Ninguna'}
  - Medicación actual: ${medicalData.medications || 'Ninguna'}
  
  REGLA DE ORO NUTRICIONAL:
  Si el alumno tiene enfermedades como Diabetes, Hipertensión, Celiaquía o trastornos digestivos, 
  el "plan_nutricional" DEBE adaptarse estrictamente a estas condiciones. 
  "pautas_generales" debe explicar justificaciones médicas.
  Calcula macros con Mifflin-St Jeor.

7️⃣ PROTOCOLO DE SEGURIDAD LEGAL:
- Si detectas patologías como: ${medicalData.chronic_diseases || 'Ninguna'}, debes redactar un "aviso_legal" NIVEL ALTO/MEDIO.
- Si no hay patologías, usa NIVEL BAJO (standard).

---

### REGLAS OBLIGATORIAS
- ❌ No inventar equipamiento. Si el inventario es pobre, sugiere CALISTENIA.
- ❌ No ignorar indicaciones del profesor.
- ❌ Si el objetivo contradice la salud (ej: Powerlifting con Hernia), PRIORIZA SALUD.
- ✅ Los tiempo de descanso deben ser precisos.
- ✅ Incluir "aviso_legal" obligatorio.

---

### FORMATO DE SALIDA (JSON VÁLIDO SEGÚN ESQUEMA PROVISTO)
    `;
  }

  private inferTemplate(goal: string): any {
    const g = goal.toLowerCase();
    if (g.includes('rehab') || g.includes('salud') || g.includes('lesión') || g.includes('dolor')) return AI_PROMPT_TEMPLATES.REHAB;
    if (g.includes('fuerza') || g.includes('músculo') || g.includes('hipertrofia') || g.includes('volumen') || g.includes('ganancia_muscular')) return AI_PROMPT_TEMPLATES.HYPERTROPHY;
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
        interactionId: undefined
      };
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      throw new Error(error.message || "Error al procesar mensaje de IA");
    }
  }

  /**
   * Analiza un movimiento (visión) utilizando Gemini 3
   */
  async analyzeMovement(filePart: string, mimeType: string, exerciseName: string = "Ejercicio desconocido"): Promise<string> {
    try {
      const prompt = `
      Actúa como un Especialista en Biomecánica y Entrenador de Élite.
      Analiza este video del ejercicio: ${exerciseName}.
      
      INSTRUCCIONES CRÍTICAS:
      1. Observa la fase excéntrica y concéntrica.
      2. Evalúa la alineación de la columna y el rango de movimiento (ROM).
      3. Identifica si el tempo es adecuado para el objetivo del alumno.
      
      ESTRUCTURA DE RESPUESTA (Markdown):
      ## Análisis de Técnica: ${exerciseName}
      
      ### ✅ Puntos Correctos
      - (Menciona 2 o 3 cosas que el alumno hace bien)
      
      ### ❌ Correcciones Necesarias
      - **Error detectado:** [Nombre del error]
      - **Cómo corregirlo:** [Instrucción técnica clara]
      - **Riesgo asociado:** [Qué lesión podría causar si no se corrige]
      
      ### 📊 Veredicto Biomecánico
      **[PUNTUACIÓN: 0-10]**
      **Nivel:** (Excelente | Seguro | Necesita Ajustes | Peligroso)
      
      ---
      *Consejo del Coach:* "Un tip psicológico para mejorar la conexión mente-músculo en este ejercicio."
    `;

      const model = aiClient.getGenerativeModel({
        model: DEFAULT_MODEL,
        safetySettings: SAFETY_SETTINGS // Permitir análisis anatómico
      });

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
