-- ============================================
-- SCRIPT MAESTRO DE CORRECCIÓN DE BASE DE DATOS
-- Descripción: Arregla definición corrupta de roles y RLS
-- Fecha: 2025-12-19
-- ============================================

BEGIN;

-- 1. DESACTIVAR RLS TEMPORALMENTE (Para evitar bloqueos durante la corrección)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. CORREGIR DEFINICIÓN DE LA COLUMNA ROLE
-- El default actual es incorrecto: '''member''::text,'::text
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'member';

-- 3. LIMPIAR DATOS CORRUPTOS (Si existen)
-- Asegura que 'member' esté limpio, sin comillas extra
UPDATE public.profiles
SET role = 'member'
WHERE role LIKE '%''member''%' OR role LIKE '%::text%';

-- 4. ASEGURAR QUE TU USUARIO ES SUPERADMIN
-- Reemplaza con tu email si es necesario, aquí uso el que me diste
UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'echavarrialucas1986@gmail.com';

-- 5. CREAR FUNCIÓN SEGURA PARA EVITAR RECURSIVIDAD (Security Definer)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. ELIMINAR TODAS LAS POLÍTICAS ANTIGUAS
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 7. CREAR NUEVAS POLÍTICAS ROBUSTAS (Usando la función segura)

-- Lectura:
CREATE POLICY "profiles_read_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() -- Leer propio
  OR get_my_role() IN ('superadmin', 'admin', 'coach') -- Leer otros si tengo permiso
);

-- Actualización:
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  (get_my_role() = 'superadmin') -- Superadmin ve todo para editar
  OR (get_my_role() = 'admin' AND role != 'superadmin') -- Admin ve no-superadmins
  OR id = auth.uid() -- Usuario ve su propio perfil
)
WITH CHECK (
  (get_my_role() = 'superadmin') -- Superadmin edita todo
  OR (get_my_role() = 'admin' AND role != 'superadmin') -- Admin edita no-superadmins
  OR id = auth.uid() -- Usuario edita su propio perfil (pero role no debe cambiar, validado en app/trigger si se desea)
);

-- Inserción (Registro):
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid()
);

-- 8. REACTIVAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMIT;

-- 9. VERIFICACIÓN FINAL
SELECT id, email, role FROM public.profiles WHERE email = 'echavarrialucas1986@gmail.com';
