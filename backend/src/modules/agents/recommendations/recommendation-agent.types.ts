/**
 * Recommendation agent contracts.
 * TODO: Add mission recommendation context, constraints, and explainability fields.
 */
export interface RecommendationRequest {
  userId?: string;
  localityId: string;
}

export interface RecommendationCandidate {
  missionId: string;
  missionSlug: string;
  missionTitle: string;
  priority: number;
  impact: string;
  difficulty: string;
  expectedScoreImprovement: number;
  explanation?: string;
}

export interface ClimateContext {
  overallScore: number;
  trend: string;
  factors: Record<string, { value: number | null, baseline?: number | null, penalty: number }>;
}
