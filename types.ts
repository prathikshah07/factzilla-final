
export type Verdict = 'TRUE' | 'FALSE' | 'MISLEADING' | 'UNSUPPORTED' | string;

export interface VerificationResult {
  verdict: Verdict;
  confidence_score: number;
  summary_explanation: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
