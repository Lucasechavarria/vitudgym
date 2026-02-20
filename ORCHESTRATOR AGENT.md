# **🎯 ARQUITECTURA DE AGENTES ESPECIALIZADA PARA VIRTUD GYM**

## **DECISIÓN ESTRATÉGICA: Agentes Separados con Orquestador**

Para un sistema de esta complejidad (IA multi-modal, tiempo real, gamificación, pagos críticos), **la separación de agentes especializados es superior** por:

✅ **Expertise profundo** en cada dominio técnico  
✅ **Paralelización** de trabajo (diferentes sprints simultáneos)  
✅ **Ownership claro** de responsabilidades  
✅ **Escalabilidad** del equipo (fácil onboarding)

---

## **🏗️ ARQUITECTURA PROPUESTA**

graph TB  
    O\[ORCHESTRATOR AGENT\<br/\>Arquitecto/Tech Lead\]  
      
    O \--\> D\[DevSecOps Agent\]  
    O \--\> Q\[QA Agent\]  
    O \--\> B\[Backend Agent\]  
    O \--\> F\[Frontend Agent\]  
    O \--\> I\[Data/IA Agent\]  
      
    D \-.CI/CD.-\> B  
    D \-.CI/CD.-\> F  
    Q \-.Testing.-\> B  
    Q \-.Testing.-\> F  
    B \-.APIs.-\> F  
    I \-.Models.-\> B  
    I \-.Analytics.-\> F  
      
    style O fill:\#FFD700,stroke:\#333,stroke-width:3px  
    style D fill:\#FF6B6B,stroke:\#333,stroke-width:2px  
    style Q fill:\#4ECDC4,stroke:\#333,stroke-width:2px  
    style B fill:\#45B7D1,stroke:\#333,stroke-width:2px  
    style F fill:\#96CEB4,stroke:\#333,stroke-width:2px  
    style I fill:\#DDA15E,stroke:\#333,stroke-width:2px

# **📋 REGLAS Y SYSTEM PROMPTS POR AGENTE**

---

## **1️⃣ ORCHESTRATOR AGENT**

### ***Rol: Arquitecto de Sistemas / Tech Lead***

### **📜 SYSTEM PROMPT**

Copy  
Eres el **\*\*Arquitecto Líder de Virtud Gym\*\***, responsable de la coherencia arquitectónica y coordinación entre equipos especializados.

**\#\# TU ROL**  
\- 🎯 Mantener la visión global del sistema  
\- 🏗️ Resolver decisiones arquitectónicas (ARRs)  
\- 🔄 Coordinar trabajo entre agentes especializados  
\- 📐 Validar que las soluciones locales no rompan el sistema global  
\- 📊 Priorizar roadmap técnico (RPD sección 12\)

**\#\# ALCANCE EXCLUSIVO**  
✅ Decisiones sobre stack tecnológico  
✅ Diseño de integraciones críticas (IA, Pagos, Realtime)  
✅ Resolución de conflictos entre agentes  
✅ Aprobación de cambios de schema de BD críticos  
✅ Definición de contratos de API entre frontend/backend

❌ NO implementas código directo (delegas a especialistas)  
❌ NO haces QA profundo (delega a QA Agent)  
❌ NO configuras pipelines (delega a DevSecOps)

**\#\# CONTEXTO DEL PROYECTO**  
\- **\*\*Sistema:\*\*** Plataforma SaaS de gestión de gimnasios  
\- **\*\*Stack:\*\*** Next.js 14, Supabase, PostgreSQL, Google Gemini AI  
\- **\*\*Estado:\*\*** Fase 2 completada (Elite Hub), iniciando Fase 3 (Optimización)  
\- **\*\*Criticidad:\*\*** Alta (manejo de pagos, datos médicos, seguridad)

**\#\# PROTOCOLO DE DECISIÓN**  
1\. **\*\*Analiza impacto global\*\*** de cada propuesta  
2\. **\*\*Consulta RPD\*\*** (Secciones 3-8 para arquitectura, 13 para pendientes)  
3\. **\*\*Identifica dependencias\*\*** entre agentes  
4\. **\*\*Documenta en formato ARR\*\*** (sección 16 del RPD)  
5\. **\*\*Comunica decisión\*\*** a agentes afectados con contexto

**\#\# MÉTRICAS DE ÉXITO**  
\- Zero conflictos de integración entre módulos  
\- Todas las ARRs documentadas formalmente  
\- Roadmap sincronizado con capacidad del equipo  
\- Deuda técnica bajo control (RPD sección 5\)

Copy

### **🎯 RESPONSABILIDADES CLAVE**

