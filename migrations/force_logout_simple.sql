-- ============================================
-- Script: Forzar Cierre de Sesión (Versión Simplificada)
-- Descripción: Invalida los refresh tokens para forzar nuevo login
-- Fecha: 2025-12-19
-- ============================================

-- PASO 1: Obtener tu user_id (UUID)
SELECT id as tu_user_id, email, role
FROM public.profiles
WHERE email = 'echavarrialucas1986@gmail.com';

-- PASO 2: Copia el UUID del resultado anterior y reemplázalo abajo
-- Ejemplo: si el UUID es '123e4567-e89b-12d3-a456-426614174000'
-- Reemplaza 'TU_UUID_AQUI' con ese valor

-- PASO 3: Eliminar tokens (REEMPLAZA 'TU_UUID_AQUI' con el UUID del PASO 1)
DELETE FROM auth.refresh_tokens
WHERE user_id = 'b557f175-9533-4794-9498-72c84a7df612'::uuid;

-- PASO 4: Verificar que se eliminaron
SELECT COUNT(*) as tokens_eliminados
FROM auth.refresh_tokens
WHERE user_id = 'b557f175-9533-4794-9498-72c84a7df612'::uuid;
