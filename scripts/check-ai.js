
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

function getApiKey() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const lines = content.split('\n');
        for (let line of lines) {
            if (line.trim().startsWith('GEMINI_API_KEY=')) {
                return line.trim().substring('GEMINI_API_KEY='.length).replace(/['"]/g, '').trim();
            }
        }
    }
    return process.env.GEMINI_API_KEY;
}

async function check() {
    const apiKey = getApiKey();
    if (!apiKey) {
        console.log('RESULT: KEY_NOT_FOUND');
        return;
    }
    console.log(`Using Key: ${apiKey.substring(0, 5)}...`);
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = 'gemini-2.0-flash';
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Dí hola en una palabra');
        const response = await result.response;
        console.log(`RESULT: ${modelName} is WORKING. Response: ${response.text()}`);
    } catch (err) {
        console.log(`RESULT: ${modelName} FAILED with: ${err.message}`);
    }
}

check();
