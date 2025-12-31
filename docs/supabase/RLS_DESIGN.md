# Seguridad y Funcionalidades de Base de Datos (RLS Audit)

Este documento detalla las funcionalidades de la aplicación basadas en el esquema de base de datos actual y define las políticas de seguridad (Row Level Security - RLS) requeridas para cada rol.

## Roles del Sistema
- **Public**: Usuarios no autenticados (acceso muy restringido).
- **Member (Authenticated)**: Alumnos/Usuarios estándar.
- **Coach**: Entrenadores.
- **Admin**: Administradores del gimnasio.
- **Superadmin**: Acceso total al sistema.

---

## 1. Gestión de Usuarios y Perfiles

### Tablas: `profiles`, `profile_change_history`, `user_goals`, `measurements`

#### Funcionalidades:
- **Perfiles**: Información personal, médica y de contacto.
- **Metas**: Objetivos de fitness del usuario.
- **Mediciones**: Seguimiento de peso, grasa corporal, etc.
- **Historial**: Auditoría de cambios en el perfil.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `profiles` | **Member** | SELECT, UPDATE | Puede ver y editar *su propio* perfil. No puede cambiar su rol. |
| `profiles` | **Coach** | SELECT, UPDATE | Puede ver perfiles **solo de alumnos asignados**. Puede AGREGAR notas/lesiones al historial médico. |
| `profiles` | **Admin/Super** | ALL | Control total. Puede cambiar roles y estados. |
| `user_goals` | **Member** | ALL | Puede gestionar sus propias metas. |
| `user_goals` | **Coach** | SELECT, UPDATE | Puede ver y actualizar metas de sus alumnos. |
| `user_goals` | **Admin/Super** | ALL | Gestión total. |
| `measurements` | **Member** | SELECT | Puede ver sus mediciones (generalmente ingresadas por el coach o balanza inteligente). |
| `measurements` | **Coach** | ALL | Puede crear y gestionar mediciones de alumnos. |
| `measurements` | **Admin/Super** | ALL | Gestión total. |

---

## 2. Entrenamiento y Nutrición (Core)

### Tablas: `routines`, `exercises`, `nutrition_plans`, `routine_access_logs`

#### Funcionalidades:
- **Rutinas**: Planes de entrenamiento asignados.
- **Ejercicios**: Detalles de cada ejercicio en la rutina.
- **Nutrición**: Planes de dieta personalizados.
- **Logs**: Seguridad y auditoría de acceso a rutinas.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `routines` | **Member** | SELECT | Solo puede ver rutinas donde `user_id = auth.uid()` y `status = 'active'`. |
| `routines` | **Coach** | ALL | Puede crear/editar rutinas y **asignarlas** (`UPDATE user_id`) a sus alumnos asignados. |
| `routines` | **Admin/Super** | ALL | Gestión total. |
| `exercises` | **Member** | SELECT | View exercises linked to their active routines. |
| `exercises` | **Coach** | ALL | Create/edit exercises within routines they manage. |
| `exercises` | **Admin/Super** | ALL | Gestión total. |
| `nutrition_plans`| **Member** | SELECT | Ver su propio plan activo. |
| `nutrition_plans`| **Coach** | ALL | Crear/editar planes para alumnos. |
| `routine_access_logs` | **System** | INSERT | El sistema inserta logs automáticamente. |
| `routine_access_logs` | **Admin/Super** | SELECT | Auditoría de accesos. |

---

## 3. Clases y Reservas

### Tablas: `activities`, `class_schedules`, `class_bookings`

