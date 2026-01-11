const { AIService } = require('../src/services/ai.service');

async function testPromptRobustness() {
    console.log('🧪 Probando robustez de AIService.buildPrompt...');
    const service = new AIService();

    const context = {
        studentProfile: { full_name: 'Test Student' },
        userGoal: { primary_goal: 'Pérdida de Peso' },
        gymEquipment: [{ name: 'Barra', category: 'Fuerza' }],
        templateKey: 'beginner' // Minúsculas (antes crasheaba)
    };

    try {
        const prompt = service.buildPrompt(context);
        console.log('✅ Prompt generado correctamente con key en minúsculas.');
        if (prompt.includes('ENFOQUE: PRINCIPIANTE')) {
            console.log('✅ Fallback/Normalización a BEGINNER exitosa.');
        }

        const promptInvalid = service.buildPrompt({ ...context, templateKey: 'INVALID_KEY' });
        console.log('✅ Prompt generado correctamente con key INVÁLIDA.');

        const promptNull = service.buildPrompt({ ...context, userGoal: null, templateKey: null });
        console.log('✅ Prompt generado correctamente con userGoal NULL.');

    } catch (e) {
        console.error('❌ Fallo en la prueba:', e.message);
    }
}

testPromptRobustness();
