-- ⚙️ VIRTUD GYM: AUTOMATIZACIÓN DE GAMIFICACIÓN (CORREGIDO)
-- Este script automatiza el otorgamiento de XP y logros basados en eventos del sistema.

-- 1. XP POR EVOLUCIÓN FÍSICA (MEDICIONES)
-- Otorga 50 XP cada vez que un alumno registra sus medidas (máx 1 vez por semana)

CREATE OR REPLACE FUNCTION handle_new_measurement_xp()
RETURNS trigger AS $$
DECLARE
    last_xp_date DATE;
BEGIN
    -- Verificar última vez que ganó XP por mediciones
    SELECT last_activity_date INTO last_xp_date
    FROM user_gamification
    WHERE user_id = NEW.user_id;

    -- Si no ha registrado puntos esta semana (o nunca)
    IF last_xp_date IS NULL OR (NEW.recorded_at::DATE - last_xp_date) >= 7 THEN
        UPDATE user_gamification
        SET 
            points = points + 50,
            last_activity_date = NEW.recorded_at::DATE,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        -- Opcional: Log de XP (asegúrate de que existe la tabla xp_logs)
        INSERT INTO xp_logs (user_id, amount, reason)
        VALUES (NEW.user_id, 50, 'Registro de evolución física')
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_measurement_created ON measurements;
CREATE TRIGGER on_measurement_created
  AFTER INSERT ON measurements
  FOR EACH ROW EXECUTE PROCEDURE handle_new_measurement_xp();


-- 2. LOGRO "CONSTANCIA" (3 ASISTENCIAS SEGUIDAS)
-- Otorga 150 XP y la medalla al cumplir 3 asistencias consecutivas EN CLASS_BOOKINGS

CREATE OR REPLACE FUNCTION check_streak_achievements()
RETURNS trigger AS $$
DECLARE
    attended_count INTEGER;
    achievement_id UUID;
BEGIN
    -- Solo actuar cuando la reserva se marca como atendida
    IF NEW.status = 'attended' AND OLD.status != 'attended' THEN
        
        -- Contar asistencias en los últimos 30 días para verificar racha
        -- USAMOS class_bookings y la columna 'date' según el esquema detectado
        SELECT COUNT(*) INTO attended_count
        FROM class_bookings
        WHERE user_id = NEW.user_id 
          AND status = 'attended'
          AND date > (CURRENT_DATE - INTERVAL '30 days');

        -- Logro: Constancia (3 asistencias)
        IF attended_count >= 3 THEN
            -- Obtener el ID del logro de la tabla de catálogo
            SELECT id INTO achievement_id FROM achievements WHERE name ILIKE '%Constancia%' LIMIT 1;
            
            IF achievement_id IS NOT NULL THEN
                -- Intentar otorgar el logro (UNIQUE constraint evitará duplicados)
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (NEW.user_id, achievement_id)
                ON CONFLICT (user_id, achievement_id) DO NOTHING;
                
                -- Si se insertó (FOUND indica si la operación anterior afectó filas)
                IF FOUND THEN
                     UPDATE user_gamification
                     SET points = points + 150
                     WHERE user_id = NEW.user_id;

                     INSERT INTO xp_logs (user_id, amount, reason)
                     VALUES (NEW.user_id, 150, 'Logro desbloqueado: Constancia')
                     ON CONFLICT DO NOTHING;
                END IF;
            END IF;
        END IF;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_attended_streak ON class_bookings;
CREATE TRIGGER on_booking_attended_streak
  AFTER UPDATE ON class_bookings
  FOR EACH ROW EXECUTE PROCEDURE check_streak_achievements();
