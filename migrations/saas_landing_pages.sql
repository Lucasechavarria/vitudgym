-- ============================================
-- SCRIPT: LANDING PAGES Y MARKETING (White Label v2)
-- Descripción: Configuración de Landing Pages para el SaaS y Clientes
-- Idioma: Español
-- ============================================

BEGIN;

-- 1. Añadir configuración de landing a gimnasios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'config_landing') THEN
        ALTER TABLE public.gimnasios ADD COLUMN config_landing JSONB DEFAULT '{
            "hero_titulo": "Entrena al Siguiente Nivel",
            "hero_subtitulo": "Descubre una experiencia de entrenamiento única con tecnología de punta.",
            "hero_imagen": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80",
            "carrusel_imagenes": [],
            "mostrar_tarifas": true,
            "mostrar_ubicacion": true,
            "secciones": {
                "nosotros": true,
                "actividades": true,
                "contacto": true
            }
        }'::jsonb;
    END IF;
END $$;

COMMIT;
