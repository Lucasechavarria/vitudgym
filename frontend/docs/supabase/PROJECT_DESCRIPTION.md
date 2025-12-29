# 📝 Descripción Exacta del Proyecto Virtud

## Para Crear Proyecto en Supabase

### Información Básica

**Nombre del Proyecto:**
```
virtud-gym
```

**Descripción:**
```
Plataforma integral de gestión para gimnasio Virtud. Sistema completo de reservas de clases, gestión de membresías, pagos, rutinas personalizadas con IA, y administración de usuarios con roles (member, coach, admin). Incluye actividades de fitness, artes marciales y medicina tradicional china.
```

**Descripción Corta (si pide):**
```
Sistema de gestión integral para gimnasio con reservas, pagos y rutinas con IA
```

**Tags/Keywords:**
```
gym, fitness, booking, payments, ai, martial-arts, wellness, membership
```

---

## Configuración Recomendada

### Region:
```
South America (São Paulo)
```
**Por qué**: Menor latencia para usuarios en Argentina

### Database Password:
```
[GENERA UNO FUERTE - Ejemplo: Virtud2025!Gym#Secure]
```
**Importante**: Guárdalo en un lugar seguro, lo necesitarás

### Pricing Plan:
```
Free
```

---

## Características del Proyecto

### Módulos Principales:
1. **Autenticación y Perfiles**
   - Login con email/password
   - Login con Google OAuth
   - Roles: member, coach, admin, superadmin
   - Perfiles con datos médicos y de emergencia

2. **Gestión de Actividades**
   - Actividades de gimnasio (Funcional, Fuerza, CrossFit)
   - Artes marciales (BJJ, Muay Thai)
   - Medicina tradicional china (Yoga, Acupuntura)

3. **Sistema de Clases**
   - Clases programadas por día/hora
   - Control de capacidad
   - Sistema de waitlist automático
   - Asignación de coaches

4. **Reservas (Bookings)**
   - Reserva de clases
   - Check-in de asistencia
   - Gestión de lista de espera
   - Historial de asistencia

5. **Pagos y Membresías**
   - Pagos con MercadoPago
   - Aprobación manual (efectivo/transferencia)
   - Control de membresías activas/vencidas
   - Historial de pagos

6. **Rutinas Personalizadas**
   - Generación con IA (Gemini)
   - Asignación por coach
   - Ejercicios detallados
   - Seguimiento de progreso

---

## Stack Tecnológico

### Frontend:
- Next.js 15.3.3 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

### Backend:
- Supabase (PostgreSQL)
- Row Level Security (RLS)
- Realtime subscriptions
- Edge Functions

### Integraciones:
- Google Analytics
- Sentry (error tracking)
- MercadoPago (pagos)
- Gemini AI (rutinas)

---

## Base de Datos

### Tablas (7):
1. **profiles** - Perfiles de usuarios
2. **activities** - Actividades disponibles
3. **classes** - Clases programadas
4. **bookings** - Reservas de usuarios
5. **payments** - Pagos y membresías
6. **routines** - Rutinas personalizadas
7. **exercises** - Ejercicios de rutinas

### Views (3):
- classes_with_availability
- user_bookings_detailed
- active_memberships

### Funciones (3):
- handle_new_user (auto-crear profile)
- update_updated_at_column (timestamps)
- update_class_capacity (capacidad automática)

---

## Usuarios Esperados

### Roles:
- **Members** (~100-500): Usuarios regulares del gimnasio
- **Coaches** (~5-10): Entrenadores y profesores
- **Admins** (~2-3): Administradores del gimnasio
- **Superadmin** (1): Dueño/administrador principal

### Uso Estimado:
- **Reservas diarias**: 50-100
- **Clases activas**: 30-50
- **Pagos mensuales**: 100-200
- **Rutinas activas**: 50-100

---

## Seguridad

### Implementado:
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Políticas por rol (member, coach, admin)
- ✅ Autenticación con Supabase Auth
- ✅ Validaciones en base de datos (CHECK constraints)
- ✅ Foreign keys con CASCADE/SET NULL
- ✅ Triggers automáticos

---

## Escalabilidad

### Plan Free Suficiente Para:
- ✅ 500 usuarios activos
- ✅ 10,000 reservas/mes
- ✅ 500MB de datos
- ✅ Unlimited API requests

### Cuando Crecer:
- Pro Plan ($25/mes) cuando:
  - Más de 500 usuarios activos
  - Más de 500MB de datos
  - Necesidad de backups diarios

---

## Información Adicional

### Organización:
```
Virtud Gym
```

### Contacto:
```
echavarrialucas1986@gmail.com
```

### Sitio Web:
```
https://virtud-gym.vercel.app (cuando se despliegue)
```

### Repositorio:
```
https://github.com/Lucasechavarria/plataforma-virtud
```

---

## Resumen para Copy-Paste

**Para el formulario de Supabase:**

```
Project name: virtud-gym

Description: Plataforma integral de gestión para gimnasio Virtud. Sistema completo de reservas de clases, gestión de membresías, pagos, rutinas personalizadas con IA, y administración de usuarios con roles. Incluye actividades de fitness, artes marciales y medicina tradicional china.

Region: South America (São Paulo)

Database Password: [TU_PASSWORD_SEGURO]

Organization: Virtud Gym
```

---

**Listo para crear el proyecto** ✅
