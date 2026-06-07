import { GeminiMissionAnalysis, VerificationDecision } from "./verification.types.js";

export class VerificationRulesService {
  evaluate(missionSlug: string, geminiAnalysis: GeminiMissionAnalysis): VerificationDecision {
    let requiredConfidence = 0.70;

    switch (missionSlug) {
      case 'plant-tree':
      case 'rooftop-garden':
        requiredConfidence = 0.75;
        break;
      case 'rainwater-harvesting':
      case 'community-cleanup':
        requiredConfidence = 0.70;
        break;
      case 'public-transport':
        requiredConfidence = 0.65;
        break;
      case 'civic-reporting':
        requiredConfidence = 0.60;
        break;
      default:
        requiredConfidence = 0.75;
    }

    const verified = geminiAnalysis.evidenceDetected && geminiAnalysis.confidence >= requiredConfidence;
    
    return {
      verified,
      confidence: geminiAnalysis.confidence,
      reason: verified 
        ? "Evidence meets confidence threshold." 
        : `Evidence insufficient or confidence (${geminiAnalysis.confidence}) below threshold (${requiredConfidence}). Details: ${geminiAnalysis.reason}`,
    };
  }
}
