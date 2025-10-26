import { GoogleGenAI } from '@google/genai';
import type { VerificationResult, GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

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

Analyze the user's claim and provide your response ONLY in the specified JSON format. Do not include any other text, markdown, or explanations outside of the JSON object.`;

export async function performFactCheck(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: claim,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks ?? [];
        
        // Clean the raw text response to ensure it's a valid JSON string
        let resultText = response.text.trim();
        if (resultText.startsWith('```json')) {
            resultText = resultText.substring(7, resultText.length - 3).trim();
        } else if (resultText.startsWith('```')) {
             // FIX: Used `resultText.length` instead of `result.length` to avoid using `result` before declaration and using the correct string.
             resultText = resultText.substring(3, resultText.length - 3).trim();
        }


        if (!resultText) {
            throw new Error("The API returned an empty response. The claim might be un-verifiable.");
        }

        const result: VerificationResult = JSON.parse(resultText);

        if (!result.verdict || result.confidence_score === undefined || !result.summary_explanation) {
             throw new Error("The API response was missing required fields.");
        }

        return { result, sources };

    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse the API response. The model may have returned an invalid format.");
        }
        throw new Error(error.message || 'An unknown error occurred during fact-checking.');
    }
}