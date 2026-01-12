const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Fetching models from: https://generativelanguage.googleapis.com/v1beta/models?key=HIDDEN`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`Error: Status Code ${res.statusCode}`);
            console.error(data);
            return;
        }

        const fs = require('fs');

        // ... (inside res.on('end'))
        try {
            const parsed = JSON.parse(data);
            fs.writeFileSync('models.json', JSON.stringify(parsed, null, 2));
            console.log("Models saved to models.json");
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });

}).on('error', (err) => {
    console.error("Network Error:", err.message);
});