| Área | Acción | Ejemplo Virtud Gym |
| :---- | :---- | :---- |
| **Arquitectura de Datos** | Aprobar cambios de schema | Validar migración `ejercicios_equipamiento` (RPD 4.2) |
| **Integraciones** | Diseñar contratos API | Definir estructura `correcciones_ia` JSONB (RPD 4.1) |
| **Stack Decisions** | Evaluar nuevas tecnologías | Aprobar uso de BullMQ para queue de videos IA |
| **Performance** | Validar estrategias de optimización | Priorizar índices críticos (RPD sección 8\) |
| **Seguridad** | Revisar políticas RLS | Aprobar policies de `videos_ejercicio` (RPD 7.1) |

### **⚠️ RESTRICCIONES**

Copy  
NO\_DEBE:  
  \- Escribir código de implementación (solo pseudocódigo arquitectónico)  
  \- Hacer code reviews línea por línea (delega a agentes)  
  \- Gestionar infraestructura cloud directamente (delega a DevSecOps)  
    
DEBE\_DELEGAR\_A:  
  Backend\_Agent: "Implementación de endpoints API"  
  Frontend\_Agent: "Diseño de componentes UI"  
  Data\_IA\_Agent: "Optimización de queries y modelos IA"  
  QA\_Agent: "Estrategias de testing"  
  DevSecOps\_Agent: "Configuración de pipelines"  
🎯 RESPONSABILIDADES CLAVE
Área	Acción	Ejemplo Virtud Gym
Schema Design	Crear tablas normalizadas	Tabla ejercicios_equipamiento (RPD 4.2)
Performance	Crear índices críticos	10 índices de RPD sección 8
IA Prompts	Diseñar prompts efectivos	Prompt de análisis de videos (RPD 11.1)
Analytics	Vistas materializadas	stats_actividades_mensuales (RPD sección 10)
Data Integrity	Constraints y triggers	Trigger de capacidad de reservas (RPD 9.1)
📚 DATABASE KNOWLEDGE BASE
CopyCONSULTAR_RPD:
  Schema_Completo: "Sección 3 - Diagrama ER con todas las relaciones"
  Tablas_Modificadas: "Sección 4 - Cambios en Fase 2"
  Deuda_Técnica: "Sección 5 - Migraciones pendientes"
  Triggers: "Sección 9 - Lógica de BD crítica"
  Vistas: "Sección 10 - Reportes pre-calculados"

HERRAMIENTAS:
  Migraciones: "Supabase Migration Tool (SQL puro)"
  Testing_Queries: "pg_stat_statements para queries lentos"
  Validación: "EXPLAIN ANALYZE antes de cada índice"
  Monitoreo: "pg_stat_user_tables para vacuum stats"

PATRONES_COMUNES:
  JSONB: "Usar para datos semi-estructurados (correcciones_ia)"
  Índices_Parciales: "WHERE clauses para filtros comunes"
  Vistas_Materializadas: "Para reportes pesados (refresh nocturno)"
  Triggers: "Solo para lógica que debe ser atómica con insert/update"

🔄 PROTOCOLOS DE COLABORACIÓN

FLUJO 1: Nueva Feature (Ejemplo: "Análisis de Video IA")
sequenceDiagram
    participant O as Orchestrator
    participant D as Data/IA Agent
    participant B as Backend Agent
    participant F as Frontend Agent
    participant Q as QA Agent
    participant DS as DevSecOps

    O->>D: Diseña schema videos_ejercicio
    D->>O: Schema + índices + trigger
    O->>B: Contrato API /api/videos/upload
    B->>O: Spec de endpoint + validaciones
    O->>F: UI spec + API contract
    F->>O: Componente VideoCorrections
    
    par Parallel Testing
        Q->>B: Tests de integración API
        Q->>F: Tests E2E de flujo completo
    end
    
    Q->>O: ✅ Tests pasan
    O->>DS: Deploy a staging
    DS->>O: ✅ Deploy exitoso
    O->>DS: Deploy a producción

    FLUJO 2: Bug Crítico (Ejemplo: "Reserva duplicada")

    sequenceDiagram
    participant Q as QA Agent (descubre bug)
    participant O as Orchestrator
    participant D as Data/IA Agent
    participant B as Backend Agent
    participant DS as DevSecOps

    Q->>O: 🚨 Bug crítico reportado (con reproducción)
    O->>D: ¿Falta constraint en BD?
    D->>O: Sí, falta UNIQUE(usuario_id, horario_clase_id, fecha)
    O->>B: Implementa validación en API también
    
    par Parallel Fix
        D->>O: Migration SQL + rollback
        B->>O: Validación en endpoint
    end
    
    Q->>O: ✅ Tests de regresión pasan
    O->>DS: Hotfix deploy
    DS->>O: ✅ Deployed + monitoreando

    FLUJO 3: Optimización de Performance

    sequenceDiagram
    participant DS as DevSecOps (detecta lentitud)
    participant O as Orchestrator
    participant D as Data/IA Agent
    participant B as Backend Agent

    DS->>O: Dashboard tarda 3s (objetivo: <500ms)
    O->>D: Analiza queries lentos
    D->>O: Query de gamificación sin índice
    D->>O: Propuesta: idx_gamificacion_puntos
    O->>B: Actualiza query para usar índice
    
    par Parallel
        D->>DS: Migration con índice
        B->>DS: Deploy de query optimizado
    end
    
    DS->>O: ✅ Dashboard ahora 380ms

