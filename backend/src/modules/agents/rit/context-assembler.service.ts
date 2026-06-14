import { RitToolsService } from "./rit-tools.service.js";
import { RitIntent, RitContextPacket, RitQuery } from "./rit.types.js";
import { MemoryService } from "./memory.service.js";
import { GoogleMapsClient } from "../../../providers/google-maps/google-maps.client.js";

export class ContextAssemblerService {
  constructor(
    private readonly ritTools: RitToolsService,
    private readonly memoryService: MemoryService
  ) {}

  async assemble(intent: RitIntent, query: RitQuery, conversationId: string): Promise<RitContextPacket> {
    const packet: RitContextPacket = {};

    packet.userProfile = await this.ritTools.getUserProfile(query.userId);
    packet.recentMemory = await this.memoryService.getMemory(conversationId);
    packet.behaviorProfile = await this.ritTools.inferBehaviorProfile(query.userId);

    let lat = query.lat || 0;
    let lon = query.lng || 0;

    const isDynamic = query.localityId === "dynamic" || query.localityId.startsWith("dynamic-");
    if (isDynamic) {
      console.log("[Rit Debug] dynamic mode active");
      console.log("[Rit Debug] skipping locality repository");
    }

    if (!isDynamic) {
      const coords = await this.ritTools.getLocalityCoordinates(query.localityId);
      if (coords) {
        lat = coords.latitude ? Number(coords.latitude) : lat;
        lon = coords.longitude ? Number(coords.longitude) : lon;
      }
    } else if (lat && lon) {
      console.log(`[Rit Dynamic] Coordinates received: lat=${lat}, lng=${lon}`);
      // It's a dynamic query, let's reverse geocode to get city context
      try {
        const mapsClient = new GoogleMapsClient();
        const locationMeta = await mapsClient.reverseGeocode(lat, lon);
        let city = "Unknown Location";
        if (locationMeta && locationMeta.address_components) {
          const getComponent = (type: string) => 
            locationMeta.address_components.find((c: any) => c.types.includes(type))?.long_name;
          city = getComponent("locality") || getComponent("administrative_area_level_2") || city;
        }
        console.log(`[Rit Dynamic] Reverse geocoded city: ${city}`);
        console.log("[Rit Debug] using coordinate-native context");
        packet.dynamicLocation = { lat, lng: lon, city };
        
        // Save geocoded city context to the conversation in DB
        await this.memoryService.updateConversationCity(conversationId, city);
      } catch (e) {
        console.error("Failed to reverse geocode dynamic location for Rit:", e);
      }
    }

    switch (intent) {
      case RitIntent.CLIMATE_EXPLANATION:
      case RitIntent.ENVIRONMENTAL_QA:
        if (query.localityId !== "dynamic" && !query.localityId.startsWith("dynamic-")) {
          packet.climateScore = await this.ritTools.getLatestClimateScore(query.localityId);
        } else if (lat && lon) {
          packet.climateScore = await this.ritTools.getDynamicClimateScore(lat, lon, packet.dynamicLocation?.city || "Unknown");
        }
        if (lat && lon) {
          packet.freshNdvi = await this.ritTools.getFreshNDVI(query.localityId, lat, lon);
        }
        break;
      
      case RitIntent.MISSION_RECOMMENDATION:
        if (query.localityId !== "dynamic" && !query.localityId.startsWith("dynamic-")) {
          packet.climateScore = await this.ritTools.getLatestClimateScore(query.localityId);
          packet.recommendations = await this.ritTools.getRecommendations(query.localityId, query.userId);
        } else if (lat && lon) {
          packet.climateScore = await this.ritTools.getDynamicClimateScore(lat, lon, packet.dynamicLocation?.city || "Unknown");
        }
        break;

      case RitIntent.FORECAST_DISCUSSION:
        if (query.localityId !== "dynamic" && !query.localityId.startsWith("dynamic-")) {
          packet.climateScore = await this.ritTools.getLatestClimateScore(query.localityId);
        } else if (lat && lon) {
          packet.climateScore = await this.ritTools.getDynamicClimateScore(lat, lon, packet.dynamicLocation?.city || "Unknown");
        }
        if (lat && lon) {
          packet.forecasts = await this.ritTools.getLiveForecast(query.localityId, lat, lon);
        }
        break;

      case RitIntent.MISSION_HELP:
        packet.activeMissions = await this.ritTools.getActiveMissions();
        break;

      case RitIntent.VERIFICATION_HELP:
        packet.verificationResult = await this.ritTools.getLatestVerificationResult(userId);
        break;

      case RitIntent.COMMUNITY_IMPACT:
        if (query.localityId !== "dynamic" && !query.localityId.startsWith("dynamic-")) {
          packet.localityStats = await this.ritTools.getCommunityImpact(query.localityId);
          packet.climateScore = { trendNarrative: await this.ritTools.getClimateTrendNarrative(query.localityId) };
        } else if (lat && lon) {
          packet.climateScore = await this.ritTools.getDynamicClimateScore(lat, lon, packet.dynamicLocation?.city || "Unknown");
        }
        break;

      case RitIntent.MOTIVATION:
        if (query.localityId !== "dynamic" && !query.localityId.startsWith("dynamic-")) {
          packet.climateScore = await this.ritTools.getLatestClimateScore(query.localityId);
        } else if (lat && lon) {
          packet.climateScore = await this.ritTools.getDynamicClimateScore(lat, lon, packet.dynamicLocation?.city || "Unknown");
        }
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
