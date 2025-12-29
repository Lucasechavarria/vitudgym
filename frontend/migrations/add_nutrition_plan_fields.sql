-- ============================================
-- Migración: add_nutrition_plan_fields
-- Descripción: Agregar campos para suplementos, agua, pautas y restricciones
-- Fecha: 2025-12-19
-- ============================================

-- Agregar columnas a la tabla nutrition_plans
ALTER TABLE nutrition_plans
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS water_liters DECIMAL(4,2),
ADD COLUMN IF NOT EXISTS general_guidelines TEXT,
ADD COLUMN IF NOT EXISTS restrictions JSONB DEFAULT '[]'::jsonb;

-- Agregar comentarios para documentación
COMMENT ON COLUMN nutrition_plans.supplements IS 'Array de suplementos recomendados con nombre, dosis, timing y propósito';
COMMENT ON COLUMN nutrition_plans.water_liters IS 'Litros de agua diarios recomendados';
COMMENT ON COLUMN nutrition_plans.general_guidelines IS 'Pautas generales de alimentación';
COMMENT ON COLUMN nutrition_plans.restrictions IS 'Array de restricciones alimentarias';

-- Verificar que las columnas se crearon correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'nutrition_plans'
AND column_name IN ('supplements', 'water_liters', 'general_guidelines', 'restrictions')
ORDER BY column_name;
