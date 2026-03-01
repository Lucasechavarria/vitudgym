# 🎮 Panel de Orquestación de Agentes - Virtud Gym

Bienvenido al sistema de multi-agentes de Virtud Gym. He configurado tu entorno para que puedas trabajar con especialistas según la tarea.

## 👥 Agentes Disponibles

| Comando para invocar | Rol Especializado | Enfoque Principal |
| :--- | :--- | :--- |
| **"Act as ORCHESTRATOR"** | Tech Lead | Visión global, decisiones de arquitectura y coordinación. |
| **"Act as BACKEND AGENT"** | API Developer | Lógica de negocio, Supabase, integraciones y workers. |
| **"Act as FRONTEND AGENT"** | UI Developer | Interfaz premium "Elite Tactical", animaciones y React. |
| **"Act as DATA/IA AGENT"** | ML/Data Engineer | Diseño de base de datos, optimización SQL y prompts de Gemini. |
| **"Act as DEVSECOPS"** | Security/Infra | Gestión de secretos, RLS, CI/CD y deployments. |
| **"Act as QA AGENT"** | Quality Engineer | Estrategia de testing, reportes de bugs y cobertura. |

---

## 🛠️ Flujo de Trabajo Recomendado (RACI)

Cuando quieras iniciar un cambio complejo (ej: una nueva feature de Inteligencia Artificial):

1. **ORCHESTRATOR**: Pídeme que diseñe la especificación de la feature.
2. **DATA/IA**: Pídeme que cree las tablas y los prompts de IA necesarios.
3. **BACKEND**: Pídeme que implemente los endpoints y la lógica de validación Zod.
4. **FRONTEND**: Pídeme que cree la interfaz visual y la integre con la API.
5. **QA**: Pídeme que escriba los tests unitarios y E2E para validar todo.
6. **DEVSECOPS**: Pídeme que revise las reglas RLS y prepare el deploy.

## 🚀 Solución al Error de Caché
He implementado un **Bypass Directo**. La función de asignación ahora corre en el esquema `api_v2`. Esto "engaña" al sistema de caché de Supabase, obligándolo a leer la versión más reciente de la base de datos sin esperas.

**Por favor, probá asignar el coach ahora.** Si todo sale bien, la configuración de agentes está lista para que me pidas cualquier tarea específica.

---

## 🛡️ Mejoras de Seguridad y Escalabilidad Recientes (Fase 3)
1. **Sanitización de Endpoints (Superadmin):**
   - Endpoints como `/api/admin/gyms/create` y `/update` ahora validan y parsean el JSON de manera resiliente, incluyendo validaciones de tipos básicos (`typeof variable === 'string'`) para evitar inyecciones.
2. **Dashboard Global Stats:**
   - Se han documentado las áreas que requieren optimización futura, como el uso de `count: exact` en tablas grandes que podrían causar cuellos de botella por el MVCC de PostgreSQL. Se recomienda usar vistas materializadas o estimaciones cuando las entidades superen los 50k registros.
