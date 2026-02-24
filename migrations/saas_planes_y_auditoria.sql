-- ============================================
-- SCRIPT: SAAS ENHANCEMENTS (Planes y Auditoría)
-- Descripción: Tablas para planes de suscripción y log de auditoría global
-- Idioma: Español
-- ============================================

BEGIN;

-- 1. Crear Tabla de Planes de Suscripción
CREATE TABLE IF NOT EXISTS public.planes_suscripcion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL, -- 'Básico', 'Pro', 'Elite'
    precio_mensual DECIMAL(10, 2) NOT NULL,
    limite_sucursales INTEGER DEFAULT 1,
    limite_usuarios INTEGER DEFAULT 50,
    caracteristicas JSONB DEFAULT '[]'::jsonb, -- ['Vision Lab', 'App Móvil', etc]
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Vincular Gimnasios con Planes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'plan_id') THEN
        ALTER TABLE public.gimnasios ADD COLUMN plan_id UUID REFERENCES public.planes_suscripcion(id);
    END IF;
END $$;

-- 3. Crear Tabla de Auditoría Global (Log de Actividad)
CREATE TABLE IF NOT EXISTS public.auditoria_global (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES public.perfiles(id),
    gimnasio_id UUID REFERENCES public.gimnasios(id),
    accion TEXT NOT NULL, -- 'CREACION_GYM', 'CAMBIO_ROL', 'ELIMINACION_USUARIO'
    entidad_tipo TEXT, -- 'PERFIL', 'GYM', 'PAGO'
    entidad_id UUID,
    detalles JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Insertar Planes por Defecto (Idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.planes_suscripcion WHERE nombre = 'Básico') THEN
        INSERT INTO public.planes_suscripcion (nombre, precio_mensual, limite_sucursales, limite_usuarios, caracteristicas)
        VALUES ('Básico', 25000, 1, 100, '["Gestión Miembros", "Pagos Manuales"]');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.planes_suscripcion WHERE nombre = 'Pro') THEN
        INSERT INTO public.planes_suscripcion (nombre, precio_mensual, limite_sucursales, limite_usuarios, caracteristicas)
        VALUES ('Pro', 45000, 3, 500, '["Vision Lab", "Rutinas IA", "Múltiples Sedes"]');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.planes_suscripcion WHERE nombre = 'Elite') THEN
        INSERT INTO public.planes_suscripcion (nombre, precio_mensual, limite_sucursales, limite_usuarios, caracteristicas)
        VALUES ('Elite', 80000, 99, 9999, '["Personalización Total", "Soporte 24/7", "API Acceso"]');
    END IF;
END $$;

-- 5. Asignar Plan Pro por defecto a los gimnasios existentes
UPDATE public.gimnasios SET plan_id = (SELECT id FROM public.planes_suscripcion WHERE nombre = 'Pro') WHERE plan_id IS NULL;

-- 6. RLS y Permisos
ALTER TABLE public.planes_suscripcion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_global ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS "Solo Superadmin maneja planes" ON public.planes_suscripcion;
CREATE POLICY "Solo Superadmin maneja planes" ON public.planes_suscripcion
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

DROP POLICY IF EXISTS "Todos pueden ver planes" ON public.planes_suscripcion;
CREATE POLICY "Todos pueden ver planes" ON public.planes_suscripcion
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Solo Superadmin ve auditoria" ON public.auditoria_global;
CREATE POLICY "Solo Superadmin ve auditoria" ON public.auditoria_global
    FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

-- Grants
GRANT ALL ON public.planes_suscripcion TO authenticated;
GRANT ALL ON public.auditoria_global TO authenticated;
GRANT ALL ON public.planes_suscripcion TO service_role;
GRANT ALL ON public.auditoria_global TO service_role;

COMMIT;
