require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function debugGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ No API KEY");
        return;
    }

    const client = new GoogleGenAI({ apiKey });
    // Use the user's preferred model to test functionality
    const modelName = "gemini-3-flash-preview";
    // const modelName = "gemini-3-flash-preview"; 

    console.log(`🤖 Testing with model: ${modelName}`);

    // Test 1: interactions.create (Current Implementation)
    console.log("\n--- TEST 1: interactions.create ---");
    try {
        if (client.interactions) {
            const result = await client.interactions.create({
                model: modelName,
                input: "Hola, ¿estás funcionando?",
                generation_config: {
                    // thinking_level: "high", // Testing if this is the breaker
                    temperature: 0.7
                }
            });
            console.log("✅ Interactions Success. Output type:", result.outputs?.[0]?.type);
            console.log("Text:", result.outputs?.[0]?.text);
        } else {
            console.log("⚠️ client.interactions is not available.");
        }
    } catch (e) {
        console.error("❌ Interactions Failed:");
        console.error(JSON.stringify(e, null, 2));
    }

    // Test 2: models.generateContent (Standard Implementation)
    console.log("\n--- TEST 2: models.generateContent ---");
    try {
        if (client.models) {
            const result = await client.models.generateContent({
                model: modelName,
                contents: "Hola, generame una rutina simple JSON.",
                config: {
                    response_mime_type: "application/json",
                    // response_schema: ... (omitted for brevity)
                }
            });
            console.log("✅ GenerateContent Success.");
            console.log("Text:", result.text()); // SDK dependent
        } else {
            console.log("⚠️ client.models is not available.");
        }
    } catch (e) {
        console.error("❌ GenerateContent Failed:");
        console.error(e.message || e);
    }
}

debugGemini();
