import { RitToolsService } from "./rit-tools.service.js";
import { RitIntent, RitContextPacket } from "./rit.types.js";
import { MemoryService } from "./memory.service.js";

export class ContextAssemblerService {
  constructor(
    private readonly ritTools: RitToolsService,
    private readonly memoryService: MemoryService
  ) {}

  async assemble(intent: RitIntent, localityId: string, userId: string, conversationId: string): Promise<RitContextPacket> {
    const packet: RitContextPacket = {};

    packet.userProfile = await this.ritTools.getUserProfile(userId);
    packet.recentMemory = await this.memoryService.getMemory(conversationId);
    packet.behaviorProfile = await this.ritTools.inferBehaviorProfile(userId);

    const coords = await this.ritTools.getLocalityCoordinates(localityId);
    const lat = coords?.latitude ? Number(coords.latitude) : 0;
    const lon = coords?.longitude ? Number(coords.longitude) : 0;

    switch (intent) {
      case RitIntent.CLIMATE_EXPLANATION:
      case RitIntent.ENVIRONMENTAL_QA:
        packet.climateScore = await this.ritTools.getLatestClimateScore(localityId);
        if (lat && lon) {
          packet.freshNdvi = await this.ritTools.getFreshNDVI(localityId, lat, lon);
        }
        break;
      
      case RitIntent.MISSION_RECOMMENDATION:
        packet.climateScore = await this.ritTools.getLatestClimateScore(localityId);
        packet.recommendations = await this.ritTools.getRecommendations(localityId, userId);
        break;

      case RitIntent.FORECAST_DISCUSSION:
        packet.climateScore = await this.ritTools.getLatestClimateScore(localityId);
        if (lat && lon) {
          packet.forecasts = await this.ritTools.getLiveForecast(localityId, lat, lon);
        }
        break;

      case RitIntent.MISSION_HELP:
        packet.activeMissions = await this.ritTools.getActiveMissions();
        break;

      case RitIntent.VERIFICATION_HELP:
        packet.verificationResult = await this.ritTools.getLatestVerificationResult(userId);
        break;

      case RitIntent.COMMUNITY_IMPACT:
        packet.localityStats = await this.ritTools.getCommunityImpact(localityId);
        packet.climateScore = { trendNarrative: await this.ritTools.getClimateTrendNarrative(localityId) };
        break;

      case RitIntent.MOTIVATION:
        packet.climateScore = await this.ritTools.getLatestClimateScore(localityId);
        break;
        
      case RitIntent.GENERAL_CONVERSATION:
      default:
        // Already loaded profile and memory
        break;
    }

    return packet;
  }

  generateContextSummary(packet: RitContextPacket): string {
    const parts = [];
    if (packet.climateScore?.score) parts.push(`Score: ${packet.climateScore.score}`);
    if (packet.recommendations?.length) parts.push(`Recs: ${packet.recommendations.length}`);
    if (packet.forecasts?.data?.list?.length) parts.push(`Forecasts: ${packet.forecasts.data.list.length}`);
    if (packet.verificationResult) parts.push(`Verify: ${packet.verificationResult.submission.status}`);
    return parts.join(" | ") || "Basic Context";
  }
}
