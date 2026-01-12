require('dotenv').config({ path: '.env.local' });

async function listModels() {
    console.log("--- Testing @google/genai (Current Project Usage) ---");
    try {
        const { GoogleGenAI } = require('@google/genai');
        const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Try to verify availability by a simple generation or listing if available
        // The error message said "Call ListModels to see..."
        // Does this SDK have listModels?
        if (client.models && client.models.list) {
            console.log("Calling client.models.list()...");
            const response = await client.models.list();
            console.log("Models found via @google/genai:");
            response.models.forEach(m => console.log(` - ${m.name}`));
        } else if (client.getGenerativeModel) {
            // This looks like the OTHER SDK signature?
            console.log("Client has getGenerativeModel. Trying to list using a different method?");
        } else {
            console.log("SDK structure is unclear. Keys:", Object.keys(client));
        }

    } catch (e) {
        console.error("Error with @google/genai:", e.message);
    }

    console.log("\n--- Testing @google/generative-ai (Alternative/Standard SDK) ---");
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Not sure if listModels is directly on genAI or via manager
        // usually it's not exposed easily in the helper, but let's try a generation
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello");
        console.log("Standard SDK Generation Success:", result.response.text());
    } catch (e) {
        console.error("Error with @google/generative-ai:", e.message);
    }
}

listModels();
