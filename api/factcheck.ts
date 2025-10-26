import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Add a root endpoint for simple health checks
app.get('/', (req, res) => {
    res.send('Factzilla API server is running!');
});

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a meticulous fact-checking AI. Your purpose is to analyze a given claim, use the provided Google Search results to determine its veracity, and return a structured JSON response.

The JSON object you return must have the following structure and nothing else:
{
  "verdict": "string",
  "confidence_score": number,
  "summary_explanation": "string"
}

- "verdict": Must be one of the following strings: 'TRUE', 'FALSE', 'MISLEADING', 'UNSUPPORTED'.
- "confidence_score": Must be an integer between 0 and 100, representing your confidence in the verdict.
- "summary_explanation": A concise, neutral explanation for your verdict based on the search results.

Analyze the user's claim and provide your response ONLY in the specified JSON format. Do not include any other text, markdown, or explanations outside of the JSON object.

For example, for the claim "The sky is green", your response should be a single JSON object like this:
{
  "verdict": "FALSE",
  "confidence_score": 100,
  "summary_explanation": "Scientific evidence and common observation confirm that the Earth's sky appears blue during the day due to Rayleigh scattering of sunlight in the atmosphere. It is not green."
}`;


app.post('/api/factcheck', async (req, res) => {
    const { claim } = req.body;

    if (!claim) {
        return res.status(400).json({ error: 'Claim is required' });
    }
    if (!process.env.API_KEY || process.env.API_KEY === 'YOUR_API_KEY_HERE') {
        return res.status(500).json({ error: "API_KEY is not configured on the server." });
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: claim,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });

        // The response from the model contains the JSON string and grounding metadata
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks ?? [];
        const resultText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(resultText);

        res.json({ result, sources });

    } catch (error: any) {
        console.error("Error during Gemini API call:", error);
        res.status(500).json({ error: 'An unexpected error occurred while contacting the Gemini API.' });
    }
});


app.listen(port, () => {
    console.log(`Factzilla API server listening at http://localhost:${port}`);
    if (!process.env.API_KEY || process.env.API_KEY === "YOUR_API_KEY_HERE") {
        console.warn("\n\n================================================================");
        console.warn("⚠️  WARNING: Your Google Gemini API Key is not configured.");
        console.warn("================================================================\n");
        console.warn("The application will not work until you set up your API key.");
        console.warn("1. Create a file named '.env' in the project's root folder.");
        console.warn("2. Open '.env' and add the following line, replacing with your key:");
        console.warn('   API_KEY="YOUR_API_KEY_HERE"');
        console.warn("\n3. IMPORTANT: Stop and restart the server with 'npm run start:api'.\n");
    }
});