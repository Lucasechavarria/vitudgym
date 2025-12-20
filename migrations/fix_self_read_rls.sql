-- ============================================
-- Script: Fix RLS for Self-Reading
-- Descripción: Garantizar lectura del propio perfil sin recursividad
-- Fecha: 2025-12-19
-- ============================================

-- 1. Asegurar que existe una política simple para leer el propio perfil
DROP POLICY IF EXISTS "user_select_own" ON public.profiles;

CREATE POLICY "user_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
);

-- 2. Asegurar que los superadmins pueden leer todo (sin recursividad infinita para su propio perfil)
-- La política user_select_own ya cubre su propio perfil, así que esta es para ver OTROS
DROP POLICY IF EXISTS "superadmin_select_all" ON public.profiles;

CREATE POLICY "superadmin_select_all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  )
  AND id != auth.uid() -- Evitar conflicto con user_select_own para el propio perfil
);
