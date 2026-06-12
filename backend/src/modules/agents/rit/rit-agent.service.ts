import { IntentClassifier } from "./intent-classifier.js";
import { ContextAssemblerService } from "./context-assembler.service.js";
import { MemoryService } from "./memory.service.js";
import { ResponseSynthesisService } from "./response-synthesis.service.js";
import { ClimateIntelligenceAgent } from "./agents/climate-intelligence-agent.js";
import { RecommendationAdapterAgent } from "./agents/recommendation-adapter-agent.js";
import { MissionIntelligenceAgent } from "./agents/mission-intelligence-agent.js";
import { VerificationExplanationAgent } from "./agents/verification-explanation-agent.js";
import { ForecastIntelligenceAgent } from "./agents/forecast-intelligence-agent.js";
import { CommunityImpactAgent } from "./agents/community-impact-agent.js";
import { RitQuery, RitAnswerContract, RitAgentResponse } from "./rit.types.js";

/**
 * Rit Orchestrator Service
 * Coordinates intent analysis, dynamic context assembly, specialized agent routing, and response synthesis.
 */
export class RitAgentService {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly contextAssembler: ContextAssemblerService,
    private readonly synthesisService: ResponseSynthesisService
  ) {}

  async processQuery(query: RitQuery): Promise<RitAnswerContract> {
    // 1. Memory retrieval or initialization
    const conversationId = await this.memoryService.getOrCreateConversation(
      query.userId, 
      query.localityId, 
      query.conversationId
    );

    // Save user message immediately
    await this.memoryService.saveMessage(conversationId, "user", query.message);

    // 2. Intent Analysis
    const intent = IntentClassifier.classify(query.message);

    // 3. Context Assembly
    const contextPacket = await this.contextAssembler.assemble(
      intent, 
      query, 
      conversationId
    );

    // 4. Specialized Agent Routing
    const agentResponses: RitAgentResponse[] = [];
    const pushIfValid = (res: RitAgentResponse | null) => res && agentResponses.push(res);

    pushIfValid(ClimateIntelligenceAgent.analyze(contextPacket));
    pushIfValid(RecommendationAdapterAgent.analyze(contextPacket));
    pushIfValid(MissionIntelligenceAgent.analyze(contextPacket));
    pushIfValid(VerificationExplanationAgent.analyze(contextPacket));
    pushIfValid(ForecastIntelligenceAgent.analyze(contextPacket));
    pushIfValid(CommunityImpactAgent.analyze(contextPacket));

    // 5. Response Synthesis
    const synthesizedText = await this.synthesisService.synthesize(
      query.message,
      intent,
      contextPacket,
      agentResponses
    );

    const contextSummary = this.contextAssembler.generateContextSummary(contextPacket);

    // 6. Persist Conversation (Assistant Message)
    await this.memoryService.saveMessage(
      conversationId, 
      "assistant", 
      synthesizedText, 
      intent, 
      contextSummary
    );

    return {
      conversationId,
      message: {
        role: "assistant",
        content: synthesizedText,
        citations: [],
        intent,
        contextSummary
      }
    };
  }
}
