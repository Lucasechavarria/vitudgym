-- ============================================
-- Script: Agregar Políticas UPDATE para Admins
-- Descripción: Permitir que superadmins/admins actualicen perfiles
-- Fecha: 2025-12-19
-- ============================================

-- 1. Eliminar políticas UPDATE antiguas si existen
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON public.profiles;

-- 2. Crear política para que superadmins puedan actualizar cualquier perfil
CREATE POLICY "Superadmins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  )
);

-- 3. Crear política para que admins puedan actualizar perfiles (excepto superadmins)
CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'superadmin')
  )
  AND role != 'superadmin' -- Admins no pueden modificar superadmins
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'superadmin')
  )
  AND role != 'superadmin'
);

-- 4. Verificar políticas creadas
SELECT policyname, cmd, permissive
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd IN ('UPDATE', 'SELECT')
ORDER BY cmd, policyname;
