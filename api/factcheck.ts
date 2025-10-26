import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { VerificationResult } from '../types';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/facebook/bart-large-mnli';

// Main handler for the serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const { claim, apiKey } = req.body;

    if (!claim || !apiKey) {
        return res.status(400).json({ error: 'Claim and apiKey are required in the request body.' });
    }

    try {
        const response = await fetch(HUGGINGFACE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: claim,
                parameters: {
                    candidate_labels: ['TRUE', 'FALSE', 'MISLEADING', 'UNSUPPORTED'],
                },
                options: {
                    wait_for_model: true,
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Hugging Face API Error:", errorBody);
            // Forward a more user-friendly error from the serverless function
            const status = response.status;
             if (status === 401) {
                throw new Error(`Hugging Face API Error (401): Unauthorized. Please check your API token.`);
            }
            throw new Error(`Hugging Face API responded with status: ${status}.`);
        }

        const hfResult = await response.json();
        
        if (!hfResult || !hfResult.labels || !hfResult.scores) {
            console.error("Invalid response from Hugging Face:", hfResult);
            throw new Error("Received an invalid response structure from the Hugging Face API.");
        }

        // The first label in the array has the highest score
        const verdict = hfResult.labels[0].toUpperCase();
        const confidenceScore = Math.round(hfResult.scores[0] * 100);

        const result: VerificationResult = {
            verdict: verdict,
            confidence_score: confidenceScore,
            summary_explanation: `The model classified this claim as ${verdict.toLowerCase()} based on its training data. This model does not use live web search, so sources are not provided.`,
        };
        
        // Hugging Face zero-shot classification doesn't provide sources.
        const sources = [];

        return res.status(200).json({ result, sources });

    } catch (error: any) {
        console.error("Error in serverless function:", error);
        return res.status(500).json({ error: error.message || 'Failed to process the claim.' });
    }
}