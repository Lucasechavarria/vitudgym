import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // 1. Get Current User (Coach)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const {
            studentId,
            name,
            goal,
            duration,
            exercises, // Array of exercises from the generator
            description,
            nutritionPlanId
        } = body;

        if (!studentId || !name || !exercises || exercises.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Create Routine
        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
                user_id: studentId, // Assigned to student
                coach_id: user.id, // Created by current coach
                name,
                goal,
                description,
                duration_weeks: parseInt(duration) || 4,
                is_active: true, // Set as active by default
                generated_by_ai: body.generatedByAI || false,
                nutrition_plan_id: nutritionPlanId || null
            })
            .select()
            .single();

        if (routineError) {
            console.error('Error creating routine:', routineError);
            throw routineError;
        }

        // 3. Prepare Exercises Data
        // The structure from RoutineGenerator might differ slightly from DB.
        // We need to map it carefully.
        // Accessing the exercises array properly.

        const exercisesToInsert = exercises.map((ex: Record<string, any>, index: number) => ({
            routine_id: routine.id,
            name: ex.name || ex.exercise, // Handle different naming conventions
            description: ex.notes,
            sets: parseInt(ex.sets) || 3,
            reps: ex.reps?.toString() || '10',
            rest_seconds: parseInt(ex.rest) || 60,
            muscle_group: ex.muscle_group || null,
            equipment: ex.equipment ? [ex.equipment] : [],
            day_number: ex.day_number || 1, // Default to day 1 if not specified
            order_in_day: index + 1
        }));

        // 4. Insert Exercises
        const { error: exercisesError } = await supabase
            .from('exercises')
            .insert(exercisesToInsert);

        if (exercisesError) {
            console.error('Error inserting exercises:', exercisesError);
            // Optional: Rollback routine creation if crucial
            throw exercisesError;
        }

        return NextResponse.json({ success: true, routineId: routine.id });

    } catch (error) {
        console.error('Routine API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
