import { GeminiClient } from "../../../providers/gemini/gemini.client.js";
import { RitAgentResponse, RitContextPacket, RitIntent, RitBehaviorProfile } from "./rit.types.js";
import { ritPrompts } from "./rit-prompts.js";
import { UpstreamDataError } from "../../../shared/errors.js";

export class ResponseSynthesisService {
  constructor(private readonly gemini: GeminiClient) {}

  private compressContext(factualContext: string): string {
    const compressed = factualContext.replace(/\n\s*\n/g, '\n').trim();
    if (compressed.length > 3000) {
      return compressed.substring(0, 3000) + "... [Truncated for brevity]";
    }
    return compressed;
  }

  private getBehavioralTone(profile?: RitBehaviorProfile): string {
    switch (profile) {
      case RitBehaviorProfile.TREE_ADVOCATE:
        return "The user loves greening missions. Emphasize urban canopy and vegetation metrics warmly.";
      case RitBehaviorProfile.COMMUNITY_VOLUNTEER:
        return "The user is community-focused. Highlight collective impact and social benefits.";
      case RitBehaviorProfile.LOW_ACTIVITY_USER:
        return "The user has low activity. Use a low-friction, encouraging tone and suggest small, easy steps.";
      case RitBehaviorProfile.AQI_CONSCIOUS:
        return "The user cares about air quality. Highlight pollution reduction and respiratory health benefits.";
      case RitBehaviorProfile.WATER_CONSERVATION_FOCUSED:
        return "The user focuses on water. Emphasize rainfall anomalies and water preservation.";
      case RitBehaviorProfile.GENERAL_USER:
      default:
        return "Use a balanced, practical, and supportive tone.";
    }
  }

  async synthesize(
    message: string, 
    intent: RitIntent, 
    context: RitContextPacket, 
    agentResponses: RitAgentResponse[]
  ): Promise<string> {
    const memoryContext = context.recentMemory?.recentMessages?.map(m => `${m.role}: ${m.content}`).join("\n") || "No recent memory.";
    
    const factualContext = agentResponses.map(a => `[${a.agentName} Data]:\n${a.contribution}`).join("\n\n");
    const compressedContext = this.compressContext(factualContext);
    const behavioralTone = this.getBehavioralTone(context.behaviorProfile);

    const city = context.dynamicLocation?.city || "Unknown Location";
    const temp = context.climateScore?.metrics?.temperatureC ?? "N/A";
    const aqi = context.climateScore?.metrics?.aqi ?? "N/A";
    const ndvi = context.freshNdvi?.value ?? context.climateScore?.metrics?.ndvi ?? "N/A";
    const climateScoreVal = context.climateScore?.score ?? "N/A";

    const prompt = `
${ritPrompts.systemPersona}

=== BEHAVIORAL TONE ADAPTATION ===
${behavioralTone}
Use storytelling and natural transitions to make this insight relatable.

=== CURRENT USER INTENT ===
${intent}

=== RECENT CONVERSATION HISTORY ===
${memoryContext}

=== ACTIVE LOCATION & CLIMATE METRICS ===
Location: ${city}
Temperature: ${temp}°C
AQI: ${aqi}
NDVI: ${ndvi}
Climate Score: ${climateScoreVal}/100

=== FACTUAL CLIMATE & MISSION CONTEXT ===
${compressedContext || "No specific factual context needed for this query."}

=== USER QUERY ===
${message}

=== INSTRUCTION ===
Synthesize a natural, unified, conversational response to the user's query.
Do NOT mention internal agents (like 'Agent A says...').
Use the active location and climate metrics, as well as factual context provided, to answer accurately and reason about the environment.
Do not hallucinate data. If data is missing, admit you don't have it.
    `;

    try {
      return await this.gemini.generateText(prompt);
    } catch (e) {
      console.error("Gemini synthesis failed:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      throw new UpstreamDataError(`AI inference failed: ${errorMessage}`);
    }
  }
}
