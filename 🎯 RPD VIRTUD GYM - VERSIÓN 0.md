# **🎯 RPD VIRTUD GYM - VERSIÓN 0.4.0 (ELITE HUB)**

## **Estado: Producción Elite**

**Fecha:** 10 de Febrero de 2026  
**Versión:** 0.4.0  
**Cambios:** Consolidación de Fase 2 (Gamificación Elite, Intelligence Hub, Tactical Training UI, Analytics Engine).

---

## **📋 CHANGELOG 0.3.0 → 0.4.0**

### **✅ Mejoras Implementadas (Fase Elite Central)**

| Categoría | Cambio | Impacto |
| ----- | ----- | ----- |
| **UI/UX** | 💎 Gamificación Elite (Podio 3D, Trofeos) | Engagement superior y motivación social |
| **UI/UX** | 💎 Intelligence Hub (Dashboard Elite) | Centralización de bio-datos con estética premium |
| **UI/UX** | 💎 Tactical Training UI (MyRoutine) | Experiencia de entrenamiento inmersiva y técnica |
| **Data** | 📊 Analytics Engine v1.0 | Visualizaciones avanzadas de rendimiento y bio-métricas |
| **IA** | ✅ Sincronización Vision Lab | Integración completa de feedback biomecánico en el flujo del alumno |

---

---

## **1\. PROPÓSITO DEL DOCUMENTO (ACTUALIZADO)**

Este RPD es la **fuente única de verdad** del sistema Virtud Gym. Define:

* ✅ **Arquitectura de datos robustecida** para IA y escalabilidad  
* ✅ **Decisiones de diseño justificadas** (ARRs \- Architectural Decision Records)  
* ✅ **Plan de migración de deuda técnica** con timelines claros  
* ✅ **Integraciones con sistemas externos** (Gemini AI, MercadoPago)

---

## **2\. VISIÓN DEL PRODUCTO (SIN CAMBIOS)**

Virtud Gym es una plataforma integral de gestión de gimnasios que combina:

* 🏋️ Gestión de socios y membresías  
* 📅 Reservas de clases grupales  
* 🤖 **Rutinas personalizadas con IA** (Google Gemini)  
* 🎮 Gamificación y desafíos  
* 📊 Seguimiento de progreso  
* 🍎 Planes nutricionales  
* 💬 Mensajería interna  
* 💳 Gestión de pagos  
* 🎥 **Análisis de técnica con IA** (NUEVO)

---

## **3\. ARQUITECTURA DE DATOS ACTUALIZADA**

### **3.1 Diagrama de Relaciones Principal**

