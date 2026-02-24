-- ==============================================================================
-- FIX: RECONOCIMIENTO DE SUPERADMIN EN METADATA Y RLS
-- ==============================================================================

BEGIN;

-- 1. Actualizar la función de normalización para incluir superadmin
CREATE OR REPLACE FUNCTION public.get_normalized_role(role_text text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN CASE 
    WHEN LOWER(role_text) IN ('superadmin', 'dueño', 'owner') THEN 'superadmin'
    WHEN LOWER(role_text) IN ('admin', 'administrador') THEN 'admin'
    WHEN LOWER(role_text) IN ('coach', 'profesor', 'entrenador') THEN 'coach'
    ELSE 'member'
  END;
END;
$$;

-- 2. Asegurar que las políticas de perfiles permitan al superadmin verlo todo
-- Re-crear políticas con soporte explícito para superadmin
DROP POLICY IF EXISTS "perfiles_select_policy" ON perfiles;
CREATE POLICY "perfiles_select_policy" ON perfiles 
FOR SELECT USING (
  auth.uid() = id 
  OR public.get_normalized_role(COALESCE(auth.jwt() -> 'app_metadata' ->> 'rol', auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'superadmin')
);

DROP POLICY IF EXISTS "perfiles_update_policy" ON perfiles;
CREATE POLICY "perfiles_update_policy" ON perfiles 
FOR UPDATE USING (
  auth.uid() = id 
  OR public.get_normalized_role(COALESCE(auth.jwt() -> 'app_metadata' ->> 'rol', auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'superadmin')
);

-- 3. Forzar sincronización de metadata para Lucas
-- Al actualizar el rol (incluso al mismo valor), el trigger 'on_profile_role_change' se disparará
-- y actualizará el auth.users.raw_app_meta_data con el rol normalizado (superadmin).
UPDATE public.perfiles 
SET rol = 'superadmin' 
WHERE correo = 'echavarrialucas1986@gmail.com';

COMMIT;
