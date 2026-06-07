import { RitContextPacket, RitAgentResponse } from "../rit.types.js";

export class VerificationExplanationAgent {
  static analyze(context: RitContextPacket): RitAgentResponse | null {
    if (!context.verificationResult) return null;
    
    const { submission, result } = context.verificationResult;
    let contribution = `Latest User Mission Submission Details:\n`;
    contribution += `Mission: ${submission.missions?.title || "Unknown"}\n`;
    contribution += `Status: ${submission.status}\n`;
    
    if (result) {
      contribution += `Verification Confidence: ${result.confidence_score}\n`;
      contribution += `Detected Objects: ${JSON.stringify(result.detected_objects)}\n`;
      contribution += `Reasoning: ${result.reason}\n`;
    }

    return { agentName: "VerificationExplanationAgent", contribution };
  }
}
