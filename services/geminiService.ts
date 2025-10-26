import type { VerificationResult, GroundingChunk } from '../types';

/**
 * Performs a fact check by calling the backend API.
 * @param claim The claim string to be verified.
 * @returns A promise that resolves with the verification result and sources.
 */
export async function performFactCheck(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
    try {
        const response = await fetch('http://localhost:3000/api/factcheck', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ claim }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Basic validation of the API response
        if (!data.result || !data.sources) {
            throw new Error("The API response was missing required fields.");
        }
        if (!data.result.verdict || data.result.confidence_score === undefined || !data.result.summary_explanation) {
            throw new Error("The result from the API was missing required fields.");
        }

        return { result: data.result, sources: data.sources };

    } catch (error: any) {
        console.error("Error calling fact-check API:", error);
        throw new Error(error.message || 'An unexpected error occurred while contacting the backend API.');
    }
}
