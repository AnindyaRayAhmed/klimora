import { RitContextPacket, RitAgentResponse } from "../rit.types.js";

export class MissionIntelligenceAgent {
  static analyze(context: RitContextPacket): RitAgentResponse | null {
    if (!context.activeMissions || context.activeMissions.length === 0) return null;
    
    let contribution = `Available Active Missions (Contextual reference):\n`;
    context.activeMissions.forEach((m: any) => {
      contribution += `- ${m.title} [Category: ${m.category}] (Points: ${m.points}). Description: ${m.description}\n`;
    });

    return { agentName: "MissionIntelligenceAgent", contribution };
  }
}
