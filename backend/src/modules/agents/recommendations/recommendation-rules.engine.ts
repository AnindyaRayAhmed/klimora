import { ClimateContext, RecommendationCandidate } from "./recommendation-agent.types.js";
import { MissionDto } from "../../missions/missions.types.js";

export class RecommendationRulesEngine {
  evaluate(climateContext: ClimateContext, availableMissions: MissionDto[]): RecommendationCandidate[] {
    const candidates: RecommendationCandidate[] = [];

    // Extract factors
    const temp = climateContext.factors['temperature_c']?.value || 30;
    const aqi = climateContext.factors['aqi']?.value || 50;
    const ndvi = climateContext.factors['ndvi']?.value || 0.5;
    const rainfall = climateContext.factors['rainfall_mm']?.value || 50;
    const rainfallBaseline = climateContext.factors['rainfall_mm']?.baseline || 50;

    const conditions = {
      highHeat: temp > 35,
      poorAqi: aqi > 100,
      lowVegetation: ndvi < 0.3,
      rainfallDeficit: rainfall < (rainfallBaseline * 0.7),
      decliningTrend: climateContext.trend === 'declining'
    };

    const missionScores = new Map<string, number>();

    // Apply deterministic rules
    if (conditions.highHeat) {
      missionScores.set('plant-tree', (missionScores.get('plant-tree') || 0) + 10);
      missionScores.set('rooftop-garden', (missionScores.get('rooftop-garden') || 0) + 8);
    }

    if (conditions.lowVegetation) {
      missionScores.set('plant-tree', (missionScores.get('plant-tree') || 0) + 12);
      missionScores.set('rooftop-garden', (missionScores.get('rooftop-garden') || 0) + 10);
    }

    if (conditions.poorAqi) {
      missionScores.set('public-transport', (missionScores.get('public-transport') || 0) + 15);
      missionScores.set('civic-reporting', (missionScores.get('civic-reporting') || 0) + 5);
    }

    if (conditions.rainfallDeficit) {
      missionScores.set('rainwater-harvesting', (missionScores.get('rainwater-harvesting') || 0) + 20);
    }

    if (conditions.decliningTrend) {
      missionScores.set('community-cleanup', (missionScores.get('community-cleanup') || 0) + 10);
      missionScores.set('civic-reporting', (missionScores.get('civic-reporting') || 0) + 8);
    }

    // Default base scores for all missions so they appear even if no extreme conditions
    for (const mission of availableMissions) {
      const baseScore = missionScores.get(mission.slug) || 5;
      missionScores.set(mission.slug, baseScore);
    }

    for (const mission of availableMissions) {
      const priority = missionScores.get(mission.slug) || 0;
      if (priority > 0) {
        candidates.push({
          missionId: mission.id,
          missionSlug: mission.slug,
          missionTitle: mission.title,
          priority,
          impact: priority > 12 ? 'High' : (priority > 8 ? 'Medium' : 'Low'),
          difficulty: mission.points > 150 ? 'Hard' : (mission.points > 50 ? 'Medium' : 'Easy'),
          expectedScoreImprovement: Math.round(priority / 2),
        });
      }
    }

    // Sort by priority descending
    return candidates.sort((a, b) => b.priority - a.priority);
  }
}
