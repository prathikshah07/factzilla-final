import { VerificationResult, GroundingChunk } from '../types';

/**
 * Calls our own backend serverless function to perform a fact check.
 * The serverless function will then call the Hugging Face API.
 * @param claim The claim string to be verified.
 * @returns A promise that resolves with the verification result and sources.
 */
export async function performFactCheck(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
  const response = await fetch('/api/factcheck', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ claim }),
  });

  if (!response.ok) {
    // Attempt to parse a JSON error message from our backend, otherwise create a generic one.
    const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
    throw new Error(errorData.error || `Server responded with status: ${response.status}`);
  }

  // The backend function returns data in the format { result, sources }
  const data = await response.json();
  return data;
}