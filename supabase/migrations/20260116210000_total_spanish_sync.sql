-- ==============================================================================
-- MIGRACIÃ“N DE SINCRONIZACIÃ“N TOTAL "ESPAÃ‘OL SEGURO" (Schema v2)
-- ==============================================================================
-- Esta migraciÃ³n renombra todas las columnas sistÃ©micas y de negocio a espaÃ±ol
-- e introduce tipos ENUM para mejorar la integridad de los datos.
-- ==============================================================================

-- ==============================================================================

-- 0. DESACTIVAR TRIGGERS (Para evitar errores durante renombres/updates)
SET session_replication_role = 'replica';

-- 1. HABILITAR EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. DEFINIR TIPOS ENUM (Si no existen)
DO $$ BEGIN
    CREATE TYPE nivel_dificultad AS ENUM ('principiante', 'intermedio', 'avanzado', 'todos_los_niveles');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_conversacion AS ENUM ('privada', 'soporte', 'grupo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE categoria_equipamiento AS ENUM ('cardio', 'fuerza', 'pesas_libres', 'maquinas', 'funcional', 'accesorios', 'otro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_condicion AS ENUM ('excelente', 'buena', 'regular', 'necesita_reparacion');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_objetivo_principal AS ENUM ('ganancia_muscular', 'perdida_de_peso', 'fuerza', 'resistencia', 'flexibilidad', 'fitness_general', 'deporte_especifico', 'rehabilitacion');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tiempo_entrenamiento_preferido AS ENUM ('manana', 'tarde', 'noche', 'flexible');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE tipo_metodo_pago AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'mercadopago', 'manual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_pago AS ENUM ('pendiente', 'aprobado', 'rechazado', 'reembolsado');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_clase AS ENUM ('reservada', 'asistida', 'cancelada', 'ausente');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_rutina AS ENUM ('borrador', 'pendiente_aprobacion', 'aprobada', 'activa', 'completada', 'archivada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE estado_sesion AS ENUM ('activa', 'pausada', 'completada', 'cancelada');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. ELIMINAR VISTAS DEPENDIENTES (Se re-crearÃ¡n al final)
DROP VIEW IF EXISTS user_bookings_detailed CASCADE;
DROP VIEW IF EXISTS active_memberships CASCADE;
DROP VIEW IF EXISTS classes_with_availability CASCADE;

-- 4. RENOMBRADO QUIRÃšRGICO DE COLUMNAS
-- Nota: Usamos ALTER TABLE RENAME COLUMN para preservar datos.

-- PERFILES
ALTER TABLE perfiles 
  RENAME COLUMN full_name TO nombre_completo;
ALTER TABLE perfiles 
  RENAME COLUMN avatar_url TO url_avatar;
ALTER TABLE perfiles 
  RENAME COLUMN phone TO telefono;
ALTER TABLE perfiles 
  RENAME COLUMN role TO rol;
ALTER TABLE perfiles 
  RENAME COLUMN membership_status TO estado_membresia;
ALTER TABLE perfiles 
  RENAME COLUMN membership_start_date TO fecha_inicio_membresia;
ALTER TABLE perfiles 
  RENAME COLUMN membership_end_date TO fecha_fin_membresia;
ALTER TABLE perfiles 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE perfiles 
  RENAME COLUMN updated_at TO actualizado_en;
ALTER TABLE perfiles 
  RENAME COLUMN coach_observations TO observaciones_entrenador;
ALTER TABLE perfiles 
  RENAME COLUMN additional_restrictions TO restricciones_adicionales;
ALTER TABLE perfiles 
  RENAME COLUMN recommended_modifications TO modificaciones_recomendadas;
ALTER TABLE perfiles 
  RENAME COLUMN onboarding_completed TO onboarding_completado;
ALTER TABLE perfiles 
  RENAME COLUMN onboarding_completed_at TO onboarding_completado_en;
ALTER TABLE perfiles 
  RENAME COLUMN birth_date TO fecha_nacimiento;
ALTER TABLE perfiles 
  RENAME COLUMN emergency_contact TO contacto_emergencia;
ALTER TABLE perfiles 
  RENAME COLUMN medical_info TO informacion_medica;
ALTER TABLE perfiles 
  RENAME COLUMN waiver_accepted TO exencion_aceptada;
ALTER TABLE perfiles 
  RENAME COLUMN waiver_date TO fecha_exencion;
ALTER TABLE perfiles 
  RENAME COLUMN first_name TO nombre;
ALTER TABLE perfiles 
  RENAME COLUMN last_name TO apellido;
ALTER TABLE perfiles 
  RENAME COLUMN address TO direccion;
ALTER TABLE perfiles 
  RENAME COLUMN city TO ciudad;

-- ACTIVIDADES
ALTER TABLE actividades 
  RENAME COLUMN name TO nombre;
ALTER TABLE actividades 
  RENAME COLUMN type TO tipo;
ALTER TABLE actividades 
  RENAME COLUMN description TO descripcion;
ALTER TABLE actividades 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE actividades 
  RENAME COLUMN updated_at TO actualizado_en;
ALTER TABLE actividades 
  RENAME COLUMN is_active TO esta_activa;
ALTER TABLE actividades 
  RENAME COLUMN duration_minutes TO duracion_minutos;
ALTER TABLE actividades 
  RENAME COLUMN max_capacity TO capacidad_maxima;
ALTER TABLE actividades 
  RENAME COLUMN image_url TO url_imagen;
-- Cambiar tipo de dificultad a ENUM
-- Cambiar tipo de dificultad a ENUM (Estrategia ADD-UPDATE-DROP)
  ALTER TABLE actividades ADD COLUMN dificultad_new nivel_dificultad;
  UPDATE actividades SET dificultad_new = (
    CASE 
      WHEN difficulty::text = 'beginner' THEN 'principiante'::nivel_dificultad
      WHEN difficulty::text = 'intermediate' THEN 'intermedio'::nivel_dificultad
      WHEN difficulty::text = 'advanced' THEN 'avanzado'::nivel_dificultad
      ELSE 'todos_los_niveles'::nivel_dificultad
    END
  );
  ALTER TABLE actividades DROP COLUMN difficulty;
  ALTER TABLE actividades RENAME COLUMN dificultad_new TO dificultad;

-- ASISTENCIAS
ALTER TABLE asistencias 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE asistencias 
  RENAME COLUMN role_at_time TO rol_en_el_momento;
ALTER TABLE asistencias 
  RENAME COLUMN check_in TO entrada;
ALTER TABLE asistencias 
  RENAME COLUMN check_out TO salida;
ALTER TABLE asistencias 
  RENAME COLUMN created_at TO creado_en;

-- CONVERSACIONES
ALTER TABLE conversaciones 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE conversaciones 
  RENAME COLUMN metadata TO metadatos;
-- Cambiar tipo a ENUM
-- Cambiar tipo a ENUM (Estrategia ADD-UPDATE-DROP)
  ALTER TABLE conversaciones ADD COLUMN tipo_new tipo_conversacion;
  UPDATE conversaciones SET tipo_new = (
    CASE
      WHEN type::text = 'private' THEN 'privada'::tipo_conversacion
      WHEN type::text = 'support' THEN 'soporte'::tipo_conversacion
      WHEN type::text = 'group' THEN 'grupo'::tipo_conversacion
      ELSE 'privada'::tipo_conversacion
    END
  );
  ALTER TABLE conversaciones DROP COLUMN type;
  ALTER TABLE conversaciones RENAME COLUMN tipo_new TO tipo;

-- PAGOS
ALTER TABLE pagos 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE pagos 
  RENAME COLUMN amount TO monto;
ALTER TABLE pagos 
  RENAME COLUMN currency TO moneda;
ALTER TABLE pagos 
  RENAME COLUMN payment_method TO metodo_pago_legacy; -- Temporal
ALTER TABLE pagos 
  ADD COLUMN metodo_pago tipo_metodo_pago;
UPDATE pagos SET metodo_pago = (
    CASE 
      WHEN metodo_pago_legacy::text = 'cash' THEN 'efectivo'::tipo_metodo_pago
      WHEN metodo_pago_legacy::text = 'card' THEN 'tarjeta'::tipo_metodo_pago
      WHEN metodo_pago_legacy::text = 'transfer' THEN 'transferencia'::tipo_metodo_pago
      ELSE 'manual'::tipo_metodo_pago
    END
);
ALTER TABLE pagos DROP COLUMN metodo_pago_legacy;
ALTER TABLE pagos 
  RENAME COLUMN status TO estado_legacy;
ALTER TABLE pagos 
  ADD COLUMN estado estado_pago DEFAULT 'pendiente';
UPDATE pagos SET estado = (
    CASE 
      WHEN estado_legacy::text = 'approved' THEN 'aprobado'::estado_pago
      WHEN estado_legacy::text = 'pending' THEN 'pendiente'::estado_pago
      WHEN estado_legacy::text = 'rejected' THEN 'rechazado'::estado_pago
      WHEN estado_legacy::text = 'refunded' THEN 'reembolsado'::estado_pago
      ELSE 'pendiente'::estado_pago
    END
);
ALTER TABLE pagos DROP COLUMN estado_legacy;
ALTER TABLE pagos 
  RENAME COLUMN approved_by TO aprobado_por;
ALTER TABLE pagos 
  RENAME COLUMN approved_at TO aprobado_en;
ALTER TABLE pagos 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE pagos 
  RENAME COLUMN updated_at TO actualizado_en;

-- RUTINAS
ALTER TABLE rutinas 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE rutinas 
  RENAME COLUMN coach_id TO entrenador_id;
ALTER TABLE rutinas 
  RENAME COLUMN duration_weeks TO duracion_semanas;
ALTER TABLE rutinas 
  RENAME COLUMN generated_by_ai TO generada_por_ia;
ALTER TABLE rutinas 
  RENAME COLUMN ai_prompt TO prompt_ia;
ALTER TABLE rutinas 
  RENAME COLUMN is_active TO esta_activa;
ALTER TABLE rutinas 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE rutinas 
  RENAME COLUMN updated_at TO actualizado_en;
ALTER TABLE rutinas 
  RENAME COLUMN nutrition_plan_id TO plan_nutricional_id;
ALTER TABLE rutinas 
  RENAME COLUMN user_goal_id TO objetivo_usuario_id;
ALTER TABLE rutinas 
  RENAME COLUMN status TO estado_legacy;
ALTER TABLE rutinas 
  ADD COLUMN estado estado_rutina DEFAULT 'borrador';
UPDATE rutinas SET estado = (
    CASE 
      WHEN estado_legacy::text = 'active' THEN 'activa'::estado_rutina
      WHEN estado_legacy::text = 'pending_approval' THEN 'pendiente_aprobacion'::estado_rutina
      WHEN estado_legacy::text = 'completed' THEN 'completada'::estado_rutina
      ELSE 'borrador'::estado_rutina
    END
);
ALTER TABLE rutinas DROP COLUMN estado_legacy;
ALTER TABLE rutinas 
  RENAME COLUMN approved_by TO aprobado_por;
ALTER TABLE rutinas 
  RENAME COLUMN approved_at TO aprobado_en;
ALTER TABLE rutinas 
  RENAME COLUMN medical_considerations TO consideraciones_medicas;
ALTER TABLE rutinas 
  RENAME COLUMN equipment_used TO equipamiento_usado;
ALTER TABLE rutinas 
  RENAME COLUMN view_count TO contador_vistas;
ALTER TABLE rutinas 
  RENAME COLUMN last_viewed_at TO ultima_vista_en;

-- EJERCICIOS
ALTER TABLE ejercicios 
  RENAME COLUMN routine_id TO rutina_id;
ALTER TABLE ejercicios 
  RENAME COLUMN muscle_group TO grupo_muscular;
ALTER TABLE ejercicios 
  RENAME COLUMN equipment TO equipamiento;
ALTER TABLE ejercicios 
  RENAME COLUMN rest_seconds TO descanso_segundos;
ALTER TABLE ejercicios 
  RENAME COLUMN day_number TO dia_numero;
ALTER TABLE ejercicios 
  RENAME COLUMN order_in_day TO orden_en_dia;
ALTER TABLE ejercicios 
  RENAME COLUMN video_url TO url_video;
ALTER TABLE ejercicios 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE ejercicios 
  RENAME COLUMN updated_at TO actualizado_en;

-- HORARIOS DE CLASE
ALTER TABLE IF EXISTS class_schedules RENAME TO horarios_de_clase;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN activity_id TO actividad_id;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN coach_id TO entrenador_id;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN day_of_week TO dia_de_la_semana;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN start_time TO hora_inicio;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN end_time TO hora_fin;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN is_active TO esta_activa;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN teacher_text TO texto_profesor;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE horarios_de_clase 
  RENAME COLUMN updated_at TO actualizado_en;

-- RESERVAS DE CLASE
ALTER TABLE IF EXISTS class_bookings RENAME TO reservas_de_clase;
ALTER TABLE reservas_de_clase 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE reservas_de_clase 
  RENAME COLUMN class_schedule_id TO horario_clase_id;
ALTER TABLE reservas_de_clase 
  RENAME COLUMN status TO estado_legacy;
ALTER TABLE reservas_de_clase 
  ADD COLUMN estado estado_clase DEFAULT 'reservada';
UPDATE reservas_de_clase SET estado = (
    CASE 
      WHEN estado_legacy::text = 'booked' THEN 'reservada'::estado_clase
      WHEN estado_legacy::text = 'attended' THEN 'asistida'::estado_clase
      WHEN estado_legacy::text = 'cancelled' THEN 'cancelada'::estado_clase
      ELSE 'ausente'::estado_clase
    END
);
ALTER TABLE reservas_de_clase DROP COLUMN estado_legacy;
ALTER TABLE reservas_de_clase 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE reservas_de_clase 
  RENAME COLUMN updated_at TO actualizado_en;

-- SESIONES DE ENTRENAMIENTO (workout_sessions)
ALTER TABLE IF EXISTS workout_sessions RENAME TO sesiones_de_entrenamiento;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN user_id TO usuario_id;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN routine_id TO rutina_id;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN start_time TO hora_inicio;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN end_time TO hora_fin;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN status TO estado;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN total_points TO puntos_totales;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN mood_rating TO puntuacion_animo;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN notes TO notas;
ALTER TABLE sesiones_de_entrenamiento RENAME COLUMN created_at TO creado_en;

-- REGISTROS DE EJERCICIO (exercise_performance_logs)
ALTER TABLE IF EXISTS exercise_performance_logs RENAME TO registros_de_ejercicio;
ALTER TABLE IF EXISTS exercise_logs RENAME TO registros_de_ejercicio; -- Por si acaso existía la otra

ALTER TABLE registros_de_ejercicio RENAME COLUMN session_id TO sesion_id;
ALTER TABLE registros_de_ejercicio RENAME COLUMN exercise_id TO ejercicio_id;
ALTER TABLE registros_de_ejercicio RENAME COLUMN actual_sets TO series_reales;
ALTER TABLE registros_de_ejercicio RENAME COLUMN actual_reps TO repeticiones_reales;
ALTER TABLE registros_de_ejercicio RENAME COLUMN actual_weight TO peso_real;
-- rest_time_seconds (no actual_rest_seconds)
ALTER TABLE registros_de_ejercicio RENAME COLUMN rest_time_seconds TO segundos_descanso_real;
ALTER TABLE registros_de_ejercicio RENAME COLUMN is_completed TO fue_completado;
ALTER TABLE registros_de_ejercicio RENAME COLUMN difficulty_rating TO puntuacion_dificultad;
ALTER TABLE registros_de_ejercicio RENAME COLUMN created_at TO creado_en;

-- MEDICIONES
ALTER TABLE mediciones 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE mediciones 
  RENAME COLUMN body_fat TO grasa_corporal;
ALTER TABLE mediciones 
  RENAME COLUMN muscle_mass TO masa_muscular;
ALTER TABLE mediciones 
  RENAME COLUMN recorded_at TO registrado_en;
ALTER TABLE mediciones 
  RENAME COLUMN created_by TO creado_por;
ALTER TABLE mediciones 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE mediciones 
  RENAME COLUMN updated_at TO actualizado_en;

-- MENSAJES
ALTER TABLE mensajes 
  RENAME COLUMN sender_id TO remitente_id;
ALTER TABLE mensajes 
  RENAME COLUMN receiver_id TO receptor_id;
ALTER TABLE mensajes 
  RENAME COLUMN content TO contenido;
ALTER TABLE mensajes 
  RENAME COLUMN is_read TO esta_leido;
ALTER TABLE mensajes 
  RENAME COLUMN read_at TO leido_en;
ALTER TABLE mensajes 
  RENAME COLUMN conversation_id TO conversacion_id;
ALTER TABLE mensajes 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE mensajes 
  RENAME COLUMN updated_at TO actualizado_en;

-- EQUIPAMIENTO
ALTER TABLE equipamiento 
  RENAME COLUMN is_available TO esta_disponible;
-- Cambiar categorias a ENUM
-- Cambiar categoria a ENUM (Estrategia ADD-UPDATE-DROP)
  ALTER TABLE equipamiento ADD COLUMN categoria_new categoria_equipamiento;
  UPDATE equipamiento SET categoria_new = (
    CASE 
      WHEN category::text = 'cardio' THEN 'cardio'::categoria_equipamiento
      WHEN category::text = 'strength' THEN 'fuerza'::categoria_equipamiento
      WHEN category::text = 'free_weights' THEN 'pesas_libres'::categoria_equipamiento
      WHEN category::text = 'machines' THEN 'maquinas'::categoria_equipamiento
      ELSE 'otro'::categoria_equipamiento
    END
  );
  ALTER TABLE equipamiento DROP COLUMN category;
  ALTER TABLE equipamiento RENAME COLUMN categoria_new TO categoria;

-- Cambiar condicion a ENUM (Estrategia ADD-UPDATE-DROP)
  ALTER TABLE equipamiento ADD COLUMN condicion_new estado_condicion;
  UPDATE equipamiento SET condicion_new = (
    CASE 
      WHEN condition::text = 'excellent' THEN 'excelente'::estado_condicion
      WHEN condition::text = 'good' THEN 'buena'::estado_condicion
      WHEN condition::text = 'fair' THEN 'regular'::estado_condicion
      ELSE 'necesita_reparacion'::estado_condicion
    END
  );
  ALTER TABLE equipamiento DROP COLUMN condition;
  ALTER TABLE equipamiento RENAME COLUMN condicion_new TO condicion;
ALTER TABLE equipamiento 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE equipamiento 
  RENAME COLUMN updated_at TO actualizado_en;

-- OBJETIVOS DEL USUARIO
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN target_weight TO peso_objetivo;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN primary_goal TO objetivo_principal_legacy;
ALTER TABLE objetivos_del_usuario 
  ADD COLUMN objetivo_principal tipo_objetivo_principal NOT NULL DEFAULT 'fitness_general';
UPDATE objetivos_del_usuario SET objetivo_principal = (
    CASE 
      WHEN objetivo_principal_legacy::text = 'lose_weight' THEN 'perdida_de_peso'::tipo_objetivo_principal
      WHEN objetivo_principal_legacy::text = 'gain_muscle' THEN 'ganancia_muscular'::tipo_objetivo_principal
      WHEN objetivo_principal_legacy::text = 'improve_endurance' THEN 'resistencia'::tipo_objetivo_principal
      ELSE 'fitness_general'::tipo_objetivo_principal
    END
);
ALTER TABLE objetivos_del_usuario DROP COLUMN objetivo_principal_legacy;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN secondary_goals TO objetivos_secundarios;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN training_frequency_per_week TO frecuencia_entrenamiento_por_semana;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN preferred_training_time TO tiempo_entrenamiento_preferido_legacy;
ALTER TABLE objetivos_del_usuario 
  ADD COLUMN tiempo_entrenamiento_preferido tiempo_entrenamiento_preferido;
UPDATE objetivos_del_usuario SET tiempo_entrenamiento_preferido = (
    CASE 
      WHEN tiempo_entrenamiento_preferido_legacy::text = 'morning' THEN 'manana'::tiempo_entrenamiento_preferido
      WHEN tiempo_entrenamiento_preferido_legacy::text = 'afternoon' THEN 'tarde'::tiempo_entrenamiento_preferido
      WHEN tiempo_entrenamiento_preferido_legacy::text = 'night' THEN 'noche'::tiempo_entrenamiento_preferido
      ELSE 'flexible'::tiempo_entrenamiento_preferido
    END
);
ALTER TABLE objetivos_del_usuario DROP COLUMN tiempo_entrenamiento_preferido_legacy;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN available_days TO dias_disponibles;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN time_per_session_minutes TO tiempo_por_sesion_minutos;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN equipment_access TO acceso_a_equipamiento;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN coach_notes TO notas_entrenador;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN is_active TO esta_activo;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE objetivos_del_usuario 
  RENAME COLUMN updated_at TO actualizado_en;

-- PLANES NUTRICIONALES
ALTER TABLE planes_nutricionales 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN coach_id TO entrenador_id;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN daily_calories TO calorias_diarias;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN protein_grams TO gramos_proteina;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN carbs_grams TO gramos_carbohidratos;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN fats_grams TO gramos_grasas;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN water_liters TO litros_agua;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN general_guidelines TO pautas_generales;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN is_active TO esta_activo;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE planes_nutricionales 
  RENAME COLUMN updated_at TO actualizado_en;

-- GAMIFICACION DEL USUARIO
ALTER TABLE IF EXISTS user_gamification RENAME TO gamificacion_del_usuario;
-- Garantizar que la tabla existe (con esquema legacy para permitir migración)
CREATE TABLE IF NOT EXISTS gamificacion_del_usuario (
    user_id UUID PRIMARY KEY REFERENCES public.perfiles(id),
    points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN current_streak TO racha_actual;
ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN longest_streak TO racha_mas_larga;
ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN last_activity_date TO fecha_ultima_actividad;
ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN created_at TO creado_en;
ALTER TABLE gamificacion_del_usuario 
  RENAME COLUMN updated_at TO actualizado_en;

-- LOGROS DEL USUARIO (user_achievements)
ALTER TABLE IF EXISTS user_achievements RENAME TO logros_del_usuario;

-- CATALOGO DE LOGROS (achievements)
ALTER TABLE IF EXISTS achievements RENAME TO logros;
ALTER TABLE logros RENAME COLUMN name TO nombre;
ALTER TABLE logros RENAME COLUMN description TO descripcion;
ALTER TABLE logros RENAME COLUMN icon TO icono;
ALTER TABLE logros RENAME COLUMN points_reward TO puntos_recompensa;
ALTER TABLE logros RENAME COLUMN category TO categoria;
ALTER TABLE logros RENAME COLUMN condition_type TO tipo_condicion;
ALTER TABLE logros RENAME COLUMN condition_value TO valor_condicion;
ALTER TABLE logros RENAME COLUMN created_at TO creado_en;

-- Garantizar tabla logros_del_usuario (schema legacy)
CREATE TABLE IF NOT EXISTS logros_del_usuario (
    user_id UUID REFERENCES public.perfiles(id),
    achievement_id UUID, 
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

ALTER TABLE logros_del_usuario 
  RENAME COLUMN user_id TO usuario_id;
ALTER TABLE logros_del_usuario 
  RENAME COLUMN unlocked_at TO desbloqueado_en;

-- HISTORIAL CAMBIOS PERFIL
ALTER TABLE IF EXISTS profile_change_history RENAME TO historial_cambios_perfil;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN profile_id TO perfil_id;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN changed_by TO cambiado_por;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN field_changed TO campo_cambiado;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN old_value TO valor_anterior;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN new_value TO valor_nuevo;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN reason TO razon;
ALTER TABLE historial_cambios_perfil 
  RENAME COLUMN created_at TO creado_en;

-- 5. RE-CREACIÃ“N DE VISTAS (Adaptadas al nuevo schema)

CREATE OR REPLACE VIEW public.classes_with_availability AS
SELECT 
    c.*,
    a.nombre as nombre_actividad,
    a.tipo as tipo_actividad,
    a.duracion_minutos,
    a.url_imagen as imagen_actividad,
    p.nombre_completo as nombre_entrenador,
    COALESCE(a.capacidad_maxima, 20) as capacidad_maxima,
    (SELECT count(*)::int FROM reservas_de_clase r WHERE r.horario_clase_id = c.id AND r.estado::text = 'reservada') as capacidad_actual,
    (COALESCE(a.capacidad_maxima, 20) - (SELECT count(*)::int FROM reservas_de_clase r WHERE r.horario_clase_id = c.id AND r.estado::text = 'reservada')) as cupos_disponibles,
    CASE 
        WHEN (SELECT count(*)::int FROM reservas_de_clase r WHERE r.horario_clase_id = c.id AND r.estado::text = 'reservada') >= COALESCE(a.capacidad_maxima, 20) THEN 'lleno'
        WHEN (SELECT count(*)::int FROM reservas_de_clase r WHERE r.horario_clase_id = c.id AND r.estado::text = 'reservada') >= (COALESCE(a.capacidad_maxima, 20) * 0.8) THEN 'casi_lleno'
        ELSE 'disponible'
    END as estado_disponibilidad
FROM horarios_de_clase c
LEFT JOIN actividades a ON c.actividad_id = a.id
LEFT JOIN perfiles p ON c.entrenador_id = p.id
WHERE c.esta_activa = true;

CREATE OR REPLACE VIEW public.user_bookings_detailed AS
SELECT 
    b.*,
    c.dia_de_la_semana,
    c.hora_inicio,
    c.hora_fin,
    a.nombre as nombre_actividad,
    a.tipo as tipo_actividad,
    a.url_imagen as imagen_actividad,
    p.nombre_completo as nombre_entrenador
FROM reservas_de_clase b
JOIN horarios_de_clase c ON b.horario_clase_id = c.id
JOIN actividades a ON c.actividad_id = a.id
LEFT JOIN perfiles p ON c.entrenador_id = p.id;

CREATE OR REPLACE VIEW public.active_memberships AS
SELECT 
    id,
    email,
    nombre_completo,
    estado_membresia,
    fecha_inicio_membresia,
    fecha_fin_membresia,
    CASE 
        WHEN fecha_fin_membresia < NOW() THEN 'vencida'
        WHEN fecha_fin_membresia < NOW() + INTERVAL '7 days' THEN 'proxima_a_vencer'
        ELSE 'activa'
    END as alerta_membresia
FROM perfiles
WHERE estado_membresia::text = 'active';

-- 6. ACTUALIZACIÃ“N DE FUNCIONES DE SEGURIDAD
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles
    WHERE id = auth.uid()
    AND rol::text = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_coach()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles
    WHERE id = auth.uid()
    AND rol::text IN ('coach', 'admin')
  );
$$;

-- 7. RESET DE PERMISOS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8. ACTUALIZAR FUNCIÓN DE TIMESTAMP (Adaptada a español)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. REACTIVAR TRIGGERS
SET session_replication_role = 'origin';

