/**
 * Verification agent contracts.
 * TODO: Add media evidence, detected object, confidence, and citation schemas.
 */
export interface VerificationAgentInput {
  submissionId: string;
  mediaObjectId: string;
}

export interface VerificationAgentOutput {
  confidence: number;
  observations: string[];
}
