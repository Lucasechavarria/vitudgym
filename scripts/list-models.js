
const fs = require('fs');
const path = require('path');
const https = require('https');

function getCleanKey() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return null;
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('GEMINI_API_KEY=')) {
            let key = line.split('=')[1];
            key = key.trim().replace(/^['"](.*)['"]$/, '$1').trim();
            return key;
        }
    }
    return null;
}

const key = getCleanKey();
if (!key) {
    console.log('KEY_NOT_FOUND');
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log('AVAILABLE_MODELS:');
                json.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log('ERROR_RESPONSE:', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.log('PARSE_ERROR:', data);
        }
    });
}).on('error', (err) => {
    console.log('REQUEST_ERROR:', err.message);
});
