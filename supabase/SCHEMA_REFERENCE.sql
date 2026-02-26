-- ============================================================
-- REFERENCIA DEL ESQUEMA DE BASE DE DATOS (Sincronizado)
-- Este archivo es para contexto del asistente y referencia local.
-- ============================================================

CREATE TABLE public.actividades (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  descripcion text,
  tipo text,
  url_imagen text,
  duracion_minutos integer DEFAULT 60,
  capacidad_maxima integer DEFAULT 20,
  esta_activa boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  color text DEFAULT '#3b82f6'::text,
  dificultad text, -- USER-DEFINED
  CONSTRAINT actividades_pkey PRIMARY KEY (id)
);

CREATE TABLE public.anuncios_globales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  contenido text NOT NULL,
  tipo text DEFAULT 'info'::text CHECK (tipo = ANY (ARRAY['info'::text, 'alerta'::text, 'novedad'::text, 'mantenimiento'::text])),
  destino text DEFAULT 'todos'::text CHECK (destino = ANY (ARRAY['todos'::text, 'admin_gym'::text, 'alumnos'::text, 'coaches'::text, 'especifico'::text])),
  creado_por uuid,
  activo boolean DEFAULT true,
  expires_at timestamp with time zone,
  creado_en timestamp with time zone DEFAULT timezone('utc'::text, now()),
  enviado_newsletter boolean DEFAULT false,
  fecha_envio_newsletter timestamp with time zone,
  CONSTRAINT anuncios_globales_pkey PRIMARY KEY (id),
  CONSTRAINT anuncios_globales_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);

CREATE TABLE public.asistencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  rol_asistencia text NOT NULL, -- USER-DEFINED
  entrada timestamp with time zone DEFAULT now(),
  salida timestamp with time zone,
  source text DEFAULT 'qr'::text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT asistencias_pkey PRIMARY KEY (id),
  CONSTRAINT asistencias_user_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);

CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tabla text NOT NULL,
  operacion text NOT NULL CHECK (operacion = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  registro_id uuid,
  usuario_id uuid,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  direccion_ip inet,
  agente_usuario text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);

CREATE TABLE public.auditoria_global (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  gimnasio_id uuid,
  accion text NOT NULL,
  entidad_tipo text,
  entidad_id uuid,
  detalles jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT auditoria_global_pkey PRIMARY KEY (id),
  CONSTRAINT auditoria_global_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id),
  CONSTRAINT auditoria_global_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id)
);

CREATE TABLE public.gamificacion_del_usuario (
  usuario_id uuid NOT NULL,
  puntos integer DEFAULT 0,
  racha_actual integer DEFAULT 0,
  racha_mas_larga integer DEFAULT 0,
  nivel integer DEFAULT 1,
  fecha_ultima_actividad date,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT gamificacion_del_usuario_pkey PRIMARY KEY (usuario_id),
  CONSTRAINT gamificacion_del_usuario_user_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.perfiles(id)
);

CREATE TABLE public.gimnasios (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nombre text NOT NULL,
  slug text NOT NULL UNIQUE,
  logo_url text,
  configuracion jsonb DEFAULT '{}'::jsonb,
  es_activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  color_primario text DEFAULT '#ef4444'::text,
  color_secundario text DEFAULT '#000000'::text,
  config_visual jsonb DEFAULT '{"dark_mode": true, "border_radius": "1rem"}'::jsonb,
  plan_id uuid,
  estado_pago_saas text DEFAULT 'active'::text,
  fecha_proximo_pago timestamp with time zone DEFAULT (now() + '1 mon'::interval),
  descuento_saas integer DEFAULT 0,
  config_landing jsonb DEFAULT '{"secciones": {"contacto": true, "nosotros": true, "actividades": true}, "hero_imagen": "...", "hero_titulo": "...", "hero_subtitulo": "...", "mostrar_tarifas": true, "carrusel_imagenes": [], "mostrar_ubicacion": true}'::jsonb,
  scoring_salud double precision DEFAULT 0,
  modulos_activos jsonb DEFAULT '{"rutinas_ia": true}'::jsonb,
  fase_onboarding text DEFAULT 'completado'::text,
  CONSTRAINT gimnasios_pkey PRIMARY KEY (id)
);

CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  correo text NOT NULL UNIQUE,
  nombre_completo text,
  url_avatar text,
  telefono text,
  rol text NOT NULL DEFAULT 'member'::text, -- USER-DEFINED rol
  genero text,
  estado_membresia text DEFAULT 'inactive'::text, -- USER-DEFINED
  fecha_inicio_membresia timestamp with time zone,
  fecha_fin_membresia timestamp with time zone,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  gimnasio_id uuid,
  sucursal_id uuid,
  nombre text,
  apellido text,
  dni text,
  direccion text,
  ciudad text,
  fecha_nacimiento date,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT perfiles_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id)
);

CREATE TABLE public.pagos (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  usuario_id uuid,
  monto numeric NOT NULL,
  moneda text DEFAULT 'ARS'::text,
  concepto text NOT NULL,
  proveedor_pago text,
  id_pago_proveedor text,
  aprobado_por uuid,
  aprobado_en timestamp with time zone,
  notas text,
  metadatos jsonb,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  metodo_pago text, -- USER-DEFINED
  estado text DEFAULT 'pendiente'::text, -- USER-DEFINED
  fecha_vencimiento timestamp with time zone,
  gimnasio_id uuid,
  CONSTRAINT pagos_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id)
);

CREATE TABLE public.pagos_saas (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  gimnasio_id uuid,
  monto numeric NOT NULL,
  monto_final numeric NOT NULL,
  descuento_aplicado integer DEFAULT 0,
  estado text DEFAULT 'completado'::text,
  metodo_pago text,
  fecha_pago timestamp with time zone DEFAULT now(),
  periodo_inicio date,
  periodo_fin date,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT pagos_saas_pkey PRIMARY KEY (id),
  CONSTRAINT pagos_saas_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id)
);

CREATE TABLE public.saas_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  mrr numeric DEFAULT 0,
  ingresos_totales_mes numeric DEFAULT 0,
  gyms_activos integer DEFAULT 0,
  gyms_suspendidos integer DEFAULT 0,
  nuevos_gyms_hoy integer DEFAULT 0,
  churn_gyms_mes integer DEFAULT 0,
  total_alumnos integer DEFAULT 0,
  alumnos_activos_hoy integer DEFAULT 0,
  videos_procesados_hoy integer DEFAULT 0,
  rutinas_ia_hoy integer DEFAULT 0,
  creado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT saas_metrics_pkey PRIMARY KEY (id)
);

CREATE TABLE public.sucursales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  gimnasio_id uuid,
  nombre text NOT NULL,
  direccion text,
  telefono text,
  configuracion jsonb DEFAULT '{}'::jsonb,
  creado_en timestamp with time zone DEFAULT now(),
  actualizado_en timestamp with time zone DEFAULT now(),
  CONSTRAINT sucursales_pkey PRIMARY KEY (id),
  CONSTRAINT sucursales_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id)
);

CREATE TABLE public.logs_acceso_remoto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  superadmin_id uuid,
  gimnasio_id uuid,
  motivo text,
  fecha timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT logs_acceso_remoto_pkey PRIMARY KEY (id),
  CONSTRAINT logs_acceso_remoto_gimnasio_id_fkey FOREIGN KEY (gimnasio_id) REFERENCES public.gimnasios(id),
  CONSTRAINT logs_acceso_remoto_superadmin_id_fkey FOREIGN KEY (superadmin_id) REFERENCES public.perfiles(id)
);

-- Nota: Este archivo contiene solo un extracto simplificado para referencia de tipos y nombres.
