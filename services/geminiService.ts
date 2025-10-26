import { GoogleGenAI } from "@google/genai";
import type { VerificationResult, GroundingChunk } from '../types';

/**
 * Performs a fact check using the Google Gemini API with Google Search grounding.
 * @param claim The claim string to be verified.
 * @returns A promise that resolves with the verification result and sources.
 */
export async function performFactCheck(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured. Please see the instructions in the README.");
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

Analyze the user's claim and provide your response ONLY in the specified JSON format. Do not include any other text, markdown, or explanations outside of the JSON object.

For example, for the claim "The sky is green", your response should be a single JSON object like this:
{
  "verdict": "FALSE",
  "confidence_score": 100,
  "summary_explanation": "Scientific evidence and common observation confirm that the Earth's sky appears blue during the day due to Rayleigh scattering of sunlight in the atmosphere. It is not green."
}`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: claim,
        config: {
            systemInstruction: systemInstruction,
            tools: [{googleSearch: {}}],
        },
    });

    // Attempt to parse the JSON from the model's text response
    let result: VerificationResult;
    try {
        // Clean the response text to ensure it's valid JSON
        const jsonText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        result = JSON.parse(jsonText);
    } catch (parseError) {
        console.error("Failed to parse JSON from model response:", response.text);
        throw new Error("The model returned an invalid response format. Please try again.");
    }
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks ?? [];

    // Basic validation of the parsed result
    if (!result.verdict || result.confidence_score === undefined || !result.summary_explanation) {
         throw new Error("The model's response was missing required fields.");
    }

    return { result, sources };

  } catch (error: any) {
    console.error("Error during Gemini API call:", error);
    if (error.message.includes('API key not valid')) {
        throw new Error('Authentication failed. The provided API key is not valid.');
    }
    throw new Error(error.message || 'An unexpected error occurred while contacting the Gemini API.');
  }
}