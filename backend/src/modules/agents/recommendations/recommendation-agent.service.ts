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
        temperature_c: { value: climateScore.metrics.temperatureC || 30, penalty: 0 },
        aqi: { value: climateScore.metrics.aqi || 50, penalty: 0 },
        ndvi: { value: climateScore.metrics.ndvi || 0.5, penalty: 0 },
        rainfall_mm: { 
          value: climateScore.metrics.rainfallMm || 50, 
          baseline: climateScore.metrics.rainfallBaselineMm || 50,
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
      Given the following climate conditions for a locality (score: ${context.overallScore}, trend: ${context.trend}, temp: ${context.factors.temperature_c.value}°C, AQI: ${context.factors.aqi.value}, NDVI: ${context.factors.ndvi.value}, Rainfall: ${context.factors.rainfall_mm.value}mm):
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
