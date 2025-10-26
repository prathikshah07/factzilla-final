import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define the Hugging Face model we will use. Mistral-7B is a powerful and popular choice.
const MODEL_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

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

    // Check for the Hugging Face token in environment variables, which you must set in Vercel.
    if (!process.env.HF_TOKEN) {
        return res.status(500).json({ error: "HF_TOKEN environment variable not set on the server." });
    }

    // Construct a prompt that guides the model to produce the desired JSON output
    // The [INST]...[/INST] format is specific to Mistral models.
    const prompt = `[INST] You are an AI fact-checker. Your task is to analyze the following claim and determine its validity based on your internal knowledge. You must respond with ONLY a single, raw JSON object in the specified format, with no other text, explanation, or markdown.

Claim: "${claim}"

JSON Format to follow:
${JSON.stringify(desiredJsonStructure)}
[/INST]`;

    try {
        // Call the Hugging Face Inference API
        const hfResponse = await fetch(MODEL_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    return_full_text: false, // Don't return our prompt in the response
                    max_new_tokens: 250,     // A safe limit for our JSON object
                    temperature: 0.1,        // Low temperature for factual, less creative output
                }
            }),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error("Hugging Face API Error:", errorText);
            // The 503 error means the model is loading and the user should retry.
            if (hfResponse.status === 503) {
                 return res.status(503).json({ error: 'The fact-checking model is currently loading, please try again in a moment.' });
            }
            return res.status(500).json({ error: `Hugging Face API failed with status: ${hfResponse.status}` });
        }
        
        const hfResult = await hfResponse.json();
        
        // The response is typically an array with one element object containing "generated_text"
        if (!hfResult || !Array.isArray(hfResult) || !hfResult[0]?.generated_text) {
             throw new Error('Invalid response structure from Hugging Face API.');
        }

        let rawText = hfResult[0].generated_text.trim();
        
        // The model might wrap the JSON in markdown backticks. Let's remove them.
        if (rawText.startsWith('```json')) {
            rawText = rawText.substring(7).trim();
        }
        if (rawText.endsWith('```')) {
            rawText = rawText.slice(0, -3).trim();
        }
        
        // The model might still add extra text. We extract just the JSON part.
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("Raw text from AI that failed JSON match:", rawText);
            throw new Error('AI response did not contain a valid JSON object.');
        }
        
        const result = JSON.parse(jsonMatch[0]);

        // Hugging Face models do not provide grounding/sources, so we return an empty array.
        // The frontend is already designed to handle this gracefully.
        return res.status(200).json({ result, sources: [] });

    } catch (error: any) {
        console.error("Error in serverless function:", error);
        return res.status(500).json({ error: error.message || 'Failed to process the claim.' });
    }
}