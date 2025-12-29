/**
 * Script de migración de datos mock a Firestore
 * 
 * Ejecutar: node scripts/migrate-mock-data.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Datos mock directamente en el script (para evitar problemas de import)
const MOCK_STUDENTS = {
    'student_1': {
        nombre: 'Juan Pérez',
        edad: 28,
        experiencia: 'Intermedio',
        historialMedico: {
            lesiones: ['Rodilla izquierda'],
            restricciones: 'Evitar impacto alto en rodilla'
        }
    },
    'student_2': {
        nombre: 'María González',
        edad: 35,
        experiencia: 'Principiante',
        historialMedico: {
            lesiones: ['Lumbar'],
            restricciones: 'Evitar peso muerto y sentadillas profundas'
        }
    },
    'student_3': {
        nombre: 'Carlos Ruiz',
        edad: 42,
        experiencia: 'Avanzado',
        historialMedico: {
            lesiones: [],
            restricciones: 'Ninguna'
        }
    }
};

// Inicializar Firebase Admin (usar credenciales de servicio en producción)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    });
}

const db = admin.firestore();

/**
 * Migra los estudiantes mock a Firestore
 */
async function migrateStudents() {
    console.log('🚀 Iniciando migración de estudiantes...\n');

    const studentsRef = db.collection('usuarios');
    let migratedCount = 0;

    for (const [studentId, studentData] of Object.entries(MOCK_STUDENTS)) {
        try {
            await studentsRef.doc(studentId).set({
                ...studentData,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                role: 'member',
                active: true
            });

            console.log(`✅ Migrado: ${studentData.nombre} (${studentId})`);
            migratedCount++;
        } catch (error) {
            console.error(`❌ Error migrando ${studentId}:`, error.message);
        }
    }

    console.log(`\n🎉 Migración completada: ${migratedCount}/${Object.keys(MOCK_STUDENTS).length} estudiantes`);
}

/**
 * Ejecutar migración
 */
migrateStudents()
    .then(() => {
        console.log('\n✅ Script finalizado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error en migración:', error);
        process.exit(1);
    });