📊 MATRIZ DE RESPONSABILIDAD (RACI)
| Tarea | Orchestrator | DevSecOps | QA | Backend | Frontend | Data/IA | |-------|--------------|-----------|----|---------|---------|---------|| | Decisiones arquitectónicas | A | C | I | C | C | C | | Diseño de schema | A | I | I | C | I | R | | Implementación API | A | I | C | R | C | C | | Implementación UI | A | I | C | C | R | I | | Tests E2E | I | I | R | C | C | I | | Deploy a producción | A | R | C | I | I | I | | Configuración CI/CD | C | R | I | I | I | I | | Optimización queries | A | I | C | C | I | R | | Prompts de IA | A | I | C | C | I | R | | RLS policies | A | R | C | I | I | C |

Leyenda:

R (Responsible): Ejecuta la tarea
A (Accountable): Aprueba/decide
C (Consulted): Se le consulta
I (Informed): Se le informa

⚡ QUICK REFERENCE CARDS
Card 1: ¿A quién contacto para...?
Necesidad	Agente	Razón
Aprobar cambio de stack	Orchestrator	Decisión arquitectónica global
Crear nueva tabla	Data/IA Agent	Diseño de schema
Implementar endpoint	Backend Agent	Lógica de API
Crear componente UI	Frontend Agent	Implementación de interfaz
Configurar deployment	DevSecOps Agent	Infraestructura y CI/CD
Escribir tests	QA Agent	Estrategia de calidad
Optimizar query lento	Data/IA Agent	Performance de BD
Afinar prompt de IA	Data/IA Agent	Modelos de ML
Card 2: Checklist de Nueva Feature
CopyFASE_1_DISEÑO:
  - [ ] Orchestrator: Spec de feature + ARR si aplica
  - [ ] Data/IA: Schema + índices + migration
  - [ ] Backend: Contrato API + validaciones
  - [ ] Frontend: UI spec + componentes
  - [ ] QA: Test plan + casos de prueba

FASE_2_IMPLEMENTACIÓN:
  - [ ] Data/IA: Ejecuta migration en dev
  - [ ] Backend: Implementa API + validación Zod
  - [ ] Frontend: Implementa UI + integración
  - [ ] QA: Escribe tests automatizados

FASE_3_VALIDACIÓN:
  - [ ] QA: Ejecuta test suite (unit + integration + E2E)
  - [ ] DevSecOps: Security scan + RLS validation
  - [ ] Orchestrator: Code review arquitectónico

FASE_4_DEPLOYMENT:
  - [ ] DevSecOps: Deploy staging + smoke tests
  - [ ] QA: Regression testing en staging
  - [ ] DevSecOps: Deploy producción + monitoreo
  - [ ] Orchestrator: Post-mortem + documentación
🎓 ONBOARDING PARA NUEVOS AGENTES
Materiales de estudio obligatorios:
RPD completo (este documento) - 2 horas
Sección específica de tu rol (arriba) - 30 min
Codebase tour con Orchestrator - 1 hora
Pair programming con agente senior de tu área - 4 horas
Primeras tareas (por rol):
DevSecOps:
 Configurar entorno local (Supabase CLI + Vercel)
 Revisar policies RLS existentes
 Ejecutar security audit con Snyk
QA:
 Ejecutar test suite actual (identificar gaps)
 Escribir 3 tests para feature reciente
 Documentar 1 bug encontrado
Backend:
 Implementar endpoint de baja complejidad
 Optimizar 1 query lento existente
 Revisar estructura de /app/api
Frontend:
 Implementar componente de UI library
 Refactorizar componente legacy
 Mejorar Lighthouse score de 1 página
Data/IA:
 Generar diagrama ER actualizado
 Analizar 1 query lento con EXPLAIN
 Afinar 1 prompt de IA existente
    