# Migración: Campos Faltantes en nutrition_plans

## 🎯 Objetivo

Agregar campos necesarios para la funcionalidad completa de generación de rutinas con IA.

## 📋 Campos a Agregar

1. **supplements** (JSONB) - Array de suplementos recomendados
2. **water_liters** (DECIMAL) - Litros de agua diarios
3. **general_guidelines** (TEXT) - Pautas generales de alimentación
4. **restrictions** (JSONB) - Array de restricciones alimentarias

## 🚀 Instrucciones de Aplicación

### Paso 1: Ejecutar Migración en Supabase

1. Ir a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navegar a **SQL Editor**
3. Crear una nueva query
4. Copiar y pegar el contenido de `add_nutrition_plan_fields.sql`
5. Ejecutar la query (botón "Run" o `Ctrl+Enter`)
6. Verificar que aparezcan 4 filas en el resultado (los 4 campos nuevos)

### Paso 2: Regenerar Tipos TypeScript

Después de aplicar la migración, regenerar los tipos:

```bash
npx supabase gen types typescript --project-id nqxvpfwdvkdvqvhqgqbk > src/types/supabase.ts
```

O si no tienes CLI de Supabase instalado, puedes usar la API:
- Ir a **Settings > API** en Supabase Dashboard
- Copiar el comando de generación de tipos
- Ejecutarlo en tu terminal

### Paso 3: Eliminar Casts Temporales

Una vez regenerados los tipos, puedes eliminar los casts `as any` que se agregaron temporalmente en:
- `src/services/nutrition-plans.service.ts` (línea 183)
- `src/app/api/ai/generate-routine/route.ts` (línea 315)

## ✅ Verificación

Para verificar que la migración se aplicó correctamente:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nutrition_plans' 
AND column_name IN ('supplements', 'water_liters', 'general_guidelines', 'restrictions');
```

Deberías ver 4 filas con los campos nuevos.

## 🔄 Estado Actual

- ✅ Script SQL creado
- ✅ Función `updateSupplements` restaurada con cast temporal
- ✅ Código de IA ajustado con cast temporal
- ⏳ **Pendiente:** Ejecutar migración en Supabase
- ⏳ **Pendiente:** Regenerar tipos TypeScript
- ⏳ **Pendiente:** Eliminar casts temporales

## 📝 Notas

- Los casts `as any` son temporales y permiten que el código compile
- La funcionalidad completa estará disponible después de aplicar la migración
- Los campos son opcionales (nullable) para mantener compatibilidad con datos existentes
