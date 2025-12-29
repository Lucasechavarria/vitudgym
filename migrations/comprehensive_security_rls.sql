-- =========================================================
-- SCRIPT INTEGRAL DE SEGURIDAD (RLS) - VIRTUD GYM
-- Basado en la Matriz de Permisos aprobada el 2025-12-19
-- =========================================================

BEGIN;

/* 
  1. FUNCIÓN FUNDAMENTAL DE SEGURIDAD 
   SECURITY DEFINER rompe la recursividad y permite consultar roles de forma segura.
*/
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

/* 
  2. ACTIVACIÓN GLOBAL DE RLS 
*/
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gym_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

/* 
  3. POLÍTICAS PARA: profiles
*/
DROP POLICY IF EXISTS "profiles_read_policy" ON public.profiles;
CREATE POLICY "profiles_read_policy" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO authenticated
USING (
  get_my_role() = 'superadmin' 
  OR (get_my_role() = 'admin' AND role != 'superadmin') 
  OR id = auth.uid()
);

/* 
  4. POLÍTICAS PARA: class_bookings (Reservas y Asistencia)
*/
DROP POLICY IF EXISTS "bookings_read_policy" ON public.class_bookings;
CREATE POLICY "bookings_read_policy" ON public.class_bookings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "bookings_all_policy" ON public.class_bookings;
CREATE POLICY "bookings_all_policy" ON public.class_bookings FOR ALL TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

/* 
  5. POLÍTICAS PARA: routines & nutrition_plans (Gestión Compartida)
*/
DROP POLICY IF EXISTS "routines_read_policy" ON public.routines;
CREATE POLICY "routines_read_policy" ON public.routines FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "routines_manage_policy" ON public.routines;
CREATE POLICY "routines_manage_policy" ON public.routines FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "nutrition_read_policy" ON public.nutrition_plans;
CREATE POLICY "nutrition_read_policy" ON public.nutrition_plans FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "nutrition_manage_policy" ON public.nutrition_plans;
CREATE POLICY "nutrition_manage_policy" ON public.nutrition_plans FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin', 'coach'));

/* 
  6. POLÍTICAS PARA: payments
*/
DROP POLICY IF EXISTS "payments_read_policy" ON public.payments;
CREATE POLICY "payments_read_policy" ON public.payments FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin'));

DROP POLICY IF EXISTS "payments_manage_policy" ON public.payments;
CREATE POLICY "payments_manage_policy" ON public.payments FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin'));

/* 
  7. POLÍTICAS PARA: activities & class_schedules
*/
DROP POLICY IF EXISTS "public_read_activities" ON public.activities;
CREATE POLICY "public_read_activities" ON public.activities FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "manage_activities" ON public.activities;
CREATE POLICY "manage_activities" ON public.activities FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin'));

DROP POLICY IF EXISTS "public_read_schedules" ON public.class_schedules;
CREATE POLICY "public_read_schedules" ON public.class_schedules FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "manage_schedules" ON public.class_schedules;
CREATE POLICY "manage_schedules" ON public.class_schedules FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin'));

/* 
  8. POLÍTICAS PARA: messages
*/
DROP POLICY IF EXISTS "messages_policy" ON public.messages;
CREATE POLICY "messages_policy" ON public.messages FOR ALL TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin'));

/* 
  9. POLÍTICAS PARA: student_reports (Tickets)
*/
DROP POLICY IF EXISTS "student_reports_read" ON public.student_reports;
CREATE POLICY "student_reports_read" ON public.student_reports FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "student_reports_insert" ON public.student_reports;
CREATE POLICY "student_reports_insert" ON public.student_reports FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "student_reports_update" ON public.student_reports;
CREATE POLICY "student_reports_update" ON public.student_reports FOR UPDATE TO authenticated
USING (get_my_role() IN ('superadmin', 'admin'));

/* 
  10. POLÍTICAS PARA: gym_equipment
*/
DROP POLICY IF EXISTS "gym_equipment_read" ON public.gym_equipment;
CREATE POLICY "gym_equipment_read" ON public.gym_equipment FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "gym_equipment_update" ON public.gym_equipment;
CREATE POLICY "gym_equipment_update" ON public.gym_equipment FOR UPDATE TO authenticated
USING (get_my_role() IN ('superadmin', 'admin', 'coach'));

DROP POLICY IF EXISTS "gym_equipment_all" ON public.gym_equipment;
CREATE POLICY "gym_equipment_all" ON public.gym_equipment FOR ALL TO authenticated
USING (get_my_role() IN ('superadmin', 'admin'));

/* 
  11. POLÍTICAS PARA: challenges (REFINADAS)
*/
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'challenges') THEN
        DROP POLICY IF EXISTS "challenges_read" ON public.challenges;
        EXECUTE 'CREATE POLICY "challenges_read" ON public.challenges FOR SELECT TO authenticated USING (true)';
        
        DROP POLICY IF EXISTS "challenges_insert" ON public.challenges;
        -- Aseguramos que el creador sea el usuario autenticado
        EXECUTE 'CREATE POLICY "challenges_insert" ON public.challenges FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid())';
        
        DROP POLICY IF EXISTS "challenges_manage" ON public.challenges;
        EXECUTE 'CREATE POLICY "challenges_manage" ON public.challenges FOR ALL TO authenticated USING (get_my_role() IN (''superadmin'', ''admin'', ''coach''))';
    END IF;
END $$;
/* 
  12. POLÍTICAS PARA: user_goals (AÑADIDO - CRÍTICO)
*/
DROP POLICY IF EXISTS "user_goals_read" ON public.user_goals;
CREATE POLICY "user_goals_read" ON public.user_goals FOR SELECT TO authenticated
USING (user_id = auth.uid() OR get_my_role() IN ('superadmin', 'admin', 'coach'));
DROP POLICY IF EXISTS "user_goals_all" ON public.user_goals;
CREATE POLICY "user_goals_all" ON public.user_goals FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
COMMIT;