-- ============================================
-- Script: Limpiar y Recrear Políticas RLS
-- Descripción: Elimina TODAS las políticas y crea la jerarquía correcta
-- Fecha: 2025-12-19
-- ============================================

-- PASO 1: Obtener y eliminar TODAS las políticas existentes dinámicamente
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- PASO 2: Verificar que no queden políticas
SELECT COUNT(*) as policies_remaining FROM pg_policies WHERE tablename = 'profiles';

-- PASO 3: CREAR POLÍTICAS SELECT (Lectura)

-- Superadmins pueden leer TODOS los perfiles
CREATE POLICY "superadmin_select_all"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- Admins pueden leer TODOS los perfiles
CREATE POLICY "admin_select_all"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Coaches pueden leer TODOS los perfiles
CREATE POLICY "coach_select_all"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'coach'
  )
);

-- Usuarios pueden leer su propio perfil
CREATE POLICY "user_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- PASO 4: CREAR POLÍTICAS UPDATE (Actualización)

-- Superadmins pueden actualizar CUALQUIER perfil
CREATE POLICY "superadmin_update_all"
ON public.profiles FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
);

-- Admins pueden actualizar perfiles (excepto superadmins)
CREATE POLICY "admin_update_non_superadmin"
ON public.profiles FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  AND role != 'superadmin'
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
  AND role != 'superadmin'
);

-- Usuarios pueden actualizar su propio perfil
CREATE POLICY "user_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- PASO 5: CREAR POLÍTICAS INSERT (Creación)

-- Cualquier usuario autenticado puede crear su perfil como member
CREATE POLICY "user_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid() 
  AND (role = 'member' OR role IS NULL)
);

-- PASO 6: Verificar políticas creadas
SELECT 
  policyname, 
  cmd,
  permissive,
  CASE 
    WHEN policyname LIKE 'superadmin%' THEN '🔴 Superadmin'
    WHEN policyname LIKE 'admin%' THEN '🟠 Admin'
    WHEN policyname LIKE 'coach%' THEN '🟡 Coach'
    WHEN policyname LIKE 'user%' THEN '🟢 User'
    ELSE '⚪ Other'
  END as role_level
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY 
  CASE 
    WHEN policyname LIKE 'superadmin%' THEN 1
    WHEN policyname LIKE 'admin%' THEN 2
    WHEN policyname LIKE 'coach%' THEN 3
    WHEN policyname LIKE 'user%' THEN 4
    ELSE 5
  END,
  cmd,
  policyname;
