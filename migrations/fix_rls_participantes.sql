-- ============================================
-- SCRIPT: FIX RLS PARTICIPANTES_DESAFIO
-- Descripción: Asegura que los alumnos puedan unirse y ver su estado
-- Fecha: 2026-02-23
-- ============================================

BEGIN;

-- 1. Habilitar RLS
ALTER TABLE public.participantes_desafio ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas (si existen)
DROP POLICY IF EXISTS "Usuarios pueden ver sus propias participaciones" ON public.participantes_desafio;
DROP POLICY IF EXISTS "Usuarios pueden unirse a desafíos" ON public.participantes_desafio;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus participaciones" ON public.participantes_desafio;
DROP POLICY IF EXISTS "Admins pueden ver todas las participaciones" ON public.participantes_desafio;
DROP POLICY IF EXISTS "Admins pueden actualizar todas las participaciones" ON public.participantes_desafio;

-- 3. Crear nuevas políticas

-- SELECT: Usuarios ven la suya, staff ve todas
CREATE POLICY "participantes_select_policy" ON public.participantes_desafio
FOR SELECT TO authenticated
USING (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'coach')
  )
);

-- INSERT: Usuarios pueden unirse a sí mismos
CREATE POLICY "participantes_insert_policy" ON public.participantes_desafio
FOR INSERT TO authenticated
WITH CHECK (
  usuario_id = auth.uid()
);

-- UPDATE: Usuarios actulizan la suya (para completar), staff actualiza todas (para arbitrar)
CREATE POLICY "participantes_update_policy" ON public.participantes_desafio
FOR UPDATE TO authenticated
USING (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'coach')
  )
)
WITH CHECK (
  usuario_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND role IN ('admin', 'superadmin', 'coach')
  )
);

COMMIT;
