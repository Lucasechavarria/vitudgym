-- Semilla (Seed) para Virtud Gym SaaS
-- Este archivo inserta datos iniciales para desarrollo y pruebas

-- Asegurar que las columnas industriales existan (Idempotente)
DO $$ 
BEGIN 
    -- Columna para Salud del Gimnasio
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gimnasios' AND column_name='scoring_salud') THEN
        ALTER TABLE public.gimnasios ADD COLUMN scoring_salud double precision DEFAULT 0;
    END IF;

    -- Columna para Módulos Activos (IA, Pagos, etc)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gimnasios' AND column_name='modulos_activos') THEN
        ALTER TABLE public.gimnasios ADD COLUMN modulos_activos jsonb DEFAULT '{"rutinas_ia": true}'::jsonb;
    END IF;

    -- Columna para Fase de Onboarding
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gimnasios' AND column_name='fase_onboarding') THEN
        ALTER TABLE public.gimnasios ADD COLUMN fase_onboarding text DEFAULT 'completado';
    END IF;
END $$;

-- 1. Planes de Suscripción (SaaS)
INSERT INTO public.planes_suscripcion (id, nombre, precio_mensual, limite_sucursales, limite_usuarios, caracteristicas)
VALUES 
    ('01000000-0000-0000-0000-000000000001', 'Plan Básico', 49.99, 1, 100, '["rutinas_ia", "asistencias_qr"]'),
    ('02000000-0000-0000-0000-000000000002', 'Plan Profesional', 99.99, 3, 500, '["rutinas_ia", "asistencias_qr", "gamificacion", "nutricion_ia"]'),
    ('03000000-0000-0000-0000-000000000003', 'Plan Enterprise', 199.99, 10, 2000, '["rutinas_ia", "asistencias_qr", "gamificacion", "nutricion_ia", "pagos_online", "api_access"]')
ON CONFLICT (id) DO NOTHING;

-- 2. Gimnasios de Prueba
INSERT INTO public.gimnasios (id, nombre, slug, plan_id, estado_pago_saas, scoring_salud, modulos_activos)
VALUES 
    ('91000000-0000-0000-0000-000000000001', 'Virtud Training Center', 'virtud-tc', '02000000-0000-0000-0000-000000000002', 'active', 95.5, '{"rutinas_ia": true, "gamificacion": true, "nutricion_ia": true}'),
    ('92000000-0000-0000-0000-000000000002', 'Iron Forge Gym', 'iron-forge', '01000000-0000-0000-0000-000000000001', 'pending', 72.0, '{"rutinas_ia": true, "gamificacion": false}'),
    ('93000000-0000-0000-0000-000000000003', 'Olympus Fitness', 'olympus', '03000000-0000-0000-0000-000000000003', 'active', 88.0, '{"rutinas_ia": true, "gamificacion": true, "nutricion_ia": true, "pagos_online": true}')
ON CONFLICT (id) DO NOTHING;

-- 3. Métricas SaaS Iniciales
INSERT INTO public.saas_metrics (fecha, mrr, gyms_activos, churn_gyms_mes, total_alumnos, alumnos_activos_hoy, ingresos_totales_mes, rutinas_ia_hoy, videos_procesados_hoy)
VALUES 
    (CURRENT_DATE, 349.97, 3, 0.0, 1250, 450, 12000.50, 85, 42)
ON CONFLICT (fecha) DO UPDATE 
SET mrr = EXCLUDED.mrr,
    gyms_activos = EXCLUDED.gyms_activos,
    total_alumnos = EXCLUDED.total_alumnos;

-- 4. Anuncios Globales de Ejemplo
INSERT INTO public.anuncios_globales (id, titulo, contenido, tipo, destino, activo)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', 'Mantenimiento Programado', 'El sistema estará fuera de servicio el domingo de 2:00 AM a 4:00 AM por actualización de servidores.', 'mantenimiento', 'todos', true),
    ('a2000000-0000-0000-0000-000000000002', 'Nueva Funcionalidad: Nutrición IA', '¡Ya está disponible el nuevo módulo de nutrición basado en visión artificial!', 'novedad', 'admin_gym', true)
ON CONFLICT (id) DO NOTHING;
