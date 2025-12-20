-- ============================================
-- Script: Verificar y Crear Políticas RLS para Profiles
-- Descripción: Asegurar que admins puedan leer todos los perfiles
-- Fecha: 2025-12-19
-- ============================================

-- 1. Verificar si RLS está habilitado en profiles
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 2. Ver políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can read their students profiles" ON public.profiles;

-- 4. Crear política para que admins/superadmins/coaches puedan leer todos los perfiles
CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin', 'coach')
  )
);

-- 5. Crear política para que usuarios puedan leer su propio perfil
CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- 6. Verificar que las políticas se crearon
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
