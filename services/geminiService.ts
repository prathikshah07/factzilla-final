
import { VerificationResult, GroundingChunk } from '../types';

// This function is now in "Demo Mode". It no longer makes a real API call.
// It simulates a network delay and returns a pre-defined, successful result.
export async function factCheckWithGemini(claim: string): Promise<{ result: VerificationResult; sources: GroundingChunk[] }> {
  console.log("Running in Demo Mode. Simulating API call for claim:", claim);

  // Simulate a network delay of 2 seconds (2000 milliseconds)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return a hardcoded, realistic-looking response.
  // This allows the UI to be fully demonstrated without a real API key.
  const mockResult: VerificationResult = {
    verdict: 'MISLEADING',
    confidence_score: 75,
    summary_explanation: "While the core idea has some basis in nutritional science, the claim is exaggerated. Apple cider vinegar may have minor benefits for weight management as part of a balanced diet, but it is not a proven method for rapid, significant weight loss as stated."
  };

  const mockSources: GroundingChunk[] = [
    {
      web: {
        uri: "https://www.health.harvard.edu/blog/apple-cider-vinegar-diet-does-it-really-work-2018042513703",
        title: "Apple cider vinegar diet: Does it really work? - Harvard Health"
      }
    },
    {
      web: {
        uri: "https://www.uchicagomedicine.org/forefront/health-and-wellness-articles/debunking-the-health-benefits-of-apple-cider-vinegar",
        title: "Debunking the health benefits of apple cider vinegar - UChicago Medicine"
      }
    },
    {
      web: {
        uri: "https://www.cnn.com/2024/02/01/health/apple-cider-vinegar-weight-loss-wellness/index.html",
        title: "What the science says about apple cider vinegar - CNN"
      }
    }
  ];

  // We return a promise that resolves with our mock data
  return Promise.resolve({ result: mockResult, sources: mockSources });
}