erDiagram

    perfiles ||--o{ rutinas : "usuario\_id"

    perfiles ||--o{ rutinas : "entrenador\_id"

    perfiles ||--o{ asistencias : "registra"

    perfiles ||--o{ gamificacion\_del\_usuario : "tiene"

    perfiles ||--o{ videos\_ejercicio : "sube/recibe"

    

    rutinas ||--o{ ejercicios : "contiene"

    ejercicios ||--o{ ejercicios\_equipamiento : "requiere"

    equipamiento ||--o{ ejercicios\_equipamiento : "usado\_en"

    

    rutinas ||--o{ sesiones\_de\_entrenamiento : "ejecuta"

    sesiones\_de\_entrenamiento ||--o{ registros\_de\_ejercicio : "detalla"

    

    actividades ||--o{ horarios\_de\_clase : "programa"

    horarios\_de\_clase ||--o{ reservas\_de\_clase : "genera"

    

    desafios ||--o{ participantes\_desafio : "inscribe"

    

    conversaciones ||--o{ mensajes : "contiene"

    conversaciones ||--o{ participantes\_conversacion : "agrupa"

---

## **4\. TABLAS NUEVAS Y MODIFICADAS**

### **4.1 🆕 `videos_ejercicio` (NUEVA)**

**Propósito:** Almacenamiento y análisis de videos de técnica con IA.

CREATE TABLE videos\_ejercicio (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  usuario\_id UUID NOT NULL REFERENCES perfiles(id),

  subido\_por UUID NOT NULL REFERENCES perfiles(id), \-- Coach que sube

  ejercicio\_id UUID REFERENCES ejercicios(id),


  \-- Metadata del video

  url\_video TEXT NOT NULL,

  url\_thumbnail TEXT,

  duracion\_segundos INTEGER,


  \-- Pipeline IA

  estado TEXT DEFAULT 'subido' 

    CHECK (estado IN ('subido', 'procesando', 'analizado', 'error')),

  procesado\_en TIMESTAMPTZ,


  \-- Resultados IA

  correcciones\_ia JSONB DEFAULT '{}',

  nombre\_ejercicio\_custom TEXT,

  visto\_por\_alumno BOOLEAN DEFAULT false,

  /\*

    Estructura:

    {

      "postura": \[

        {

          "timestamp": "00:05",

          "issue": "Rodillas sobrepasan punta de pies",

          "severity": "alta",

          "recommendation": "..."

        }

      \],

      "tecnica": \[...\],

      "puntaje\_general": 7.5

    }

  \*/

  puntaje\_confianza NUMERIC(3,2),


  \-- Compartir con alumno

  compartido\_con\_alumno BOOLEAN DEFAULT false,

  compartido\_en TIMESTAMPTZ,


  \-- Feedback del alumno

  feedback\_alumno TEXT,

  calificacion\_alumno INTEGER CHECK (calificacion\_alumno BETWEEN 1 AND 5),


  creado\_en TIMESTAMPTZ DEFAULT NOW(),

  actualizado\_en TIMESTAMPTZ DEFAULT NOW()

);

\-- Índices

CREATE INDEX idx\_videos\_usuario ON videos\_ejercicio(usuario\_id);

CREATE INDEX idx\_videos\_subido\_por ON videos\_ejercicio(subido\_por);

CREATE INDEX idx\_videos\_estado ON videos\_ejercicio(estado);

CREATE INDEX idx\_videos\_compartido ON videos\_ejercicio(compartido\_con\_alumno) 

  WHERE compartido\_con\_alumno \= true;

**Flujo de IA:**

graph LR

    A\[Coach sube video\] \--\> B\[estado: subido\]

    B \--\> C\[Backend procesa con IA\]

    C \--\> D\[estado: procesando\]

    D \--\> E{Análisis exitoso?}

    E \--\>|Sí| F\[estado: analizado\]

    E \--\>|No| G\[estado: error\]

    F \--\> H\[Coach revisa correcciones\]

    H \--\> I\[Comparte con alumno\]

    I \--\> J\[Alumno da feedback\]

---

### **4.2 🆕 `ejercicios_equipamiento` (NUEVA \- Normalización)**

**Propósito:** Reemplazar `equipamiento ARRAY` con relación M:N profesional.

CREATE TABLE ejercicios\_equipamiento (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

  ejercicio\_id UUID NOT NULL REFERENCES ejercicios(id) ON DELETE CASCADE,

  equipamiento\_id UUID NOT NULL REFERENCES equipamiento(id) ON DELETE CASCADE,


  \-- Metadata de la relación

  es\_opcional BOOLEAN DEFAULT false,

  alternativa\_id UUID REFERENCES equipamiento(id), \-- Ej: mancuernas como alternativa a barra


  creado\_en TIMESTAMPTZ DEFAULT NOW(),


  UNIQUE(ejercicio\_id, equipamiento\_id)

);

CREATE INDEX idx\_ejercicios\_equipamiento\_ejercicio 

  ON ejercicios\_equipamiento(ejercicio\_id);

CREATE INDEX idx\_ejercicios\_equipamiento\_equip 

  ON ejercicios\_equipamiento(equipamiento\_id);

**Ventajas vs ARRAY:**

| Aspecto | ARRAY (antes) | Tabla intermedia (ahora) |
| ----- | ----- | ----- |
| **JOINs** | ❌ Imposible | ✅ Eficiente |
| **Reportes** | ❌ Complejo | ✅ SQL directo |
| **Alternativas** | ❌ No soportado | ✅ Campo `alternativa_id` |
| **Integridad** | ❌ Sin FK | ✅ Constraints de BD |

**Migración gradual:**

\-- PASO 1: Popular tabla intermedia desde ARRAY existente

INSERT INTO ejercicios\_equipamiento (ejercicio\_id, equipamiento\_id)

SELECT 

  e.id,

  eq.id

FROM ejercicios e

CROSS JOIN LATERAL unnest(e.equipamiento) AS equip\_nombre

JOIN equipamiento eq ON eq.nombre \= equip\_nombre;

\-- PASO 2: Deprecar columna ARRAY (no eliminar aún)

\-- ejercicios.equipamiento → Mantener para compatibilidad

\-- PASO 3: Actualizar código backend para usar JOIN

\-- PASO 4 (Futuro): Eliminar columna

\-- ALTER TABLE ejercicios DROP COLUMN equipamiento;

---

### **4.3 🆕 `audit_logs` (NUEVA \- Auditoría Genérica)**

**Propósito:** Trazabilidad completa de operaciones críticas.

CREATE TABLE audit\_logs (

  id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),


  \-- Qué se modificó

  tabla TEXT NOT NULL,

  operacion TEXT NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),

  registro\_id UUID,


  \-- Quién lo hizo

  usuario\_id UUID REFERENCES perfiles(id),


  \-- Datos del cambio

  datos\_anteriores JSONB,

  datos\_nuevos JSONB,


  \-- Contexto técnico

  direccion\_ip INET,

  agente\_usuario TEXT,


  creado\_en TIMESTAMPTZ DEFAULT NOW()

);

CREATE INDEX idx\_audit\_tabla\_fecha ON audit\_logs(tabla, creado\_en DESC);

CREATE INDEX idx\_audit\_usuario ON audit\_logs(usuario\_id);

CREATE INDEX idx\_audit\_registro ON audit\_logs(registro\_id);

**Trigger de ejemplo (aplicar a tablas críticas):**

CREATE OR REPLACE FUNCTION registrar\_auditoria()

RETURNS TRIGGER AS $$

BEGIN

  INSERT INTO audit\_logs (

    tabla,

    operacion,

    registro\_id,

    usuario\_id,

    datos\_anteriores,

    datos\_nuevos

  ) VALUES (

    TG\_TABLE\_NAME,

    TG\_OP,

    COALESCE(NEW.id, OLD.id),

    current\_setting('app.current\_user\_id', true)::UUID,

    CASE WHEN TG\_OP \= 'DELETE' THEN row\_to\_json(OLD) ELSE NULL END,

    CASE WHEN TG\_OP IN ('INSERT', 'UPDATE') THEN row\_to\_json(NEW) ELSE NULL END

  );

  RETURN COALESCE(NEW, OLD);

END;

$$ LANGUAGE plpgsql;

\-- Aplicar a tablas críticas

CREATE TRIGGER trigger\_audit\_rutinas

  AFTER INSERT OR UPDATE OR DELETE ON rutinas

  FOR EACH ROW EXECUTE FUNCTION registrar\_auditoria();

CREATE TRIGGER trigger\_audit\_pagos

  AFTER INSERT OR UPDATE OR DELETE ON pagos

  FOR EACH ROW EXECUTE FUNCTION registrar\_auditoria();

---

### **4.4 ✏️ `asistencias` (MODIFICADA)**

**Cambio:** `rol_en_el_momento` → `rol_asistencia` (consistencia)

\-- Antes:

rol\_en\_el\_momento USER-DEFINED NOT NULL

\-- Ahora:

rol\_asistencia USER-DEFINED NOT NULL

**Migración:**

ALTER TABLE asistencias 

  RENAME COLUMN rol\_en\_el\_momento TO rol\_asistencia;

---

### **4.5 ✏️ `horarios_de_clase` (MODIFICADA)**

**Cambio:** `texto_profesor` → `notas_entrenador` (semántica clara)

\-- Antes:

texto\_profesor TEXT

\-- Ahora:

notas\_entrenador TEXT

**Migración:**

ALTER TABLE horarios\_de\_clase 

  RENAME COLUMN texto\_profesor TO notas\_entrenador;

---

## **5\. DEUDA TÉCNICA ACTUALIZADA**

| ID | Problema | Estado | Acción | Prioridad |
| ----- | ----- | ----- | ----- | ----- |
| DT-001 | ~~Tabla duplicada gamificación\_del\_usuario~~ | ✅ **RESUELTO** | Eliminada | \- |
| DT-002 | ~~JSONB sin validación~~ | ✅ **RESUELTO** | Constraints CHECK agregados | \- |
| DT-003 | ~~Videos IA falta~~ | ✅ **RESUELTO** | Tabla implementada | \- |
| DT-004 | ~~Nomenclatura inconsistente~~ | ✅ **RESUELTO** | Columnas renombradas | \- |
| DT-005 | Falta índices críticos | ⚠️ **EN PROGRESO** | Ver sección 9 | 🔥 Urgente |
| DT-006 | `equipamiento ARRAY` coexiste | ⏳ **PLANIFICADO** | Migración gradual iniciada | ⏰ Q2 2026 |
| DT-007 | Falta trigger capacidad reservas | 🚨 **PENDIENTE** | Ver sección 6.4 | 🔥 Crítico |

---

## **6\. FUNCIONALIDADES NUEVAS**

### **6.1 Análisis de Video con IA**

**Endpoint:** `POST /api/coach/videos/upload`

**Flujo:**

1. **Coach sube video** (alumno ejecutando ejercicio)  
2. **Backend valida** (formato, tamaño, duración)  
3. **Supabase Storage** guarda video  
4. **Worker procesa** (queue: `video_analysis_jobs`)  
5. **IA analiza** (Google Gemini Vision API)  
6. **Almacena resultados** en `correcciones_ia` (JSONB)  
7. **Notifica al coach**  
8. **Coach comparte** con alumno si lo desea

**Estructura de `correcciones_ia`:**

{

  "version": "1.0",

  "timestamp": "2026-01-23T10:30:00Z",

  "analisis": {

    "postura": \[

      {

        "timestamp\_ms": 5200,

        "frame": 156,

        "issue": "Espalda no alineada con caderas",

        "severity": "media",

        "recommendation": "Mantener core contraído durante todo el movimiento"

      }

    \],

    "rango\_movimiento": \[

      {

        "timestamp\_ms": 3100,

        "issue": "Rodillas no alcanzan 90 grados",

        "severity": "baja",

        "recommendation": "Profundizar sentadilla hasta paralelo"

      }

    \],

    "tecnica\_general": "Buena ejecución con mejoras menores en profundidad",

    "puntaje\_tecnico": 7.5,

    "puntaje\_seguridad": 9.0

  },

  "recomendaciones": \[

    "Aumentar movilidad de cadera",

    "Practicar tempo lento (3-0-3-0)"

  \]

}

---

### **6.2 Reportes de Equipamiento**

**Query de ejemplo (ahora posible con tabla normalizada):**

\-- Equipamiento más usado en rutinas activas

SELECT 

  eq.nombre,

  eq.categoria,

  COUNT(DISTINCT e.rutina\_id) AS rutinas\_usando,

  COUNT(DISTINCT ee.ejercicio\_id) AS ejercicios\_usando,

  eq.cantidad AS cantidad\_disponible,

  ROUND(

    COUNT(DISTINCT e.rutina\_id) \* 1.0 / eq.cantidad, 

    2

  ) AS ratio\_demanda

FROM equipamiento eq

JOIN ejercicios\_equipamiento ee ON eq.id \= ee.equipamiento\_id

JOIN ejercicios e ON ee.ejercicio\_id \= e.id

JOIN rutinas r ON e.rutina\_id \= r.id

WHERE r.esta\_activa \= true

  AND eq.esta\_disponible \= true

GROUP BY eq.id

ORDER BY ratio\_demanda DESC;

**Output:**

| nombre | categoria | rutinas\_usando | ratio\_demanda |
| ----- | ----- | ----- | ----- |
| Barra Olímpica | pesas\_libres | 45 | 9.0 |
| Banco Plano | fuerza | 38 | 9.5 |
| Rack Sentadillas | fuerza | 42 | 21.0 |

**Acción:** Comprar más Racks de Sentadillas (alto ratio).

---

## **7\. SEGURIDAD REFORZADA**

### **7.1 RLS en Tablas Nuevas**

\-- videos\_ejercicio: Coach solo ve sus subidas \+ alumnos asignados

ALTER TABLE videos\_ejercicio ENABLE ROW LEVEL SECURITY;

CREATE POLICY coach\_ve\_sus\_videos ON videos\_ejercicio

  FOR SELECT

  USING (

    subido\_por \= auth.uid()

    OR

    (compartido\_con\_alumno \= true AND usuario\_id \= auth.uid())

    OR

    EXISTS (

      SELECT 1 FROM perfiles

      WHERE id \= auth.uid() AND rol \= 'admin'

    )

  );

\-- ejercicios\_equipamiento: Solo coaches/admins modifican

ALTER TABLE ejercicios\_equipamiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY solo\_coaches\_editan\_equipamiento ON ejercicios\_equipamiento

  FOR ALL

  USING (

    EXISTS (

      SELECT 1 FROM perfiles

      WHERE id \= auth.uid() AND rol IN ('coach', 'admin')

    )

  );

---

### **7.2 Validación JSONB Robustecida**

\-- perfiles: Validar estructura de contacto\_emergencia

ALTER TABLE perfiles

  ADD CONSTRAINT check\_contacto\_emergencia

  CHECK (

    contacto\_emergencia IS NULL 

    OR (

      contacto\_emergencia ? 'nombre' AND

      contacto\_emergencia ? 'telefono' AND

      contacto\_emergencia ? 'parentesco'

    )

  );

\-- perfiles: Validar estructura de informacion\_medica

ALTER TABLE perfiles

  ADD CONSTRAINT check\_informacion\_medica

  CHECK (

    informacion\_medica IS NULL

    OR (

      informacion\_medica ? 'grupo\_sanguineo' AND

      informacion\_medica ? 'presion\_arterial'

    )

  );

\-- videos\_ejercicio: Validar estructura de correcciones\_ia

ALTER TABLE videos\_ejercicio

  ADD CONSTRAINT check\_correcciones\_ia\_structure

  CHECK (

    correcciones\_ia IS NULL

    OR (

      correcciones\_ia ? 'version' AND

      correcciones\_ia ? 'analisis'

    )

  );

---

## **8\. ÍNDICES CRÍTICOS (IMPLEMENTAR YA)**

\-- 🔥 PERFORMANCE CRÍTICO

\-- Rutinas activas por usuario (dashboard alumno)

CREATE INDEX idx\_rutinas\_usuario\_activa 

  ON rutinas(usuario\_id, esta\_activa) 

  WHERE esta\_activa \= true;

\-- Sesiones recientes (gráficos de progreso)

CREATE INDEX idx\_sesiones\_usuario\_fecha 

  ON sesiones\_de\_entrenamiento(usuario\_id, hora\_inicio DESC);

\-- Asistencias del mes (métricas)

CREATE INDEX idx\_asistencias\_fecha 

  ON asistencias(entrada DESC);

\-- Reservas futuras (calendario)

CREATE INDEX idx\_reservas\_fecha\_estado 

  ON reservas\_de\_clase(fecha, estado)

  WHERE fecha \>= CURRENT\_DATE;

\-- Mensajes no leídos (notificaciones)

CREATE INDEX idx\_mensajes\_receptor\_no\_leidos 

  ON mensajes(receptor\_id, esta\_leido) 

  WHERE esta\_leido \= false;

\-- Gamificación: Leaderboard

CREATE INDEX idx\_gamificacion\_puntos 

  ON gamificacion\_del\_usuario(points DESC, level DESC);

\-- Videos pendientes de analizar (worker queue)

CREATE INDEX idx\_videos\_pendientes 

  ON videos\_ejercicio(estado, creado\_en)

  WHERE estado IN ('subido', 'procesando');

\-- Full-text search en ejercicios

CREATE EXTENSION IF NOT EXISTS pg\_trgm;

CREATE INDEX idx\_ejercicios\_nombre\_trgm 

  ON ejercicios USING gin(nombre gin\_trgm\_ops);

\-- Auditoría reciente por tabla

CREATE INDEX idx\_audit\_tabla\_fecha 

  ON audit\_logs(tabla, creado\_en DESC);

**Impacto esperado:**

* ⚡ **60-80% reducción** en queries lentas  
* 🚀 **Dashboard 3x más rápido**  
* 📊 **Reportes complejos viables**

---

## **9\. TRIGGERS PENDIENTES CRÍTICOS**

### **9.1 🚨 Validación de Capacidad de Reservas**

CREATE OR REPLACE FUNCTION validar\_capacidad\_reserva()

RETURNS TRIGGER AS $$

DECLARE

  capacidad\_max INT;

  reservas\_count INT;

BEGIN

  \-- Obtener capacidad de la actividad

  SELECT a.capacidad\_maxima INTO capacidad\_max

  FROM horarios\_de\_clase hc

  JOIN actividades a ON hc.actividad\_id \= a.id

  WHERE hc.id \= NEW.horario\_clase\_id;


  \-- Contar reservas confirmadas

  SELECT COUNT(\*) INTO reservas\_count

  FROM reservas\_de\_clase

  WHERE horario\_clase\_id \= NEW.horario\_clase\_id

    AND fecha \= NEW.fecha

    AND estado \= 'reservada';


  IF reservas\_count \>= capacidad\_max THEN

    RAISE EXCEPTION 'Capacidad máxima alcanzada para esta clase (% / %)', 

      reservas\_count, capacidad\_max;

  END IF;


  RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger\_validar\_capacidad

  BEFORE INSERT ON reservas\_de\_clase

  FOR EACH ROW

  EXECUTE FUNCTION validar\_capacidad\_reserva();

---

### **9.2 ⚡ Actualización Automática de Gamificación**

CREATE OR REPLACE FUNCTION actualizar\_gamificacion\_asistencia()

RETURNS TRIGGER AS $$

DECLARE

  ultima\_asistencia DATE;

  nueva\_racha INT;

BEGIN

  \-- Obtener última asistencia

  SELECT MAX(DATE(entrada)) INTO ultima\_asistencia

  FROM asistencias

  WHERE usuario\_id \= NEW.usuario\_id

    AND DATE(entrada) \< DATE(NEW.entrada);


  \-- Calcular racha

  IF ultima\_asistencia \= DATE(NEW.entrada) \- INTERVAL '1 day' THEN

    nueva\_racha := (

      SELECT racha\_actual \+ 1 

      FROM gamificacion\_del\_usuario 

      WHERE usuario\_id \= NEW.usuario\_id

    );

  ELSE

    nueva\_racha := 1; \-- Resetea racha

  END IF;


  \-- Actualizar gamificación

  INSERT INTO gamificacion\_del\_usuario (

    usuario\_id, 

    points, 

    racha\_actual, 

    racha\_mas\_larga,

    fecha\_ultima\_actividad

  ) VALUES (

    NEW.usuario\_id,

    10, \-- 10 puntos por asistencia

    nueva\_racha,

    nueva\_racha,

    DATE(NEW.entrada)

  )

  ON CONFLICT (usuario\_id) DO UPDATE SET

    points \= gamificacion\_del\_usuario.points \+ 10,

    racha\_actual \= nueva\_racha,

    racha\_mas\_larga \= GREATEST(gamificacion\_del\_usuario.racha\_mas\_larga, nueva\_racha),

    fecha\_ultima\_actividad \= DATE(NEW.entrada),

    actualizado\_en \= NOW();


  RETURN NEW;

END;

$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger\_gamificacion\_asistencia

  AFTER INSERT ON asistencias

  FOR EACH ROW

  EXECUTE FUNCTION actualizar\_gamificacion\_asistencia();

---

## **10\. VISTAS MATERIALIZADAS (Dashboards)**

\-- Vista: Métricas mensuales por actividad

CREATE MATERIALIZED VIEW stats\_actividades\_mensuales AS

SELECT 

  a.nombre AS actividad,

  DATE\_TRUNC('month', r.fecha) AS mes,

  COUNT(\*) AS total\_reservas,

  COUNT(\*) FILTER (WHERE r.estado \= 'asistida') AS asistencias\_reales,

  ROUND(

    100.0 \* COUNT(\*) FILTER (WHERE r.estado \= 'asistida') / COUNT(\*),

    2

  ) AS tasa\_asistencia,

  COUNT(DISTINCT r.usuario\_id) AS usuarios\_unicos

FROM reservas\_de\_clase r

JOIN horarios\_de\_clase hc ON r.horario\_clase\_id \= hc.id

JOIN actividades a ON hc.actividad\_id \= a.id

GROUP BY a.nombre, mes

ORDER BY mes DESC, actividad;

CREATE INDEX idx\_stats\_actividades\_mes 

  ON stats\_actividades\_mensuales(mes DESC);

\-- Refrescar cada noche

\-- CRON JOB: REFRESH MATERIALIZED VIEW CONCURRENTLY stats\_actividades\_mensuales;

**Query de uso:**

\-- Dashboard admin: Actividades más populares este mes

SELECT 

  actividad,

  total\_reservas,

  asistencias\_reales,

  tasa\_asistencia || '%' AS tasa,

  usuarios\_unicos

FROM stats\_actividades\_mensuales

WHERE mes \= DATE\_TRUNC('month', CURRENT\_DATE)

ORDER BY total\_reservas DESC

LIMIT 5;

---

## **11\. INTEGRACIÓN CON IA \- ESPECIFICACIONES**

### **11.1 Pipeline de Análisis de Video**

// Backend: /api/coach/videos/analyze

interface VideoAnalysisRequest {

  videoId: string;

  ejercicioId?: string; // Opcional, ayuda al modelo

  prioridad?: 'normal' | 'alta';

}

interface VideoAnalysisResponse {

  status: 'queued' | 'processing' | 'completed' | 'failed';

  jobId: string;

  estimatedTime?: number; // segundos

}

// Worker Job (BullMQ)

async function processVideoAnalysis(jobData) {

  const video \= await getVideo(jobData.videoId);


  // 1\. Extraer frames clave

  const frames \= await extractKeyFrames(video.url\_video);


  // 2\. Análisis con Gemini Vision

  const prompt \= \`

    Analiza la técnica de ejecución del ejercicio "${video.ejercicio.nombre}".

    

    Evalúa:

    \- Postura (columna, cadera, rodillas)

    \- Rango de movimiento

    \- Tempo y control

    \- Seguridad (riesgo de lesión)

    

    Proporciona correcciones específicas con timestamps.

  \`;


  const analysis \= await geminiVision.analyze(frames, prompt);


  // 3\. Almacenar resultados

  await updateVideo(jobData.videoId, {

    estado: 'analizado',

    correcciones\_ia: analysis,

    puntaje\_confianza: analysis.confidence,

    procesado\_en: new Date()

  });


  // 4\. Notificar coach

  await notifyCoach(video.subido\_por, jobData.videoId);

}

---

### **11.2 Generación de Rutinas (Actualizado)**

**Prompt mejorado con equipamiento normalizado:**

async function generateRoutinePrompt(userId: string) {

  const user \= await getUser(userId);

  const goals \= await getUserGoals(userId);


  // NUEVO: Equipamiento disponible desde tabla normalizada

  const equipment \= await db.query(\`

    SELECT DISTINCT eq.nombre, eq.categoria

    FROM equipamiento eq

    WHERE eq.esta\_disponible \= true

    ORDER BY eq.categoria, eq.nombre

  \`);


  const prompt \= \`

    Genera una rutina de entrenamiento personalizada.

    

    \*\*Perfil del usuario:\*\*

    \- Objetivo: ${goals.objetivo\_principal}

    \- Nivel: ${user.nivel\_experiencia}

    \- Días disponibles: ${goals.frecuencia\_entrenamiento\_por\_semana}x/semana

    \- Duración por sesión: ${goals.tiempo\_por\_sesion\_minutos} minutos

    

    \*\*Restricciones médicas:\*\*

    ${user.informacion\_medica.lesiones || 'Ninguna'}

    

    \*\*Equipamiento disponible en el gimnasio:\*\*

    ${equipment.map(e \=\> \`- ${e.nombre} (${e.categoria})\`).join('\\n')}

    

    Usa SOLO el equipamiento listado.

    Estructura la rutina por días con ejercicios, series, repeticiones y descanso.

    Incluye progresión de carga para 8 semanas.

  \`;


  return prompt;

}

---

## **12\. ROADMAP ACTUALIZADO**

### **✅ Fase 1: MVP (COMPLETADO - 100%)**

* ✅ Autenticación y roles  
* ✅ Rutinas con IA  
* ✅ Clases y reservas  
* ✅ Gamificación base  
* ✅ Dashboard funcional

### **✅ Fase 2: Robustecimiento & Experiencia Elite (COMPLETADO - 100%)**

* ✅ Pipeline de IA Vision Lab (Video Análisis)
* ✅ Normalización de base de datos (Equipamiento, Auditoría)
* ✅ **Experiencia Elite: Nutrición & Bio-Evolución**
* ✅ **Gamificación Elite: Podios, Trofeos y Desafíos**
* ✅ **Training Experience: Tactical UI & Intelligence Hub**
* ✅ Visualización de datos (Analytics Engine v1.0)
* ✅ Índices de performance e infraestructura base

### **� Fase 3: Optimización & Engagement (Q2 2026 - INICIANDO)**

* ⏳ Chat en tiempo real (Supabase Realtime / WebSockets)
* ⏳ Notificaciones push PWA & Mobile Engagement
* ⏳ Panel de Control Admin/Coach Avanzado (Gestión Masiva)
* ⏳ Automatización de Marketing (Recordatorios de pago, Re-engagement)
* ⏳ Cobertura de Tests E2E (Cypress) y Calidad Continua

### **🚀 Fase 4: Escalado & Ecosistema (Q3-Q4 2026)**

* ⏰ Multi-gimnasio (Arquitectura Multi-tenant)
* ⏰ App móvil nativa (React Native / Expo)
* ⏰ Integración profunda con Wearables
* ⏰ Marketplace de Rutinas & Programas Premium

---

## **13. PENDIENTES DE VERIFICACIÓN Y DECISIONES (Depuración)**

*Esta sección centraliza los flecos de la Fase 2 y los puntos de decisión de la Fase 3.*

### **🤔 Decisiones Estratégicas (Requiere Alumno)**
- [/] **Prioridad Inmediata:** Seguimos con las **Notificaciones Push**.
- [ ] **Hoja de Ruta:** ¿Pasamos al Sprint 4 (QA y Refinamiento Final) o probamos estas nuevas funcionalidades primero?
- [ ] **Control de Flujo:** Revisar algo de este flujo primero antes de cerrar.

### **🧪 Verificación Técnica (QA)**
- [ ] **IA Vision:** Verificar precisión de Gemini 1.5 en videos de baja luz (videos oscuros).
- [ ] **Performance:** Test de estrés en `EvolutionCharts` con >100 registros (gráficos con muchos datos).
- [ ] **Mobile UX:** Revisar el ajuste visual y áreas de interacción en móviles muy pequeños (<360px).
- [ ] **Realtime:** Validar latencia de notificaciones en el Dashboard Header.
- [ ] **Base de Datos:** Verificar triggers de capacidad de reserva.

### **🎨 Feedback de Diseño (UI/UX)**
- [ ] **Visual Elite:** ¿Qué te parece esta nueva visual táctica? ¿Hay algún otro detalle de la UI que te gustaría pulir?

---

## **14. PRÓXIMOS PASOS INMEDIATOS (FASE 3 - INICIO)**

### **🔥 URGENTE (Próximo Sprint)**

1. ✅ **Chat Realtime:** Infraestructura básica y estética Elite completada.
2. 🚀 **Push Notifications:** Configurar Web Push API para alertas PWA (SIGUIENTE).
3. **Admin Hub Upgrade:** Llevar la estética Elite al panel del Coach/Admin (Intelligence Cards).

### **⚠️ CORTO PLAZO (2-4 Semanas)**

4. **Calidad de Código:** Cobertura de tests Cypress para flujos críticos (Login -> Entrenamiento).
5. **Optimización Visual:** Revisar assets de la Vitrina de Trofeos para performance.
6. **IA Analytics:** Refinar el motor de análisis biomecánico con más datos de entrenamiento.

### **📋 MEDIO PLAZO (1-2 Meses)**

7. **Automatización:** Sistema de recordatorios de pago y re-engagement automático.
8. **Wearables Beta:** Inicio de integración experimental con APIs de salud.
9. **PWA Avanzada:** Modo offline mejorado para visualización de rutinas sin datos.

---

## **15\. CHANGELOG DETALLADO**

| Fecha | Versión | Cambios Específicos |
| ----- | ----- | ----- |
| 2026-01-23 | **0.2.0** | ✅ Tabla `videos_ejercicio` ✅ Tabla `ejercicios_equipamiento` ✅ Tabla `audit_logs` ✅ Renombrar `rol_asistencia` ✅ Renombrar `notas_entrenador` ✅ Constraints JSONB ✅ Documentación robustecida |
| 2026-01-22 | 0.1.1 | RPD consolidado con SQL real |
| 2026-01-20 | 0.1.0 | Primera versión en producción |

---

## **16\. DECISIONES ARQUITECTÓNICAS (ARRs)**

### **ARR-001: ¿Por qué JSONB para `correcciones_ia`?**

**Decisión:** Usar JSONB en lugar de tabla normalizada.

**Contexto:**

* Estructura de análisis de IA puede evolucionar frecuentemente  
* Diferentes modelos de IA pueden devolver formatos distintos  
* Queries complejas no son necesarias (solo mostrar resultados)

**Ventajas:**

* ✅ Flexibilidad para cambiar estructura sin migración  
* ✅ Un solo roundtrip a BD para obtener análisis completo  
* ✅ Facilita versionado de respuestas IA

**Desventajas:**

* ❌ Queries de agregación complejas (ej: “promedio de puntaje técnico”)  
* ❌ Sin validación estricta de BD

**Mitigación:**

* Validación con Zod en backend  
* Constraint CHECK para campos obligatorios  
* Versión en el JSON para manejar cambios

---

### **ARR-002: ¿Tabla intermedia o ARRAY para equipamiento?**

**Decisión:** Ambas (migración gradual).

**Contexto:**

* MVP usaba ARRAY (simple y rápido)  
* Necesidad de reportes y alternativas surgió en producción

**Estrategia:**

1. **Ahora:** Crear `ejercicios_equipamiento` (nuevo código usa esto)  
2. **Corto plazo:** Migrar queries existentes  
3. **Medio plazo:** Deprecar columna ARRAY

**Ventajas:**

* ✅ Zero downtime en migración  
* ✅ Backward compatibility

---

### **ARR-003: ¿Auditoría genérica o por tabla?**

**Decisión:** Tabla `audit_logs` genérica.

**Razón:**

* Más fácil de mantener (un trigger aplicado a N tablas)  
* Queries centralizadas  
* Escalable a nuevas tablas sin cambios de schema

**Trade-off aceptado:**

* Pérdida de type-safety (JSONB para datos)  
* Mitigado con validación en capa de presentación

---

## **17\. APÉNDICE: SCRIPTS DE MIGRACIÓN**

### **A. Script Completo de Actualización 0.1.0 → 0.2.0**

\-- \============================================

\-- MIGRACIÓN 0.1.0 → 0.2.0 (VIRTUD GYM)

\-- Fecha: 2026-01-23

\-- Autor: Equipo Virtud

\-- \============================================

BEGIN;

\-- 1\. CREAR TABLAS NUEVAS

CREATE TABLE videos\_ejercicio (...); \-- Ver sección 4.1

CREATE TABLE ejercicios\_equipamiento (...); \-- Ver sección 4.2

CREATE TABLE audit\_logs (...); \-- Ver sección 4.3

\-- 2\. RENOMBRAR COLUMNAS

ALTER TABLE asistencias 

  RENAME COLUMN rol\_en\_el\_momento TO rol\_asistencia;

ALTER TABLE horarios\_de\_clase 

  RENAME COLUMN texto\_profesor TO notas\_entrenador;

\-- 3\. AGREGAR CONSTRAINTS

ALTER TABLE perfiles

  ADD CONSTRAINT check\_contacto\_emergencia

  CHECK (contacto\_emergencia IS NULL OR ...); \-- Ver sección 7.2

ALTER TABLE perfiles

  ADD CONSTRAINT check\_informacion\_medica

  CHECK (informacion\_medica IS NULL OR ...);

\-- 4\. POPULAR ejercicios\_equipamiento DESDE ARRAY

INSERT INTO ejercicios\_equipamiento (ejercicio\_id, equipamiento\_id)

SELECT 

  e.id,

  eq.id

FROM ejercicios e

CROSS JOIN LATERAL unnest(e.equipamiento) AS equip\_nombre

JOIN equipamiento eq ON eq.nombre \= equip\_nombre;

\-- 5\. CREAR ÍNDICES

CREATE INDEX idx\_videos\_usuario ON videos\_ejercicio(usuario\_id);

CREATE INDEX idx\_ejercicios\_equipamiento\_ejercicio ON ejercicios\_equipamiento(ejercicio\_id);

\-- ... (ver sección 8 para lista completa)

\-- 6\. HABILITAR RLS

ALTER TABLE videos\_ejercicio ENABLE ROW LEVEL SECURITY;

ALTER TABLE ejercicios\_equipamiento ENABLE ROW LEVEL SECURITY;

\-- ... (ver sección 7.1)

\-- 7\. CREAR TRIGGERS

CREATE TRIGGER trigger\_validar\_capacidad ...; \-- Ver sección 9.1

CREATE TRIGGER trigger\_gamificacion\_asistencia ...; \-- Ver sección 9.2

\-- 8\. CREAR VISTAS MATERIALIZADAS

CREATE MATERIALIZED VIEW stats\_actividades\_mensuales ...; \-- Ver sección 10

COMMIT;

---

## **18\. GLOSARIO TÉCNICO**

| Término | Definición |
| ----- | ----- |
| **ARR** | Architecture Decision Record \- Documento de decisión arquitectónica |
| **JSONB** | JSON Binary \- Formato binario de PostgreSQL para almacenar JSON |
| **RLS** | Row Level Security \- Seguridad a nivel de fila en PostgreSQL |
| **ENUM** | Tipo enumerado (USER-DEFINED) \- Lista cerrada de valores permitidos |
| **ARRAY** | Tipo de dato PostgreSQL para listas ordenadas |
| **MATERIALIZED VIEW** | Vista con datos precalculados y almacenados físicamente |
| **TRIGGER** | Función que se ejecuta automáticamente ante eventos de BD |

---

## **✅ CONCLUSIÓN**

Tu base de datos ha evolucionado de **MVP funcional** a **arquitectura robusta** lista para escalar. Los cambios implementados:

1. ✅ **Eliminan deuda técnica crítica** (tabla duplicada, nomenclatura)  
2. ✅ **Agregan funcionalidades enterprise** (auditoría, IA de video)  
3. ✅ **Mejoran performance** (normalización, índices planificados)  
4. ✅ **Refuerzan seguridad** (RLS, constraints, validaciones)

**Próximo paso crítico:** Implementar índices (sección 8\) y triggers (sección 9\) **antes de agregar más features**.

---

**Este documento es vivo. Actualizar con cada release.**

**Versión:** 0.2.0  
 **Última Actualización:** 23 de Enero de 2026  
 **Mantenido por:** Equipo Virtud Gym  
 **Próxima Revisión:** Post-implementación de índices

---

¿Querés que ahora genere?

1️⃣ **Script SQL ejecutable completo** con todas las migraciones  
 2️⃣ **Documentación de API** (Swagger/OpenAPI)  
 3️⃣ **Plan de testing** detallado (Jest \+ Cypress)  
 4️⃣ **Guía de deployment** (Vercel \+ Supabase)  
 5️⃣ **Backlog priorizado** (Jira/Linear ready)

Decime el número 💪

