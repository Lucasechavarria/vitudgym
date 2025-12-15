// Test script para verificar VirtudCoach AI
const testRoutineGeneration = async () => {
    try {
        console.log('🧪 Testing VirtudCoach AI API...\n');

        const response = await fetch('http://localhost:3000/api/ai/generate-routine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test_token'
            },
            body: JSON.stringify({
                studentId: 'demo_user',
                goal: 'Hipertrofia',
                coachNotes: 'Enfocarse en piernas, evitar impacto en rodilla izquierda'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Rutina generada exitosamente!\n');
            console.log('📋 Nombre:', data.routine.routineName);
            console.log('💬 Frase:', data.routine.motivationalQuote);
            console.log('⏱️  Duración:', data.routine.duration);
            console.log('\n🔥 Calentamiento:', data.routine.warmup?.length || 0, 'ejercicios');
            console.log('💪 Entrenamiento:', data.routine.mainWorkout?.length || 0, 'ejercicios');
            console.log('🧘 Enfriamiento:', data.routine.cooldown?.length || 0, 'ejercicios');

            if (data.routine.medicalConsiderations) {
                console.log('\n⚠️  Consideraciones médicas:', data.routine.medicalConsiderations);
            }

            console.log('\n📝 Primer ejercicio:', data.routine.mainWorkout?.[0]?.name);
            console.log('   Equipamiento:', data.routine.mainWorkout?.[0]?.equipment);
        } else {
            console.error('❌ Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
};

testRoutineGeneration();
