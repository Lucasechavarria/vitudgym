-- ============================================
-- SCRIPT: BRANDING Y PERSONALIZACIÓN (White Label)
-- Descripción: Columnas para identidad visual por gimnasio
-- Idioma: Español
-- ============================================

BEGIN;

-- 1. Añadir columnas de personalización a gimnasios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'color_primario') THEN
        ALTER TABLE public.gimnasios ADD COLUMN color_primario TEXT DEFAULT '#ef4444'; -- Rojo por defecto
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'color_secundario') THEN
        ALTER TABLE public.gimnasios ADD COLUMN color_secundario TEXT DEFAULT '#000000';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'config_visual') THEN
        ALTER TABLE public.gimnasios ADD COLUMN config_visual JSONB DEFAULT '{"dark_mode": true, "border_radius": "1rem"}'::jsonb;
    END IF;
END $$;

COMMIT;
