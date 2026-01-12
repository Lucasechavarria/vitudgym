require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');
const process = require('process');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    // Try to import GoogleGenAI. If it fails, maybe it's not exported that way.
    console.log("SDK imported. Client init...");

    // Check if it's the right SDK
    // @google/genai usually exports GenAIClient or similar if it's the Vertex one?
    // But checked package.json -> @google/genai ^0.1.x

    const client = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    try {
        console.log("Testing model:", model);
        if (client.interactions) {
            console.log("client.interactions exists. Calling create...");
            const interaction = await client.interactions.create({
                model: model,
                input: { role: 'user', content: 'Hello' }, // Try object format or string
                // input: "Hello"
                generation_config: {
                    thinking_level: 'high'
                }
            });
            console.log("Interaction result outputs:", interaction.outputs);
        } else {
            console.log("client.interactions is undefined. This SDK does not support 'interactions'.");
            console.log("Available properties on client:", Object.keys(client));
        }
    } catch (e) {
        console.error("Error during test:", e);
    }
}

testGemini();
