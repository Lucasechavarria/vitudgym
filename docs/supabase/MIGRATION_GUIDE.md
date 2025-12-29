# 🚀 Guía de Migración: Firebase → Supabase

## ✅ Archivos Creados

### 1. Database Schema
- `supabase/schema.sql` - Schema completo con tablas, RLS, triggers

### 2. Configuración
- `src/lib/supabase/client.ts` - Cliente Supabase (client-side)
- `src/lib/supabase/server.ts` - Cliente Supabase (server-side)
- `src/types/supabase.ts` - TypeScript types

### 3. Servicios
- `src/services/auth.service.ts` - Autenticación
- `src/services/activities.service.ts` - Actividades
- `src/services/classes.service.ts` - Clases
- `src/services/bookings.service.ts` - Reservas

### 4. Middleware
- `src/middleware.ts` - Actualizado para Supabase

---

## 📋 Pasos de Migración

### Paso 1: Crear Proyecto en Supabase (5 min)

1. Ir a https://supabase.com
2. Click "Start your project"
3. Crear organización (si no tienes)
4. Crear nuevo proyecto:
   - Name: `virtud-gym`
   - Database Password: (guardar en lugar seguro)
   - Region: `South America (São Paulo)`
5. Esperar ~2 minutos a que se cree

### Paso 2: Ejecutar Schema SQL (5 min)

1. En Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copiar TODO el contenido de `supabase/schema.sql`
4. Pegar y ejecutar (Run)
5. Verificar que se crearon las tablas en "Table Editor"

### Paso 3: Configurar Variables de Entorno (2 min)

En Supabase Dashboard → Settings → API:

```bash
# Agregar a .env.local

# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### Paso 4: Instalar Dependencias

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
```

### Paso 5: Configurar Auth en Supabase

1. Dashboard → Authentication → Providers
2. Habilitar:
   - ✅ Email (ya habilitado)
   - ✅ Google OAuth:
     - Client ID: (de Google Cloud Console)
     - Client Secret: (de Google Cloud Console)
     - Redirect URL: `https://tu-proyecto.supabase.co/auth/v1/callback`

### Paso 6: Migrar Datos de Firebase (Opcional)

Si tienes datos en Firebase que quieres migrar:

```typescript
// Script de migración (crear en scripts/migrate-firebase-to-supabase.ts)
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/firebase/config'; // Firebase

async function migrateUsers() {
  // 1. Obtener usuarios de Firebase
  const usersSnapshot = await db.collection('usuarios').get();
  
  // 2. Crear en Supabase
  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    
    // Crear usuario en Supabase Auth
    const { data: authData } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: 'temp-password-123', // Usuario debe resetear
      email_confirm: true,
    });

    if (authData.user) {
      // Crear profile
      await supabase.from('profiles').insert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.nombre,
        role: userData.role || 'member',
        // ... otros campos
      });
    }
  }
}
```

---

## 🔄 Cambios en el Código

### Antes (Firebase):
```typescript
import { db } from '@/lib/firebase/config';

// Obtener actividades
const activitiesRef = db.collection('actividades');
const snapshot = await activitiesRef.get();
const activities = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Después (Supabase):
```typescript
import { activitiesService } from '@/services/activities.service';

// Obtener actividades
const activities = await activitiesService.getAll();
```

---

## 🎯 Ventajas de la Migración

### 1. Queries más Potentes
```sql
-- Firebase: Difícil/imposible
-- Supabase: Fácil
SELECT 
  c.*,
  a.name as activity_name,
  COUNT(b.id) as total_bookings
FROM classes c
JOIN activities a ON c.activity_id = a.id
LEFT JOIN bookings b ON c.id = b.class_id
GROUP BY c.id, a.name
HAVING COUNT(b.id) < c.max_capacity;
```

### 2. Relaciones Nativas
```typescript
// Obtener clase con actividad y coach en 1 query
const { data } = await supabase
  .from('classes')
  .select(`
    *,
    activity:activities(*),
    coach:profiles(*)
  `)
  .eq('id', classId)
  .single();
```

### 3. Row Level Security Automático
```sql
-- Los usuarios solo ven sus propios datos
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);
```

### 4. Realtime Subscriptions
```typescript
// Escuchar cambios en tiempo real
supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('Nueva reserva:', payload.new);
  })
  .subscribe();
```

---

## 📊 Comparación de Costos

### Firebase (Spark - Gratis)
- 50,000 lecturas/día
- 20,000 escrituras/día
- 1GB storage

**Problema**: Con 100 usuarios activos:
- Ver dashboard = 10 lecturas/usuario
- 100 usuarios × 10 lecturas × 30 días = 30,000 lecturas/día
- **Ya casi en el límite** 😰

### Supabase (Free Tier)
- **Unlimited** API requests
- 500MB Database
- 1GB File Storage
- 2GB Bandwidth/mes

**Ventaja**: No cobran por query, solo por storage 🎉

---

## 🔐 Seguridad Mejorada

### Firebase
```typescript
// Reglas en Firestore (limitadas)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{booking} {
      allow read: if request.auth.uid == resource.data.userId;
    }
  }
}
```

### Supabase
```sql
-- RLS Policies (más potentes)
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'coach')
    )
  );
```

---

## 🚀 Próximos Pasos

### Inmediato (Hoy)
1. ✅ Crear proyecto Supabase
2. ✅ Ejecutar schema.sql
3. ✅ Configurar .env.local
4. ✅ Instalar dependencias

### Esta Semana
1. Actualizar componentes para usar servicios de Supabase
2. Migrar autenticación
3. Testing completo
4. Deploy

### Opcional
1. Migrar datos de Firebase
2. Configurar Realtime subscriptions
3. Agregar Storage para imágenes

---

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

---

## ✅ Checklist de Migración

- [ ] Proyecto Supabase creado
- [ ] Schema SQL ejecutado
- [ ] Variables de entorno configuradas
- [ ] Dependencias instaladas
- [ ] Auth configurado (Email + Google)
- [ ] Servicios implementados
- [ ] Middleware actualizado
- [ ] Componentes migrados
- [ ] Testing completo
- [ ] Deploy a producción

---

**¡Listo para empezar la migración!** 🎉

**Tiempo estimado total**: 4-6 horas
**Beneficio**: Base de datos profesional, escalable y más barata
