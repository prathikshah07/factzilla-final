import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// This is the JSON structure we want the model to return.
const desiredJsonStructure = {
    verdict: "A concise verdict (e.g., TRUE, FALSE, MISLEADING, UNSUPPORTED).",
    confidence_score: "A confidence score for the verdict, between 0 and 100.",
    summary_explanation: "A brief, two-sentence summary of why the claim was rated this way."
};

// Main handler for the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { claim } = req.body;

    if (!claim) {
        return res.status(400).json({ error: 'Claim is required in the request body.' });
    }
    
    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "API_KEY environment variable not set on the server." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const systemInstruction = `You are an AI fact-checker. Your task is to analyze the following claim and determine its validity based on information from Google Search. You must respond with ONLY a single, raw JSON object in the specified format, with no other text, explanation, or markdown.

JSON Format to follow:
${JSON.stringify(desiredJsonStructure)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: claim }] }],
            config: {
                systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });
        
        const rawText = response.text;
        
        // The model might still add extra text. We extract just the JSON part.
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Raw text from AI that failed JSON match:", rawText);
            throw new Error('AI response did not contain a valid JSON object.');
        }

        const result = JSON.parse(jsonMatch[0]);
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return res.status(200).json({ result, sources });

    } catch (error: any) {
        console.error("Error in serverless function:", error);
        return res.status(500).json({ error: error.message || 'Failed to process the claim.' });
    }
}