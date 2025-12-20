-- ============================================
-- Script: Asignar Rol de Superadmin
-- Descripción: Actualiza tu usuario a superadmin
-- Fecha: 2025-12-19
-- ============================================

-- IMPORTANTE: Reemplaza 'TU_EMAIL_AQUI' con tu email real

-- 1. Ver tu usuario actual
SELECT id, email, role, full_name
FROM public.profiles
WHERE email = 'echavarrialucas1986@gmail.com';

-- 2. Actualizar a superadmin (reemplaza 'TU_EMAIL_AQUI')
UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'echavarrialucas1986@gmail.com';
-- 3. Verificar el cambio
SELECT id, email, role, full_name
FROM public.profiles
WHERE email = 'echavarrialucas1986@gmail.com';

-- 4. Ver todos los superadmins actuales
SELECT id, email, role, full_name, created_at
FROM public.profiles
WHERE role = 'superadmin'
ORDER BY created_at;
