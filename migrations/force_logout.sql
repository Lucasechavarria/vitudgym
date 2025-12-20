-- ============================================
-- Script: Forzar Cierre de Sesión para Refresh de Token
-- Descripción: Invalida los refresh tokens para forzar nuevo login
-- Fecha: 2025-12-19
-- ============================================

-- Forzar cierre de sesión invalidando refresh tokens
DELETE FROM auth.refresh_tokens
WHERE user_id = (
  SELECT id::uuid FROM public.profiles 
  WHERE email = 'echavarrialucas1986@gmail.com'
);

-- Verificar que se eliminaron los tokens
SELECT COUNT(*) as tokens_eliminados
FROM auth.refresh_tokens
WHERE user_id = (
  SELECT id::uuid FROM public.profiles 
  WHERE email = 'echavarrialucas1986@gmail.com'
);

-- Verificar el rol actual en profiles
SELECT id, email, role, full_name
FROM public.profiles
WHERE email = 'echavarrialucas1986@gmail.com';