#### Funcionalidades:
- **Actividades**: Tipos de clase (Yoga, CrossFit, etc.).
- **Horarios**: Calendario de clases disponibles.
- **Reservas**: Inscripción de alumnos a clases.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `activities` | **Public/Auth** | SELECT | Visible para todos (incluso landing page si es necesario). |
| `activities` | **Admin/Super** | ALL | Crear/editar tipos de actividad. |
| `class_schedules`| **Public/Auth** | SELECT | Ver horarios activos. |
| `class_schedules`| **Admin/Super** | ALL | Gestionar la agenda del gimnasio. |
| `class_bookings` | **Member** | SELECT, INSERT, UPDATE | Ver sus reservas, reservar y cancelar. |
| `class_bookings` | **Coach** | SELECT, UPDATE | Ver asistentes y **marcar asistencia/falta** (`UPDATE status`). |
| `class_bookings` | **Admin/Super** | ALL | Gestión total de asistencia. |

> **Nota**: Para evaluar la asistencia de los profesores, se recomienda usar la tabla `class_schedules` (marcando la clase como dada) o la tabla `coach_attendance` (fichaje de entrada/salida implementado recientemente).

---

## 4. Gamificación y Retos

### Tablas: `challenges`, `challenge_participants`, `achievements`, `user_achievements`, `user_gamification`

#### Funcionalidades:
- **Retos**: Competiciones temporales.
- **Logros**: Badges desbloqueables.
- **Puntuación**: Sistema de puntos y niveles.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `challenges` | **Member** | SELECT, INSERT | Ver retos. Pueden **CREAR retos** (desafíos a otros o abiertos). |
| `challenges` | **Admin/Super** | ALL | Crear y gestionar retos oficiales. |
| `challenge_participants` | **Member** | SELECT, INSERT | Ver participantes, unirse. Pueden invitar/desafiar a otros (`INSERT` con otro `user_id` si es desafío amistoso). |
| `challenge_participants` | **Admin/Super** | ALL | Moderar participantes. |
| `achievements` | **Auth** | SELECT | Ver logros disponibles. |
| `user_achievements` | **Member** | SELECT | Ver sus propios logros desbloqueados. |
| `user_achievements` | **System/Admin** | INSERT | El sistema otorga logros (o admins manualmente). |
| `user_gamification` | **Member** | SELECT | Ver sus propios puntos y nivel. |

---

## 5. Comunicación y Soporte

### Tablas: `messages`, `student_reports`

#### Funcionalidades:
- **Mensajería**: Chat directo (Coach <-> Alumno).
- **Reportes**: Feedback o quejas de alumnos.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `messages` | **Member** | SELECT, INSERT | Ver/enviar mensajes propios. |
| `messages` | **Coach** | SELECT, INSERT | Ver/enviar mensajes a sus alumnos. |
| `messages` | **Admin/Super** | SELECT | **Acceso de Auditoría**: Pueden ver chats por razones de seguridad/control. |
| `student_reports`| **Member** | SELECT, INSERT | Ver sus reportes, crear nuevos. |
| `student_reports`| **Admin/Super** | ALL | Ver, gestionar y **CERRAR** reportes (`UPDATE status`). |
---

## 6. Administración y Finanzas

### Tablas: `gym_equipment`, `payments`

#### Funcionalidades:
- **Inventario**: Control de máquinas y estado.
- **Pagos**: Registro de cuotas y transacciones.

#### Políticas RLS Propuestas:

| Tabla | Rol | Permisos | Condiciones / Notas |
| :--- | :--- | :--- | :--- |
| `gym_equipment` | **Coach** | SELECT, UPDATE | Ver inventario, reportar estado (`UPDATE condition`). |
| `gym_equipment` | **Admin/Super** | ALL | Gestión de compras y bajas. |
| `payments` | **Member** | SELECT | Ver su historial de pagos. |
| `payments` | **Admin/Super** | ALL | Registrar pagos, aprobar transferencias, ver reportes. |
---

## Resumen de Acciones Críticas

1.  **Habilitar RLS en TODAS las tablas**: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`.
2.  **Políticas por defecto restrictivas**: Empezar denegando todo y habilitar lo específico.
3.  **Funciones Helper**: Crear funciones en SQL (`auth.uid()`, `is_admin()`, `is_coach()`) para simplificar las policies.
4.  **Índices**: Asegurar índices en claves foráneas (`user_id`, `coach_id`) para que las policies no ralenticen las consultas.
