-- ============================================================
-- FIX: Verificar y corregir columnas de la tabla desafios
-- Fecha: 2026-02-23
-- Problema: La API usaba nombres de columnas en inglés
--           (creator_id, judge_id, title, etc.) pero la tabla
--           fue migrada a español.
-- Solución: Este script verifica la existencia de las columnas
--           correctas y agrega las que falten.
-- ============================================================

DO $$
BEGIN
  -- Verificar que puntos_recompensa existe (antes: points_reward / points_prize)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'desafios'
      AND column_name = 'puntos_recompensa'
  ) THEN
    -- Si existe points_reward, renombrarlo
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'points_reward'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN points_reward TO puntos_recompensa;
      RAISE NOTICE '✅ Renombrado points_reward → puntos_recompensa';
    -- Si existe points_prize, renombrarlo
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'points_prize'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN points_prize TO puntos_recompensa;
      RAISE NOTICE '✅ Renombrado points_prize → puntos_recompensa';
    ELSE
      -- Crear la columna si no existe de ninguna forma
      ALTER TABLE public.desafios ADD COLUMN puntos_recompensa INTEGER DEFAULT 100;
      RAISE NOTICE '✅ Creada columna puntos_recompensa';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  puntos_recompensa ya existe, OK';
  END IF;

  -- Verificar creado_por (antes: creator_id o created_by)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'desafios'
      AND column_name = 'creado_por'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'creator_id'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN creator_id TO creado_por;
      RAISE NOTICE '✅ Renombrado creator_id → creado_por';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'created_by'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN created_by TO creado_por;
      RAISE NOTICE '✅ Renombrado created_by → creado_por';
    ELSE
      ALTER TABLE public.desafios ADD COLUMN creado_por UUID REFERENCES public.perfiles(id);
      RAISE NOTICE '✅ Creada columna creado_por';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  creado_por ya existe, OK';
  END IF;

  -- Verificar juez_id (antes: judge_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'desafios'
      AND column_name = 'juez_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'judge_id'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN judge_id TO juez_id;
      RAISE NOTICE '✅ Renombrado judge_id → juez_id';
    ELSE
      ALTER TABLE public.desafios ADD COLUMN juez_id UUID REFERENCES public.perfiles(id);
      RAISE NOTICE '✅ Creada columna juez_id';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  juez_id ya existe, OK';
  END IF;

  -- Verificar ganador_id (antes: winner_id)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'desafios'
      AND column_name = 'ganador_id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'desafios'
        AND column_name = 'winner_id'
    ) THEN
      ALTER TABLE public.desafios RENAME COLUMN winner_id TO ganador_id;
      RAISE NOTICE '✅ Renombrado winner_id → ganador_id';
    ELSE
      ALTER TABLE public.desafios ADD COLUMN ganador_id UUID REFERENCES public.perfiles(id);
      RAISE NOTICE '✅ Creada columna ganador_id';
    END IF;
  ELSE
    RAISE NOTICE 'ℹ️  ganador_id ya existe, OK';
  END IF;

END $$;

-- Verificar columnas finales de la tabla desafios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'desafios'
ORDER BY ordinal_position;
