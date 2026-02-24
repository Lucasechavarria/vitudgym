-- 📊 TABLA DE MÉTRICAS SAAS (Snapshots diarios para Founders)
CREATE TABLE IF NOT EXISTS public.saas_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Ingresos
    mrr NUMERIC(12,2) DEFAULT 0, -- Monthly Recurring Revenue
    ingresos_totales_mes NUMERIC(12,2) DEFAULT 0,
    
    -- Clientes
    gyms_activos INTEGER DEFAULT 0,
    gyms_suspendidos INTEGER DEFAULT 0,
    nuevos_gyms_hoy INTEGER DEFAULT 0,
    churn_gyms_mes INTEGER DEFAULT 0,
    
    -- Usuarios Finales (Alumnos)
    total_alumnos INTEGER DEFAULT 0,
    alumnos_activos_hoy INTEGER DEFAULT 0,
    
    -- Uso Técnico
    videos_procesados_hoy INTEGER DEFAULT 0,
    rutinas_ia_hoy INTEGER DEFAULT 0,
    
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fecha)
);

-- 💳 HISTORIAL DE PAGOS SAAS (Para trackear cada transacción)
CREATE TABLE IF NOT EXISTS public.saas_pagos_historial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gimnasio_id UUID REFERENCES public.gimnasios(id),
    monto NUMERIC(10,2) NOT NULL,
    moneda TEXT DEFAULT 'USD',
    tipo_pago TEXT DEFAULT 'suscripcion', -- suscripcion, overage, ajuste
    metodo_pago TEXT, -- stripe, transferencia, manual
    referencia_externa TEXT, -- ID de Stripe Invoice
    estado TEXT DEFAULT 'completado', -- completado, fallido, reembolsado
    fecha_pago TIMESTAMPTZ DEFAULT NOW(),
    periodo_inicio DATE,
    periodo_fin DATE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 📈 VISTA PARA CÁLCULO DE MRR REAL
CREATE OR REPLACE VIEW public.saas_mrr_actual AS
SELECT 
    SUM(p.precio_mensual * (1 - (COALESCE(g.descuento_saas, 0) / 100.0))) as mrr_estimado,
    COUNT(g.id) as total_gyms_pagando
FROM public.gimnasios g
JOIN public.planes_suscripcion p ON g.plan_id = p.id
WHERE g.estado_pago_saas = 'active';

-- 🛡️ RLS PARA MÉTRICAS (Solo Superadmin)
ALTER TABLE public.saas_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins can see metrics" ON public.saas_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid() AND perfiles.rol = 'superadmin'
        )
    );

ALTER TABLE public.saas_pagos_historial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmins can see all payments" ON public.saas_pagos_historial
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.perfiles
            WHERE perfiles.id = auth.uid() AND perfiles.rol = 'superadmin'
        )
    );
