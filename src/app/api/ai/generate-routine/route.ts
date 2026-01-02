import { NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { aiService } from '@/services/ai.service';
import { authenticateAndRequireRole } from '@/lib/auth/api-auth';
import { userGoalsService } from '@/services/user-goals.service';
import { gymEquipmentService } from '@/services/gym-equipment.service';

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
            ['member', 'coach', 'admin', 'superadmin']
        );

        if (error) return error;

        // Verificar API key de Gemini
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                error: 'Server missing GEMINI_API_KEY'
            }, { status: 500 });
        }

        // Parsear y validar body
        const { studentId, goalId, goal, coachNotes, includeNutrition = true, templateKey } = await request.json();

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


        // 5. Generar prompt y llamar a Gemini usando el servicio unificado
        const prompt = aiService.buildPrompt({
            studentProfile,
            userGoal,
            gymEquipment,
            coachNotes,
            includeNutrition,
            templateKey
        });

        const aiResponse = await aiService.generateRoutineFromPrompt(prompt);

        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
                user_id: studentId,
                coach_id: profile.role === 'member' ? null : user.id, // Member requested, no coach yet
                user_goal_id: goalId || null,
                name: aiResponse.routineName,
                description: aiResponse.medicalConsiderations,
                goal: goalText,
                duration_weeks: aiResponse.durationWeeks,
                generated_by_ai: true,
                ai_prompt: prompt,
                status: profile.role === 'member' ? 'pending_approval' : 'approved',
                medical_considerations: aiResponse.medicalConsiderations,
                equipment_used: gymEquipment.map(eq => eq.id),
                is_active: profile.role === 'member' ? false : true,
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

        const { studentId } = await request.clone().json().catch(() => ({}));

        Sentry.captureException(error, {
            extra: {
                studentId,
                errorMessage,
                errorStack,
                context: 'AI Routine Generation'
            }
        });

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}
