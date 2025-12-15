# 🔄 Plan de Migración Seguro: Firebase → Supabase

## ⚠️ ARCHIVOS QUE USAN FIREBASE (8 archivos)

### API Routes (6):
1. `app/api/auth/login/route.ts` - Login con Firebase Admin
2. `app/api/auth/set-role/route.ts` - Asignación de roles
3. `app/api/booking/create/route.ts` - Crear reservas
4. `app/api/payments/webhook/route.ts` - Webhook de pagos
5. `app/api/payments/manual-approval/route.ts` - Aprobación manual
6. `app/middleware.ts` - Middleware de autenticación

### Frontend (2):
7. `app/(auth)/login/page.tsx` - Página de login
8. `app/(admin)/admin/layout.tsx` - Layout admin

---

## 📋 ESTRATEGIA DE MIGRACIÓN

### Opción 1: Migración Gradual (RECOMENDADO)
Mantener Firebase y Supabase en paralelo, migrar feature por feature.

**Ventajas:**
- ✅ Sin downtime
- ✅ Rollback fácil
- ✅ Testing incremental

**Desventajas:**
- ⚠️ Código duplicado temporalmente
- ⚠️ Dos bases de datos activas

### Opción 2: Migración Completa
Reemplazar todo Firebase de una vez.

**Ventajas:**
- ✅ Código limpio desde el inicio
- ✅ Sin duplicación

**Desventajas:**
- ⚠️ Riesgo alto
- ⚠️ Requiere testing completo antes

---

## 🎯 PLAN RECOMENDADO: Migración Gradual

### Fase 1: Setup Supabase (SIN tocar Firebase)
- [x] Crear proyecto Supabase
- [x] Ejecutar schema
- [x] Configurar .env
- [x] Instalar dependencias
- [ ] Verificar que Firebase sigue funcionando

### Fase 2: Migrar Autenticación
- [ ] Crear nuevos archivos Supabase (sin borrar Firebase)
- [ ] Actualizar login page
- [ ] Testing completo
- [ ] Migrar usuarios existentes
- [ ] Borrar archivos Firebase Auth

### Fase 3: Migrar Data (Bookings, Payments, etc.)
- [ ] Migrar servicios uno por uno
- [ ] Actualizar API routes
- [ ] Testing
- [ ] Borrar código Firebase

### Fase 4: Limpieza Final
- [ ] Eliminar dependencias Firebase
- [ ] Eliminar archivos Firebase
- [ ] Actualizar documentación

---

## 📁 ESTRUCTURA PROPUESTA (Sin Conflictos)

```
src/
├── lib/
│   ├── db/                          # NUEVO - Abstracción de DB
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   └── firebase/                # LEGACY - Mantener hasta migración
│   │       ├── config.ts
│   │       ├── admin.ts
│   │       └── auth.ts
│   │
│   ├── auth/                        # NUEVO - Abstracción de Auth
│   │   ├── index.ts                 # Exporta el provider activo
│   │   ├── supabase-auth.ts
│   │   └── firebase-auth.ts         # LEGACY
│   │
│   └── services/                    # NUEVO - Servicios agnósticos
│       ├── auth.service.ts          # Usa lib/auth
│       ├── activities.service.ts
│       ├── classes.service.ts
│       └── bookings.service.ts
│
├── hooks/
│   ├── useAuth.ts                   # Usa lib/auth
│   ├── useActivities.ts
│   └── useBookings.ts
│
└── types/
    ├── supabase.ts
    └── database.ts                  # NUEVO - Types compartidos
```

---

## 🔧 RENOMBRADO DE ARCHIVOS

### Archivos Firebase (Mantener temporalmente):
```
src/lib/firebase/config.ts       → src/lib/db/firebase/config.ts
src/lib/firebase/admin.ts        → src/lib/db/firebase/admin.ts
src/lib/firebase/auth.ts         → src/lib/db/firebase/auth.ts
```

### Archivos Supabase (Ya creados):
```
src/lib/supabase/client.ts       → src/lib/db/supabase/client.ts
src/lib/supabase/server.ts       → src/lib/db/supabase/server.ts
```

### Servicios (Nuevos - Agnósticos):
```
src/services/auth.service.ts     → Usa provider configurado
src/services/activities.service.ts
src/services/classes.service.ts
src/services/bookings.service.ts
```

---

## 🎯 SIGUIENTE PASO INMEDIATO

**NO migrar todavía. Primero:**

1. ✅ Crear proyecto Supabase
2. ✅ Ejecutar schema SQL
3. ✅ Configurar .env
4. ⚠️ **VERIFICAR** que Firebase sigue funcionando
5. ✅ Crear usuarios de prueba en Supabase
6. ✅ Testing de Supabase en paralelo
7. 🔄 Decidir: ¿Migración gradual o completa?

---

## ⚠️ IMPORTANTE

**NO BORRAR NADA DE FIREBASE HASTA:**
- ✅ Supabase funcionando 100%
- ✅ Usuarios migrados
- ✅ Testing completo
- ✅ Backup de datos Firebase

---

## 🤔 DECISIÓN REQUERIDA

**¿Qué prefieres?**

**A) Migración Gradual** (Recomendado)
- Mantener Firebase funcionando
- Migrar feature por feature
- Más seguro, más lento

**B) Migración Completa**
- Reemplazar todo de una vez
- Más rápido, más riesgoso
- Requiere testing exhaustivo

**C) Dual Database**
- Mantener ambos permanentemente
- Nuevos features en Supabase
- Legacy en Firebase

**Dime cuál prefieres y continúo con ese plan.**
