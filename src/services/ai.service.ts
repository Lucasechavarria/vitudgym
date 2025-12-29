
import { model, genAI } from '@/lib/config/gemini';
import { GYM_EQUIPMENT, MOCK_STUDENTS } from '@/lib/constants';

/**
 * Parámetros para generar una rutina
 */
export interface RoutineParams {
  /** ID del alumno en Firestore o 'demo_user' para testing */
  studentId: string;
  /** Objetivo del entrenamiento */
  goal: string;
  /** Notas adicionales del coach (opcional) */
  coachNotes?: string;
}

/**
 * Estructura de una rutina generada
 */
export interface Routine {
  id?: string;
  routineName: string;
  motivationalQuote: string;
  duration: string;
  medicalConsiderations?: string;
  warmup: Exercise[];
  mainWorkout: WorkoutExercise[];
  cooldown: Exercise[];
  createdAt?: Date;
  createdBy?: string;
  assignedTo?: string;
}

export interface Exercise {
  exercise: string;
  duration: string;
  notes: string;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  equipment: string;
  notes: string;
}

/**
 * Servicio de IA para generación de rutinas personalizadas
 * 
 * Utiliza Google Gemini para crear rutinas de entrenamiento.
 */
export class AIService {
  /**
   * Genera una rutina desde un prompt personalizado (para API mejorada)
   * 
   * @param prompt - Prompt completo para Gemini
   * @returns Rutina completa parseada desde JSON
   * @throws Error si la API de Gemini falla o la respuesta no es válida
   */
  async generateRoutineFromPrompt(prompt: string): Promise<any> {
    // Llamar a Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpiar respuesta (remover markdown code blocks si existen)
    text = text.replace(/```json\n ? /g, '').replace(/```\n?/g, '').trim();

    // Parsear respuesta JSON
    const routine = JSON.parse(text);

    return routine;
  }

  /**
   * Genera una rutina basada en parámetros o un prompt directo.
   * Para compatibilidad con los tests y la API.
   */
  async generateRoutine(input: RoutineParams | string): Promise<any> {
    if (typeof input === 'string') {
      return this.generateRoutineFromPrompt(input);
    }

    // Si es un objeto RoutineParams, construir el prompt
    const studentContext = this.getStudentContext(input.studentId);
    const medicalHistory = this.getMedicalHistory(input.studentId);
    const prompt = this.buildPrompt(studentContext, medicalHistory, input.coachNotes);

    return this.generateRoutineFromPrompt(prompt);
  }

  /**
   * Obtiene información básica del alumno para el contexto de la IA.
   * Por ahora usa MOCK_STUDENTS, debería usar Supabase en producción.
   */
  private getStudentContext(studentId: string): string {
    const student = MOCK_STUDENTS[studentId as keyof typeof MOCK_STUDENTS];
    if (!student) return "Alumno: Demo (sin historial previo)";

    return `Alumno: ${student.nombre}, Edad: ${student.edad} años, Peso: ${student.peso} kg, Experiencia: ${student.experiencia}`;
  }

  /**
   * Obtiene el historial médico del alumno.
   */
  private getMedicalHistory(studentId: string): string {
    const student = MOCK_STUDENTS[studentId as keyof typeof MOCK_STUDENTS];
    if (!student) return "HISTORIAL MÉDICO: Ninguno registrado.";

    const h = student.historialMedico;
    return `HISTORIAL MÉDICO:
- Lesiones: ${h.lesiones.join(', ') || 'Ninguna'}
- Patologías: ${h.patologias.join(', ') || 'Ninguna'}
- Restricciones: ${h.restricciones || 'Ninguna'}`;
  }

  /**
   * Construye el prompt para Gemini con todas las instrucciones
   * 
   * @private
   * @param studentContext - Contexto del alumno
   * @param medicalHistory - Historial médico
   * @param coachNotes - Notas del coach (opcional)
   * @returns Prompt completo para Gemini
   */
  private buildPrompt(studentContext: string, medicalHistory: string, coachNotes?: string): string {
    return `
Actúa como "VirtudCoach", el mejor entrenador personal especializado en biomecánica y rehabilitación.

DATOS DEL ALUMNO:
${studentContext}

${medicalHistory}

NOTAS DEL COACH:
${coachNotes || 'Ninguna'}

EQUIPAMIENTO DISPONIBLE EN VIRTUD:
${GYM_EQUIPMENT.join(', ')}

INSTRUCCIONES CRÍTICAS:
1. Si hay lesiones o patologías, PRIORIZA la seguridad absoluta.Evita ejercicios que puedan agravar la condición.
2. Si hay cirugías recientes(<6 meses), consulta con médico antes de ejercicios de alto impacto.
3. SOLO usa equipamiento de la lista disponible.No inventes máquinas que no tenemos.
4. Adapta la intensidad según la experiencia del alumno.
5. Incluye calentamiento específico y enfriamiento.
6. Sé específico con técnica y rangos de movimiento seguros.

FORMATO DE SALIDA(JSON):
{
  "routineName": "Nombre épico y motivador",
    "motivationalQuote": "Frase personalizada inspiradora",
      "duration": "Duración en minutos",
        "medicalConsiderations": "Consideraciones médicas importantes (si aplica)",
          "warmup": [
            { "exercise": "Nombre", "duration": "5 min", "notes": "Indicaciones" }
          ],
            "mainWorkout": [
              {
                "name": "Ejercicio",
                "sets": 3,
                "reps": "10-12",
                "rest": "60s",
                "equipment": "Equipamiento usado",
                "notes": "Técnica y precauciones"
              }
            ],
              "cooldown": [
                { "exercise": "Estiramiento", "duration": "3 min", "notes": "Zona a estirar" }
              ]
}
`;
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
