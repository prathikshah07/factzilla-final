
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// This is the same schema from your original service file
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { claim } = req.body;

  if (!claim) {
    return res.status(400).json({ error: 'Claim is required in the request body.' });
  }
  
  // IMPORTANT: Use the API key securely from Vercel's environment variables
  if (!process.env.API_KEY) {
      return res.status(500).json({ error: "API_KEY environment variable not set on the server." });
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const prompt = `
    Please act as a neutral and unbiased fact-checker.
    Analyze the following claim using Google Search to find reliable sources: "${claim}"
    After your analysis, you MUST respond with ONLY a single raw JSON object that conforms to the following structure. Do not include any other text, explanations, or markdown formatting.
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

    const result = JSON.parse(rawText);
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const validSources = sources.filter(s => s.web && s.web.uri && s.web.title);

    // Send the successful response back to the frontend
    return res.status(200).json({ result, sources: validSources });

  } catch (error: any) {
    console.error("Error in serverless function:", error);
    // Send a generic error message to the frontend
    return res.status(500).json({ error: 'Failed to get a valid response from the AI service.' });
  }
}
