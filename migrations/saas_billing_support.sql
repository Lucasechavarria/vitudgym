-- ============================================
-- SCRIPT: B2B BILLING, SUPPORT AND PLAN MANAGEMENT
-- Descripción: Facturación B2B, Soporte y Gestión de Planes Avanzada
-- Idioma: Español
-- ============================================

BEGIN;

-- 1. Ampliar tabla Gimnasios para Facturación
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'estado_pago_saas') THEN
        ALTER TABLE public.gimnasios ADD COLUMN estado_pago_saas TEXT DEFAULT 'al_dia'; -- 'al_dia', 'pendiente', 'suspendido'
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'fecha_proximo_pago') THEN
        ALTER TABLE public.gimnasios ADD COLUMN fecha_proximo_pago TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 month');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gimnasios' AND column_name = 'descuento_saas') THEN
        ALTER TABLE public.gimnasios ADD COLUMN descuento_saas INTEGER DEFAULT 0; -- Porcentaje de descuento
    END IF;
END $$;

-- 2. Tabla de Facturación B2B (Pagos de Gyms a la Plataforma)
CREATE TABLE IF NOT EXISTS public.pagos_saas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gimnasio_id UUID REFERENCES public.gimnasios(id) ON DELETE CASCADE,
    monto DECIMAL(10, 2) NOT NULL,
    monto_final DECIMAL(10, 2) NOT NULL,
    descuento_aplicado INTEGER DEFAULT 0,
    estado TEXT DEFAULT 'completado', -- 'pendiente', 'completado', 'fallido'
    metodo_pago TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    periodo_inicio DATE,
    periodo_fin DATE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Sistema de Soporte (Tickets)
CREATE TABLE IF NOT EXISTS public.tickets_soporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gimnasio_id UUID REFERENCES public.gimnasios(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.perfiles(id),
    asunto TEXT NOT NULL,
    prioridad TEXT DEFAULT 'media', -- 'baja', 'media', 'alta', 'critica'
    estado TEXT DEFAULT 'abierto', -- 'abierto', 'en_progreso', 'resuelto', 'cerrado'
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Mensajes de Soporte
CREATE TABLE IF NOT EXISTS public.mensajes_soporte (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES public.tickets_soporte(id) ON DELETE CASCADE,
    remitente_id UUID REFERENCES public.perfiles(id),
    mensaje TEXT NOT NULL,
    es_del_staff_saas BOOLEAN DEFAULT false,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS y Permisos
ALTER TABLE public.pagos_saas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets_soporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_soporte ENABLE ROW LEVEL SECURITY;

-- Políticas de Pagos SaaS
DROP POLICY IF EXISTS "Superadmin ve todos los pagos saas" ON public.pagos_saas;
CREATE POLICY "Superadmin ve todos los pagos saas" ON public.pagos_saas
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

DROP POLICY IF EXISTS "Gimnasios ven sus propios pagos" ON public.pagos_saas;
CREATE POLICY "Gimnasios ven sus propios pagos" ON public.pagos_saas
    FOR SELECT TO authenticated USING (
        gimnasio_id = (SELECT gimnasio_id FROM public.perfiles WHERE id = auth.uid())
    );

-- Políticas de Soporte
DROP POLICY IF EXISTS "Superadmin maneja todos los tickets" ON public.tickets_soporte;
CREATE POLICY "Superadmin maneja todos los tickets" ON public.tickets_soporte
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

DROP POLICY IF EXISTS "Gym Admins manejan sus tickets" ON public.tickets_soporte;
CREATE POLICY "Gym Admins manejan sus tickets" ON public.tickets_soporte
    FOR ALL TO authenticated USING (
        gimnasio_id = (SELECT gimnasio_id FROM public.perfiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Superadmin maneja todos los mensajes" ON public.mensajes_soporte;
CREATE POLICY "Superadmin maneja todos los mensajes" ON public.mensajes_soporte
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.perfiles WHERE id = auth.uid() AND rol = 'superadmin')
    );

DROP POLICY IF EXISTS "Usuarios ven mensajes de sus tickets" ON public.mensajes_soporte;
CREATE POLICY "Usuarios ven mensajes de sus tickets" ON public.mensajes_soporte
    FOR ALL TO authenticated USING (
        EXISTS (SELECT 1 FROM public.tickets_soporte WHERE id = ticket_id AND gimnasio_id = (SELECT gimnasio_id FROM public.perfiles WHERE id = auth.uid()))
    );

-- Grants
GRANT ALL ON public.pagos_saas TO authenticated;
GRANT ALL ON public.tickets_soporte TO authenticated;
GRANT ALL ON public.mensajes_soporte TO authenticated;
GRANT ALL ON public.pagos_saas TO service_role;
GRANT ALL ON public.tickets_soporte TO service_role;
GRANT ALL ON public.mensajes_soporte TO service_role;

COMMIT;
