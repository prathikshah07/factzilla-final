import { performFactCheck } from '../services/geminiService';
// Using `any` as we cannot import Vercel/Node types.
// This function signature is compatible with Vercel Serverless Functions.

export default async function handler(req: any, res: any) {
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Respond to CORS preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Ensure the request method is POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    // Vercel automatically parses the body for JSON content types
    const { claim } = req.body;

    if (!claim) {
        return res.status(400).json({ error: 'Claim is required' });
    }

    try {
        const result = await performFactCheck(claim);
        return res.status(200).json(result);
    } catch (error: any) {
        console.error('Error in fact-check endpoint:', error);
        return res.status(500).json({ error: error.message || 'An internal server error occurred' });
    }
}
