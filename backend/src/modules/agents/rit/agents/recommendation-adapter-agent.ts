import { RitContextPacket, RitAgentResponse } from "../rit.types.js";

export class RecommendationAdapterAgent {
  static analyze(context: RitContextPacket): RitAgentResponse | null {
    if (!context.recommendations || context.recommendations.length === 0) return null;
    
    let contribution = `Current Recommendations for User:\n`;
    context.recommendations.forEach((rec: any, i: number) => {
      contribution += `${i + 1}. Mission: ${rec.missionTitle} (Score: ${rec.score}). Reason: ${rec.explanation}\n`;
    });

    return { agentName: "RecommendationAdapterAgent", contribution };
  }
}
