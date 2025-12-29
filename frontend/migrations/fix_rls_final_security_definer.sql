-- ============================================
-- SOLUCIÓN DEFINITIVA: RLS con Función Security Definer
-- Descripción: Rompe la recursividad usando una función privilegiada
-- Fecha: 2025-12-19
-- ============================================

-- 1. Limpiar todo lo anterior
DROP POLICY IF EXISTS "superadmin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_select_all" ON public.profiles;
DROP POLICY IF EXISTS "coach_select_all" ON public.profiles;
DROP POLICY IF EXISTS "user_select_own" ON public.profiles;
DROP POLICY IF EXISTS "superadmin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_non_superadmin" ON public.profiles;
DROP POLICY IF EXISTS "user_update_own" ON public.profiles;
DROP POLICY IF EXISTS "user_insert_own" ON public.profiles;

-- 2. Crear función segura para verificar roles
-- IMPORTANTE: 'SECURITY DEFINER' hace que la función se ejecute con permisos de superusuario,
-- evitando el bucle de RLS al consultar la tabla profiles.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Crear políticas usando la función segura

-- LECTURA (SELECT)
CREATE POLICY "profiles_read_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Permite leer si:
  -- 1. Es mi propio perfil
  id = auth.uid()
  OR
  -- 2. Soy superadmin, admin o coach (verificado vía función segura)
  get_my_role() IN ('superadmin', 'admin', 'coach')
);

-- ACTUALIZACIÓN (UPDATE)
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Condición para VER la fila a actualizar:
  -- 1. Soy superadmin (puede ver todo)
  get_my_role() = 'superadmin'
  OR
  -- 2. Soy admin y no es un superadmin
  (get_my_role() = 'admin' AND role != 'superadmin')
  OR
  -- 3. Es mi propio perfil
  id = auth.uid()
)
WITH CHECK (
  -- Condición para VALIDAR el nuevo valor:
  -- 1. Soy superadmin (puede escribir todo)
  get_my_role() = 'superadmin'
  OR
  -- 2. Soy admin y no estoy tocando un superadmin
  (get_my_role() = 'admin' AND role != 'superadmin')
  OR
  -- 3. Es mi propio perfil (no puedo cambiar mi rol)
  id = auth.uid()
);

-- INSERCIÓN (INSERT)
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid()
);

-- 4. Verificar resultado (deberían verse 3 políticas limpias)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
