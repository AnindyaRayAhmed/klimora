import { ClimateScoreService } from "../../climate/climate-score.service.js";
import { MissionsService } from "../../missions/missions.service.js";
import { GeminiClient } from "../../../providers/gemini/gemini.client.js";
import { RecommendationRulesEngine } from "./recommendation-rules.engine.js";
import { ClimateContext, RecommendationCandidate } from "./recommendation-agent.types.js";

export class RecommendationAgentService {
  constructor(
    private readonly climateScoreService: ClimateScoreService,
    private readonly missionsService: MissionsService,
    private readonly rulesEngine: RecommendationRulesEngine,
    private readonly gemini: GeminiClient
  ) {}

  async getRecommendations(localityId: string, userId?: string): Promise<RecommendationCandidate[]> {
    // 1. Fetch climate score and missions
    const climateScore = await this.climateScoreService.getLatestForLocality(localityId);
    const activeMissions = await this.missionsService.listActiveMissions();

    // 2. Build ClimateContext
    const context: ClimateContext = {
      overallScore: climateScore.score,
      trend: climateScore.trend,
      factors: {
        temperature_c: { value: climateScore.metrics.temperatureC, penalty: 0 },
        aqi: { value: climateScore.metrics.aqi, penalty: 0 },
        ndvi: { value: climateScore.metrics.ndvi, penalty: 0 },
        rainfall_mm: { 
          value: climateScore.metrics.rainfallMm, 
          baseline: climateScore.metrics.rainfallBaselineMm,
          penalty: 0 
        }
      }
    };

    // 3. Evaluate deterministic rules
    const recommendations = this.rulesEngine.evaluate(context, activeMissions);

    // 4. Generate LLM explanations for the top 3 recommendations
    const topRecommendations = recommendations.slice(0, 3);
    for (const rec of topRecommendations) {
      const prompt = `
      You are an expert climate action advisor. 
      Given the following climate conditions for a locality (score: ${context.overallScore}, trend: ${context.trend}, temp: ${context.factors['temperature_c']?.value ?? 30}°C, AQI: ${context.factors['aqi']?.value ?? 50}, NDVI: ${context.factors['ndvi']?.value ?? 0.5}, Rainfall: ${context.factors['rainfall_mm']?.value ?? 50}mm):
      Explain in exactly one short, encouraging sentence why the mission "${rec.missionTitle}" is recommended. Do not use quotes or list formatting.
    `;
      try {
        rec.explanation = await this.gemini.generateText(prompt);
      } catch (e) {
        rec.explanation = `Recommended to improve climate resilience.`;
      }
    }

    return recommendations;
  }
}
