-- Migration Script: English -> Spanish Naming Convention (Complete)
-- Based on the provided schema.

-- 1. Main Tables
ALTER TABLE IF EXISTS profiles RENAME TO perfiles;
ALTER TABLE IF EXISTS routines RENAME TO rutinas;
ALTER TABLE IF EXISTS exercises RENAME TO ejercicios;
ALTER TABLE IF EXISTS user_goals RENAME TO objetivos_del_usuario;
ALTER TABLE IF EXISTS class_bookings RENAME TO reservas_de_clase;
ALTER TABLE IF EXISTS class_schedules RENAME TO horarios_de_clase;
ALTER TABLE IF EXISTS nutrition_plans RENAME TO planes_nutricionales;
ALTER TABLE IF EXISTS activities RENAME TO actividades;
ALTER TABLE IF EXISTS workout_sessions RENAME TO sesiones_de_entrenamiento;
ALTER TABLE IF EXISTS exercise_performance_logs RENAME TO registros_de_ejercicio;
ALTER TABLE IF EXISTS messages RENAME TO mensajes;
ALTER TABLE IF EXISTS measurements RENAME TO mediciones;
ALTER TABLE IF EXISTS routine_access_logs RENAME TO registros_acceso_rutina;
ALTER TABLE IF EXISTS payments RENAME TO pagos;
ALTER TABLE IF EXISTS student_reports RENAME TO reportes_de_alumnos;

-- 2. Extended Tables (Found in Schema)
ALTER TABLE IF EXISTS achievements RENAME TO logros;
ALTER TABLE IF EXISTS challenges RENAME TO desafios; -- Or desafíos if strict
ALTER TABLE IF EXISTS challenge_participants RENAME TO participantes_desafio;
ALTER TABLE IF EXISTS coach_attendance RENAME TO asistencia_entrenador;
ALTER TABLE IF EXISTS gym_equipment RENAME TO equipamiento;
ALTER TABLE IF EXISTS profile_change_history RENAME TO historial_cambios_perfil;
ALTER TABLE IF EXISTS user_achievements RENAME TO logros_usuario;
ALTER TABLE IF EXISTS user_gamification RENAME TO gamificacion_usuario;

-- 3. Validation Columns (Idempotent checks)
DO $$
BEGIN
    -- Check references in perfiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'waiver_accepted') THEN
        ALTER TABLE perfiles ADD COLUMN waiver_accepted BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE perfiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 4. Note on Foreign Keys AND Views
-- This script renames tables. Existing Foreign Keys will remain valid but will keep their old names (e.g. routines_user_id_fkey).
-- This does NOT break functionality, but clean-up is optional.
-- Make sure to update your `supabase.ts` definitions manually or run `npx supabase gen types typescript` after this migration.
