import { NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { aiService } from '@/services/ai.service';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { createClient } from '@/lib/supabase/server';
import { userGoalsService } from '@/services/user-goals.service';
import { gymEquipmentService } from '@/services/gym-equipment.service';
import { nutritionPlansService } from '@/services/nutrition-plans.service';

/**
 * POST /api/ai/generate-routine
 * 
 * Genera una rutina de entrenamiento personalizada completa usando Google Gemini AI.
 * Integra información médica, objetivos, inventario del gimnasio y genera plan nutricional.
 * 
 * @route POST /api/ai/generate-routine
 * @access Protected (requiere autenticación y rol coach/admin)
 */
export async function POST(request: Request) {
    try {
        // Verificar autenticación y rol (Estudiantes pueden solicitar, Coaches/Admins pueden generar directamente)
        const { user, profile, supabase, error } = await authenticateAndRequireRole(
            request,
            ['student', 'coach', 'admin', 'superadmin']
        );

        if (error) return error;

        // Verificar API key de Gemini
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: 'Server missing GEMINI_API_KEY'
            }, { status: 500 });
        }

        // Parsear y validar body
        const { studentId, goalId, goal, coachNotes, includeNutrition = true } = await request.json();

        // Acepta tanto goal (string) como goalId (database ID) para flexibilidad
        if (!studentId || (!goalId && !goal)) {
            return NextResponse.json({
                error: 'Missing required fields: studentId and (goalId or goal)'
            }, { status: 400 });
        }

        let userGoal;
        let goalText = '';

        // Si se proporciona goalId, buscar en BD
        if (goalId) {
            userGoal = await userGoalsService.getById(goalId);

            if (!userGoal || userGoal.user_id !== studentId) {
                return NextResponse.json({
                    error: 'Goal not found or does not belong to student'
                }, { status: 404 });
            }
            goalText = userGoal.primary_goal;
        } else {
            // Modo demo: usar goal string directamente
            goalText = goal;
            userGoal = {
                primary_goal: goal,
                training_frequency_per_week: 4,
                time_per_session_minutes: 60,
                duration_weeks: 8,
                coach_notes: coachNotes || '',
            };
        }

        // 1. Obtener información completa del alumno
        const { data: studentProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single();

        if (profileError || !studentProfile) {
            return NextResponse.json({
                error: 'Student not found'
            }, { status: 404 });
        }

        // 3. Obtener inventario del gimnasio disponible
        const gymEquipment = await gymEquipmentService.getAvailable();

        // 4. Calcular edad del alumno
        const calculateAge = (birthDate: string) => {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        };

        const age = studentProfile.date_of_birth
            ? calculateAge(studentProfile.date_of_birth)
            : null;

        // 5. Construir prompt completo para Gemini
        const prompt = `
Genera una rutina de entrenamiento COMPLETA Y PERSONALIZADA en formato JSON con los siguientes datos:

INFORMACIÓN DEL ALUMNO:
- Nombre: ${studentProfile.full_name}
- Edad: ${age || 'No especificada'}
- Género: ${studentProfile.gender || 'No especificado'}
- Condiciones médicas: ${studentProfile.medical_info?.chronic_diseases || 'Ninguna'}
- Lesiones: ${studentProfile.medical_info?.injuries || 'Ninguna'}
- Alergias: ${studentProfile.medical_info?.allergies || 'Ninguna'}
- Antecedentes: ${studentProfile.medical_info?.background || 'Ninguno'}
- Fuma: ${studentProfile.medical_info?.is_smoker ? 'Sí' : 'No'}
- Peso: ${studentProfile.medical_info?.weight || 'No especificado'}kg
- Presión Arterial: ${studentProfile.medical_info?.blood_pressure || 'No especificada'}
- Observaciones del coach: ${studentProfile.coach_observations || 'Ninguna'}
- Contacto Emergencia: ${studentProfile.emergency_contact?.full_name || 'No especificado'} (${studentProfile.emergency_contact?.phone || '-'})

OBJETIVOS:
- Objetivo principal: ${goalText}
- Objetivos secundarios: ${userGoal.secondary_goals?.join(', ') || 'Ninguno'}
- Frecuencia semanal: ${userGoal.training_frequency_per_week} días
- Tiempo por sesión: ${userGoal.time_per_session_minutes} minutos
- Días disponibles: ${userGoal.available_days?.join(', ') || 'Flexible'}
- Horario preferido: ${userGoal.preferred_training_time || 'Flexible'}
- Peso objetivo: ${userGoal.target_weight ? userGoal.target_weight + ' kg' : 'No especificado'}
- Fecha objetivo: ${userGoal.target_date || 'No especificada'}
- Notas del coach: ${userGoal.coach_notes || 'Ninguna'}

EQUIPAMIENTO DISPONIBLE EN EL GIMNASIO:
${gymEquipment.map(eq => `- ${eq.name} (${eq.category}) - Cantidad: ${eq.quantity}`).join('\n')}

INSTRUCCIONES:
1. Considera TODAS las condiciones médicas y lesiones al seleccionar ejercicios
2. Usa SOLO el equipamiento disponible en el gimnasio
3. Respeta la frecuencia semanal y tiempo por sesión
4. Genera un plan progresivo de ${userGoal.duration_weeks || 8} semanas
5. Incluye calentamiento, trabajo principal y enfriamiento
6. ${includeNutrition ? 'Incluye un plan nutricional completo' : 'No incluyas plan nutricional'}

FORMATO DE RESPUESTA (JSON estricto):
{
    "routineName": "Nombre descriptivo y motivador",
    "durationWeeks": ${userGoal.duration_weeks || 8},
    "medicalConsiderations": "Consideraciones médicas específicas basadas en la información del alumno",
    "motivationalQuote": "Frase motivacional personalizada",
    "weeklySchedule": [
        {
            "day": 1,
            "dayName": "Lunes",
            "focus": "Ej: Tren Superior",
            "warmup": [
                {
                    "name": "Nombre del ejercicio",
                    "duration": "5-10 minutos",
                    "description": "Descripción breve"
                }
            ],
            "mainWorkout": [
                {
                    "name": "Nombre del ejercicio",
                    "equipment": "Equipamiento usado",
                    "muscleGroup": "Grupo muscular",
                    "sets": 3,
                    "reps": "10-12",
                    "rest": 60,
                    "instructions": "Instrucciones detalladas",
                    "modifications": "Modificaciones si hay lesiones"
                }
            ],
            "cooldown": [
                {
                    "name": "Nombre del ejercicio",
                    "duration": "5-10 minutos",
                    "description": "Descripción breve"
                }
            ]
        }
    ],
    ${includeNutrition ? `"nutritionPlan": {
        "dailyCalories": 2500,
        "proteinGrams": 150,
        "carbsGrams": 250,
        "fatsGrams": 80,
        "waterLiters": 3.0,
        "meals": [
            {
                "name": "Desayuno",
                "time": "08:00",
                "foods": ["Alimento 1", "Alimento 2"],
                "calories": 500,
                "protein": 30,
                "carbs": 60,
                "fats": 15
            }
        ],
        "supplements": [
            {
                "name": "Nombre del suplemento",
                "dosage": "Dosis",
                "timing": "Cuándo tomarlo",
                "purpose": "Para qué sirve"
            }
        ],
        "generalGuidelines": "Pautas generales de alimentación",
        "restrictions": ["Restricciones alimentarias basadas en el perfil"]
    }` : ''}
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después.
`;

        // 6. Llamar a Gemini AI
        const aiResponse = await aiService.generateRoutineFromPrompt(prompt);

        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
                user_id: studentId,
                coach_id: profile.role === 'student' ? null : user.id, // Student requested, no coach yet
                user_goal_id: goalId || null,
                name: aiResponse.routineName,
                description: aiResponse.medicalConsiderations,
                goal: goalText,
                duration_weeks: aiResponse.durationWeeks,
                generated_by_ai: true,
                ai_prompt: prompt,
                status: profile.role === 'student' ? 'pending_approval' : 'approved',
                medical_considerations: aiResponse.medicalConsiderations,
                equipment_used: gymEquipment.map(eq => eq.id),
                is_active: profile.role === 'student' ? false : true,
            })
            .select()
            .single();

        if (routineError) throw routineError;

        // 8. Guardar ejercicios
        const exercises = [];
        for (const daySchedule of aiResponse.weeklySchedule) {
            let orderInDay = 1;

            // Warmup exercises
            for (const exercise of daySchedule.warmup || []) {
                exercises.push({
                    routine_id: routine.id,
                    name: exercise.name,
                    description: exercise.description,
                    day_number: daySchedule.day,
                    order_in_day: orderInDay++,
                    sets: 1,
                    reps: exercise.duration,
                });
            }

            // Main workout exercises
            for (const exercise of daySchedule.mainWorkout || []) {
                exercises.push({
                    routine_id: routine.id,
                    name: exercise.name,
                    description: exercise.instructions,
                    muscle_group: exercise.muscleGroup,
                    equipment: exercise.equipment ? [exercise.equipment] : [],
                    sets: exercise.sets,
                    reps: String(exercise.reps),
                    rest_seconds: exercise.rest,
                    day_number: daySchedule.day,
                    order_in_day: orderInDay++,
                    instructions: exercise.modifications,
                });
            }

            // Cooldown exercises
            for (const exercise of daySchedule.cooldown || []) {
                exercises.push({
                    routine_id: routine.id,
                    name: exercise.name,
                    description: exercise.description,
                    day_number: daySchedule.day,
                    order_in_day: orderInDay++,
                    sets: 1,
                    reps: exercise.duration,
                });
            }
        }

        if (exercises.length > 0) {
            const { error: exercisesError } = await supabase
                .from('exercises')
                .insert(exercises);

            if (exercisesError) throw exercisesError;
        }

        // 9. Guardar plan nutricional si se solicitó
        let nutritionPlan = null;
        if (includeNutrition && aiResponse.nutritionPlan) {
            const { data: nutrition, error: nutritionError } = await supabase
                .from('nutrition_plans')
                .insert({
                    user_id: studentId,
                    coach_id: user.id,
                    daily_calories: aiResponse.nutritionPlan.dailyCalories,
                    protein_grams: aiResponse.nutritionPlan.proteinGrams,
                    carbs_grams: aiResponse.nutritionPlan.carbsGrams,
                    fats_grams: aiResponse.nutritionPlan.fatsGrams,
                    meals: aiResponse.nutritionPlan.meals,
                    water_liters: aiResponse.nutritionPlan.waterLiters,
                    supplements: aiResponse.nutritionPlan.supplements,
                    general_guidelines: aiResponse.nutritionPlan.generalGuidelines,
                    restrictions: aiResponse.nutritionPlan.restrictions,
                    is_active: false, // Coach debe aprobar primero
                })
                .select()
                .single();

            if (nutritionError) throw nutritionError;

            nutritionPlan = nutrition;

            // Vincular plan nutricional con rutina
            await supabase
                .from('routines')
                .update({ nutrition_plan_id: nutrition.id })
                .eq('id', routine.id);
        }

        return NextResponse.json({
            success: true,
            routine: {
                ...routine,
                exerciseCount: exercises.length,
            },
            nutritionPlan,
            message: 'Rutina generada exitosamente. Pendiente de aprobación del coach.'
        });

    } catch (error) {
        console.error('AI Generation Error:', error);

        // Capture specific error details for Sentry
        const errorMessage = error instanceof Error ? error.message : 'Error generating routine';
        const errorStack = error instanceof Error ? error.stack : undefined;

        Sentry.captureException(error, {
            extra: {
                studentId: (await request.clone().json().catch(() => ({}))).studentId,
                errorMessage,
                errorStack,
                context: 'AI Routine Generation'
            }
        });

        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}
