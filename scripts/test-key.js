
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

function getCleanKey() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return null;
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('GEMINI_API_KEY=')) {
            let key = line.split('=')[1];
            // Remove any surrounding quotes or spaces
            key = key.trim().replace(/^['"](.*)['"]$/, '$1').trim();
            return key;
        }
    }
    return null;
}

async function test() {
    const key = getCleanKey();
    if (!key) {
        console.log('KEY_NOT_FOUND');
        return;
    }
    console.log(`Testing key: ${key.substring(0, 5)}... (Length: ${key.length})`);
    const genAI = new GoogleGenerativeAI(key);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        await model.generateContent('test');
        console.log('SUCCESS: Key is valid');
    } catch (err) {
        console.log(`FAILURE: ${err.message}`);
    }
}

test();
