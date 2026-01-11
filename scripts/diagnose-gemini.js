
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

function getApiKey() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim().startsWith('GEMINI_API_KEY=')) {
                return line.trim().substring('GEMINI_API_KEY='.length).replace(/['"]/g, '');
            }
        }
    }
    return process.env.GEMINI_API_KEY;
}

async function listModels() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY no encontrada.');
        return;
    }

    console.log(`🔑 API Key final detectada: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTry = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-2.0-flash-exp'
    ];

    for (const modelName of modelsToTry) {
        try {
            process.stdout.write(`📡 Probando [${modelName}]... `);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('ping');
            const response = await result.response;
            console.log(`✅ DISPONIBLE. (Respuesta: ${response.text().trim().substring(0, 10)})`);
        } catch (err) {
            console.log(`❌ ERROR: ${err.message}`);
        }
    }
}

listModels();
