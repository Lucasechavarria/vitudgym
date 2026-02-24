-- ============================================
-- SCRIPT: SAAS FOUNDATION (Multi-Gym & Branches)
-- Descripción: Tablas para escalar a múltiples gimnasios y sucursales
-- Fecha: 2026-02-23
-- ============================================

BEGIN;

-- 1. Crear Tabla de Gimnasios (Tenants)
CREATE TABLE IF NOT EXISTS public.gimnasios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    configuracion JSONB DEFAULT '{}'::jsonb,
    es_activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear Tabla de Sucursales
CREATE TABLE IF NOT EXISTS public.sucursales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gimnasio_id UUID REFERENCES public.gimnasios(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    configuracion JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Actualizar Perfiles para vinculación SaaS
-- Agregamos las columnas si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'gimnasio_id') THEN
        ALTER TABLE public.perfiles ADD COLUMN gimnasio_id UUID REFERENCES public.gimnasios(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'perfiles' AND column_name = 'sucursal_id') THEN
        ALTER TABLE public.perfiles ADD COLUMN sucursal_id UUID REFERENCES public.sucursales(id);
    END IF;
END $$;

-- 4. Crear el Gimnasio por defecto (Virtud Gym)
-- Usamos un DO block para hacerlo idempotente
DO $$
DECLARE
    gym_id UUID;
BEGIN
    -- Insertar si no existe
    INSERT INTO public.gimnasios (nombre, slug)
    VALUES ('Virtud Gym', 'virtud-gym')
    ON CONFLICT (slug) DO NOTHING;
    
    -- Obtener el ID
    SELECT id INTO gym_id FROM public.gimnasios WHERE slug = 'virtud-gym';
    
    -- Insertar sucursal central
    INSERT INTO public.sucursales (gimnasio_id, nombre, direccion)
    VALUES (gym_id, 'Casa Central', 'Dirección Pendiente')
    ON CONFLICT DO NOTHING;
    
    -- Vincular todos los perfiles actuales al gym por defecto
    UPDATE public.perfiles SET gimnasio_id = gym_id WHERE gimnasio_id IS NULL;
END $$;

-- 5. Habilitar RLS en nuevas tablas
ALTER TABLE public.gimnasios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS
-- Superadmin puede hacer todo
DROP POLICY IF EXISTS "Superadmins manejan todo" ON public.gimnasios;
CREATE POLICY "Superadmins manejan todo" ON public.gimnasios
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

DROP POLICY IF EXISTS "Superadmins manejan sucursales" ON public.sucursales;
CREATE POLICY "Superadmins manejan sucursales" ON public.sucursales
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

-- Usuarios pueden ver su propio gimnasio
DROP POLICY IF EXISTS "Usuarios ven su gimnasio" ON public.gimnasios;
CREATE POLICY "Usuarios ven su gimnasio" ON public.gimnasios
    FOR SELECT TO authenticated USING (
        id = (SELECT gimnasio_id FROM public.perfiles WHERE id = auth.uid())
    );

-- 7. GRANTS EXPLÍCITOS (Para evitar "Permission Denied")
GRANT ALL ON public.gimnasios TO authenticated;
GRANT ALL ON public.sucursales TO authenticated;
GRANT ALL ON public.gimnasios TO service_role;
GRANT ALL ON public.sucursales TO service_role;

-- Grant usage on sequences for id generation if any serials were used (not for UUIDs but good practice)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

COMMIT;
