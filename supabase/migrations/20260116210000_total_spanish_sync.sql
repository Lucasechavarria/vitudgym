-- ==============================================================================
-- MIGRACIÓN DE SINCRONIZACIÓN TOTAL "ESPAÑOL SEGURO" (Idempotente + RLS FIX)
-- ==============================================================================
-- Esta migración renombra tablas y columnas a español solo si existen.
-- Corrige recursión de RLS y sincroniza roles con JWT metadata.
-- ==============================================================================

SET session_replication_role = 'replica';

-- 1. HABILITAR EXTENSIONES Y DEFINIR TIPOS ENUM
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'nivel_dificultad') THEN
        CREATE TYPE nivel_dificultad AS ENUM ('principiante', 'intermedio', 'avanzado', 'todos_los_niveles');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_conversacion') THEN
        CREATE TYPE tipo_conversacion AS ENUM ('privada', 'soporte', 'grupo');
    END IF;
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. ELIMINAR VISTAS DEPENDIENTES
DROP VIEW IF EXISTS user_bookings_detailed CASCADE;
DROP VIEW IF EXISTS active_memberships CASCADE;
DROP VIEW IF EXISTS classes_with_availability CASCADE;

-- 3. RENOMBRADO SEGURO DE TABLAS Y COLUMNAS
DO $$ 
BEGIN
    -- PERFILES
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'full_name') THEN
        ALTER TABLE perfiles RENAME COLUMN full_name TO nombre_completo;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE perfiles RENAME COLUMN avatar_url TO url_avatar;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'role') THEN
        ALTER TABLE perfiles RENAME COLUMN role TO rol;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'created_at') THEN
        ALTER TABLE perfiles RENAME COLUMN created_at TO creado_en;
    END IF;

    -- SESIONES DE ENTRENAMIENTO
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workout_sessions') THEN
        ALTER TABLE workout_sessions RENAME TO sesiones_de_entrenamiento;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sesiones_de_entrenamiento' AND column_name = 'user_id') THEN
        ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN user_id TO usuario_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sesiones_de_entrenamiento' AND column_name = 'routine_id') THEN
        ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN routine_id TO rutina_id;
    END IF;

    -- REGISTROS DE EJERCICIO
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_performance_logs') THEN
        ALTER TABLE exercise_performance_logs RENAME TO registros_de_ejercicio;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_logs') THEN
        ALTER TABLE exercise_logs RENAME TO registros_de_ejercicio;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_de_ejercicio' AND column_name = 'session_id') THEN
        ALTER TABLE registros_de_ejercicio RENAME COLUMN session_id TO sesion_id;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'registros_de_ejercicio' AND column_name = 'exercise_id') THEN
        ALTER TABLE registros_de_ejercicio RENAME COLUMN exercise_id TO ejercicio_id;
    END IF;
END $$;

-- 4. FUNCIONES DE SEGURIDAD OPTIMIZADAS (JWT METADATA)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (COALESCE(auth.jwt() -> 'app_metadata' ->> 'rol', auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (COALESCE(auth.jwt() -> 'app_metadata' ->> 'rol', auth.jwt() -> 'app_metadata' ->> 'role') IN ('coach', 'admin'));
$$;

-- 5. POLÍTICAS RLS (SIN RECURSIÓN)
DROP POLICY IF EXISTS "perfiles_select_policy" ON perfiles;
CREATE POLICY "perfiles_select_policy" ON perfiles FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "perfiles_update_policy" ON perfiles;
CREATE POLICY "perfiles_update_policy" ON perfiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- 6. TRIGGER DE SINCRONIZACIÓN DE ROLES
CREATE OR REPLACE FUNCTION public.sync_user_role_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('rol', NEW.rol::text, 'role', NEW.rol::text) WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_change ON public.perfiles;
CREATE TRIGGER on_profile_role_change AFTER INSERT OR UPDATE OF rol ON public.perfiles FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_metadata();

SET session_replication_role = 'origin';
