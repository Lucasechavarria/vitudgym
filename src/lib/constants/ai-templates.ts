
/**
 * Prompt Templates for VirtudCoach AI
 * Each template provides specific instructions to Gemini for different training profiles.
 */

export const AI_PROMPT_TEMPLATES = {
    // ENFOQUE: FUERZA GENERAL
    STRENGTH: {
        id: 'strength',
        label: 'Fuerza General',
        description: 'Intermedio-Avanzado. Enfoque en ejercicios compuestos y progresión de cargas.',
        promptSuffix: `
            ENFOQUE: FUERZA GENERAL (STRENGTH).
            - Prioriza los "Big 3" (Sentadilla, Banca, Peso Muerto) y movimientos multiarticulares.
            - Rango de repeticiones: 3-6 para fuerza máxima, 6-8 para accesorios.
            - Descansos largos (2-3 min) entre series pesadas.
            - Incluye progresión de carga o RPE sugerido.
        `
    },
    // ENFOQUE: HIPERTROFIA
    HYPERTROPHY: {
        id: 'hypertrophy',
        label: 'Hipertrofia',
        description: 'Avanzado. Volumen alto y estrés metabólico para máximo crecimiento.',
        promptSuffix: `
            ENFOQUE: HIPERTROFIA (BODYBUILDING).
            - Volumen alto: 12-20 series por grupo muscular semanal.
            - Rango de repeticiones: 8-12 o 12-15 para aislamiento.
            - Técnicas de intensidad: Dropsets, Supersets o Myo-reps sugeridas.
            - Énfasis en la conexión mente-músculo y tiempo bajo tensión.
        `
    },
    // ENFOQUE: FUNCIONAL
    FUNCTIONAL: {
        id: 'functional',
        label: 'Funcional',
        description: 'Todos los niveles. Movimientos naturales, CrossFit y HIIT.',
        promptSuffix: `
            ENFOQUE: ENTRENAMIENTO FUNCIONAL / CROSSFIT.
            - Combina fuerza metabólica con habilidades gimnásticas y de levantamiento.
            - Incluye formatos como AMRAP, EMOM o For Time.
            - Movimientos multiplanares que mejoren la vida diaria.
            - Enfoque en core y estabilidad dinámica.
        `
    },
    // ENFOQUE: PRINCIPIANTE
    BEGINNER: {
        id: 'beginner',
        label: 'Principiante',
        description: 'Ideal para quienes inician. Full Body y aprendizaje técnico.',
        promptSuffix: `
            ENFOQUE: PRINCIPIANTE (FUNDAMENTOS).
            - Rutinas tipo Full Body 3 veces por semana.
            - Prioriza máquinas de palanca y ejercicios básicos con técnica simplificada.
            - Volumen moderado para evitar sobreentrenamiento.
            - Instrucciones técnicas detalladas en cada ejercicio.
        `
    },
    // ENFOQUE: ATLÉTICO
    ATHLETIC: {
        id: 'athletic',
        label: 'Atlético',
        description: 'Avanzado. Potencia explosiva, pliometría y agilidad.',
        promptSuffix: `
            ENFOQUE: ENTRENAMIENTO ATLÉTICO Y POTENCIA.
            - Incluye ejercicios pliométricos (saltos, lanzamientos).
            - Enfoque en la fase concéntrica explosiva.
            - Trabajo de agilidad, sprints y cambios de dirección.
            - Ejercicios de cadena posterior para velocidad.
        `
    },
    // ENFOQUE: CALISTENIA
    BODYWEIGHT: {
        id: 'bodyweight',
        label: 'Calistenia',
        description: 'Sin equipo. Calistenia para casa o parque.',
        promptSuffix: `
            ENFOQUE: CALISTENIA / BODYWEIGHT.
            - Usa exclusivamente el peso del cuerpo (o barras/paralelas).
            - Progresiones de ejercicios (ej: de flexiones de rodillas a diamante).
            - Enfoque en control isométrico y movilidad.
            - Ideal para entrenamiento en cualquier lugar.
        `
    },
    // ENFOQUE: POWERLIFTING
    POWERLIFTING: {
        id: 'powerlifting',
        label: 'Powerlifting',
        description: 'Avanzado. Especialización en Sentadilla, Banca y Peso Muerto.',
        promptSuffix: `
            ENFOQUE: POWERLIFTING COMPETITIVO.
            - Estructura específica alrededor de los movimientos de competición.
            - Periodización de carga (peak weeks).
            - Accesorios específicos para corregir puntos débiles en el levantamiento.
            - Enfoque en técnica reglamentaria (pausas, profundidad).
        `
    },
    // ENFOQUE: RESISTENCIA
    ENDURANCE: {
        id: 'endurance',
        label: 'Resistencia',
        description: 'Intermedio. Mejora cardiovascular y resistencia muscular.',
        promptSuffix: `
            ENFOQUE: RESISTENCIA Y ACONDICIONAMIENTO.
            - Circuitos de alta repetición (15-20+).
            - Intervalos de descanso cortos (30s o menos).
            - Mezcla de cardio estable e intervalos de alta intensidad.
            - Enfoque en capacidad pulmonar y fatiga controlada.
        `
    },
    // ENFOQUE: ADULTOS MAYORES (SENIOR)
    SENIOR: {
        id: 'senior',
        label: 'Adultos Mayores',
        description: 'Salud, movilidad, equilibrio y mantenimiento de masa muscular.',
        promptSuffix: `
            ENFOQUE: ADULTO MAYOR (ACTIVE AGING).
            - Prioriza la SEGURIDAD y el EQUILIBRIO.
            - Ejercicios para prevenir sarcopenia y mejorar densidad ósea.
            - Bajos impactos articulares, evita saltos o movimientos bruscos.
            - Incluye ejercicios de movilidad articular y flexibilidad.
        `
    },
    // ENFOQUE: DEPORTISTA DE COMBATE (COMBAT)
    COMBAT: {
        id: 'combat',
        label: 'Deportista de Combate',
        description: 'MMA, Boxeo, BJJ, Judo, Taekwondo, Kung Fu. Explosividad, cuello, core y resistencia.',
        promptSuffix: `
            ENFOQUE: COMBATE (MMA/BOXEO/BJJ/JUDO/TAEKWONDO/KUNG FU).
            - Trabajo de cuello y core antirotacional.
            - Explosividad en empuje y tracción.
            - Resistencia metabólica por "rounds" o intervalos explosivos.
            - Fuerza isométrica (clinch/grappling) y agarre.
        `
    },
    // ENFOQUE: REHABILITACIÓN (REHAB)
    REHAB: {
        id: 'rehab',
        label: 'Rehabilitación',
        description: 'Post-lesión o patologías. Biomecánica estricta para recuperación.',
        promptSuffix: `
            ENFOQUE: REHABILITACIÓN Y SALUD.
            - Isométricos iniciales y progresiones excéntricas.
            - Estricto control de la biomecánica.
            - Evita rangos de movimiento dolorosos, PERO busca que el rango articular se amplifique al máximo posible de forma segura.
            - Enfoque en fortalecer estabilizadores y músculos débiles post-lesión.
        `
    }
};

export type AITemplateKey = keyof typeof AI_PROMPT_TEMPLATES;
