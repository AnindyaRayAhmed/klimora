/**
 * Mission verification domain contracts.
 * Workflow placeholder: Media Upload -> Verification Agent -> Rules Engine -> Verification Result -> Mission Reward.
 * TODO: Add policy schemas, deterministic rule outcomes, media metadata, and audit fields.
 */
export type VerificationStatus = "pending" | "verified" | "manual_review" | "rejected";

export interface VerificationResult {
  submissionId: string;
  status: VerificationStatus;
  confidence: number;
  ruleResults: unknown[];
  reason?: string;
}

export interface GeminiMissionAnalysis {
  evidenceDetected: boolean;
  confidence: number;
  detectedObjects: string[];
  observations: string[];
  reason: string;
}

export interface VerificationDecision {
  verified: boolean;
  confidence: number;
  reason: string;
}
