-- ============================================================
-- MIGRACIÓN: Gamificación y Notificaciones (Versión Española)
-- Fecha: 2026-02-23
-- Descripción: Sincroniza la DB con los nuevos estados de desafíos
--              y asegura que todas las columnas clave estén en español.
-- ============================================================

-- 1. Actualizar estados en la tabla participantes_desafio
ALTER TABLE participantes_desafio DROP CONSTRAINT IF EXISTS participantes_desafio_estado_check;
ALTER TABLE participantes_desafio ADD CONSTRAINT participantes_desafio_estado_check 
CHECK (estado IN ('enrolled', 'completed', 'disqualified', 'winner', 'pending_validation'));

-- 2. Asegurar que las columnas de gamificación estén en español en gamificacion_del_usuario
DO $$
BEGIN
    -- Renombrar 'points' a 'puntos' si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gamificacion_del_usuario' AND column_name = 'points') THEN
        ALTER TABLE gamificacion_del_usuario RENAME COLUMN points TO puntos;
    END IF;

    -- Renombrar 'level' a 'nivel' si existe
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gamificacion_del_usuario' AND column_name = 'level') THEN
        ALTER TABLE gamificacion_del_usuario RENAME COLUMN level TO nivel;
    END IF;
END $$;

-- 3. Función para Incrementar Puntos (RPC) - Compatible con nombres en español
CREATE OR REPLACE FUNCTION incrementar_puntos(usuario_id_param UUID, puntos_param INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Intentamos actualizar los puntos en la tabla de gamificación
    UPDATE gamificacion_del_usuario 
    SET puntos = COALESCE(puntos, 0) + puntos_param
    WHERE usuario_id = usuario_id_param;

    -- Si el usuario no tiene registro de gamificación aún, lo creamos
    IF NOT FOUND THEN
        INSERT INTO gamificacion_del_usuario (usuario_id, puntos, nivel, racha_actual)
        VALUES (usuario_id_param, puntos_param, 1, 0);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Tabla de Historial de Notificaciones (Español)
CREATE TABLE IF NOT EXISTS historial_notificaciones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'sistema', 'logro', 'pago', 'desafio', etc.
    titulo TEXT NOT NULL,
    cuerpo TEXT NOT NULL,
    datos JSONB DEFAULT '{}'::jsonb,
    leida BOOLEAN DEFAULT false,
    enviada BOOLEAN DEFAULT false,
    enviada_en TIMESTAMP WITH TIME ZONE,
    error TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Políticas de Seguridad (RLS) para Notificaciones
ALTER TABLE historial_notificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver sus propias notificaciones" ON historial_notificaciones;
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
ON historial_notificaciones FOR SELECT
USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Sistema puede insertar notificaciones" ON historial_notificaciones;
CREATE POLICY "Sistema puede insertar notificaciones"
ON historial_notificaciones FOR INSERT
WITH CHECK (true);
