/**
 * Equipamiento disponible en Virtud Centro de Entrenamiento
 */
export const GYM_EQUIPMENT = [
    'Barras olímpicas',
    'Discos (2.5kg - 25kg)',
    'Mancuernas (2kg - 50kg)',
    'Kettlebells (8kg - 32kg)',
    'Rack de sentadillas',
    'Banco plano y ajustable',
    'Remo bajo',
    'Polea alta/baja',
    'Cinta de correr',
    'Bicicleta estática',
    'Rower (remo)',
    'Assault bike',
    'Cajón pliométrico',
    'Cuerdas de batalla',
    'Bandas elásticas',
    'TRX',
    'Colchonetas',
    'Foam roller',
    'Balón medicinal'
] as const;

/**
 * Datos mock de alumnos para testing
 * En producción estos vendrían de Firestore
 */
export const MOCK_STUDENTS = {
    'student_1': {
        nombre: 'Juan Pérez',
        edad: 28,
        peso: 75,
        altura: 175,
        experiencia: 'Intermedio',
        historialMedico: {
            lesiones: ['Rodilla izquierda (menisco)'],
            patologias: [],
            cirugias: [],
            medicacion: 'Ninguna',
            restricciones: 'Evitar impacto alto en rodilla izquierda'
        }
    },
    'student_2': {
        nombre: 'María González',
        edad: 35,
        peso: 62,
        altura: 165,
        experiencia: 'Principiante',
        historialMedico: {
            lesiones: ['Lumbar (hernia L4-L5)'],
            patologias: [],
            cirugias: [],
            medicacion: 'Ninguna',
            restricciones: 'Evitar flexión lumbar excesiva'
        }
    },
    'student_3': {
        nombre: 'Carlos Ruiz',
        edad: 42,
        peso: 88,
        altura: 180,
        experiencia: 'Avanzado',
        historialMedico: {
            lesiones: [],
            patologias: [],
            cirugias: [],
            medicacion: 'Ninguna',
            restricciones: 'Ninguna'
        }
    }
} as const;

/**
 * Objetivos de entrenamiento disponibles
 */
export const TRAINING_GOALS = [
    'Hipertrofia',
    'Fuerza General',
    'Fuerza Máxima',
    'Powerlifting',
    'Atlético',
    'Funcional',
    'Resistencia',
    'Calistenia',
    'Principiante',
    'Adultos Mayores',
    'Deporte de Combate',
    'Rehabilitación',
    'Pérdida de Peso',
    'Movilidad'
] as const;
