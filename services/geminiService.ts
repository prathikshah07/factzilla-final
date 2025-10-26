
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, GroundingChunk } from '../types';

let aiInstance: GoogleGenAI | null = null;
const getAiInstance = () => {
    if (!aiInstance) {
        if (!process.env.API_KEY) {
            throw new Error("API_KEY environment variable not set");
        }
        aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return aiInstance;
};

const schema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      description: "A concise verdict (e.g., TRUE, FALSE, MISLEADING, UNSUPPORTED)."
    },
    confidence_score: {
      type: Type.NUMBER,
      description: "A confidence score for the verdict, between 0 and 100."
    },
    summary_explanation: {
      type: Type.STRING,
      description: "A brief, two-sentence summary of why the claim was rated this way."
    }
  },
  required: ["verdict", "confidence_score", "summary_explanation"]
};

export async function factCheckWithGemini(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
  const ai = getAiInstance();
  const model = 'gemini-2.5-flash';

  const prompt = `
    Please act as a neutral and unbiased fact-checker.
    Analyze the following claim using Google Search to find reliable sources: "${claim}"

    After your analysis, you MUST respond with ONLY a single raw JSON object that conforms to the following structure. Do not include any other text, explanations, or markdown formatting like \`\`\`json.

    JSON structure:
    ${JSON.stringify(schema, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    let rawText = response.text.trim();
    if (rawText.startsWith('```json')) {
        rawText = rawText.substring(7, rawText.length - 3).trim();
    } else if (rawText.startsWith('```')) {
        rawText = rawText.substring(3, rawText.length - 3).trim();
    }
    
    const result: VerificationResult = JSON.parse(rawText);
    const sources: GroundingChunk[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter out sources that are not 'web' sources or are empty
    const validSources = sources.filter(s => s.web && s.web.uri && s.web.title);

    return { result, sources: validSources };
  } catch (error) {
    console.error("Error during Gemini API call:", error);
    if (error instanceof SyntaxError) {
        throw new Error("The AI returned a malformed response. Please try rephrasing your claim.");
    }
    throw new Error("Failed to get a valid response from the AI. The service might be unavailable.");
  }
}
