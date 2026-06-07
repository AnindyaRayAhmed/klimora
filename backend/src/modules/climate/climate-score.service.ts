import { NotFoundError } from "../../shared/errors.js";
import { ClimateRepository } from "./climate.repo.js";
import type { ClimateScore, LatestClimateScoreDto, ClimateSnapshot, ClimateTrend } from "./climate.types.js";
import { ClimateScoreEngine } from "./climate-score.engine.js";
import { getActiveScoreVersion } from "./score-versioning.js";

export class ClimateScoreService {
  constructor(private readonly climateRepository: ClimateRepository) {}

  async getLatestForLocality(localityId: string): Promise<LatestClimateScoreDto> {
    const climateScore = await this.climateRepository.findLatestByLocalityId(localityId);

    if (!climateScore) {
      throw new NotFoundError("Climate score not found for locality.");
    }

    return this.toLatestDto(climateScore);
  }

  async getHistoryForLocality(localityId: string, limit: number = 30): Promise<LatestClimateScoreDto[]> {
    const history = await this.climateRepository.getScoreHistory(localityId, limit);
    return history.map(score => this.toLatestDto(score));
  }

  async getSnapshotHistory(localityId: string, limit: number = 30): Promise<ClimateSnapshot[]> {
    return this.climateRepository.getClimateHistory(localityId, limit);
  }

  async computeAndStoreScore(localityId: string): Promise<ClimateScore> {
    const snapshots = await this.climateRepository.getClimateHistory(localityId, 90);
    if (snapshots.length === 0) {
      throw new Error(`No climate snapshots found for locality ${localityId}`);
    }

    const latestSnapshot = snapshots[0]!;

    // Calculate Vegetation Trend based on historical NDVI snapshots in DB
    const validNdvis = snapshots.map(s => s.ndvi).filter((n): n is number => n !== null && n !== undefined);
    let vegetationTrendLabel: ClimateTrend = "stable";
    let vegetationTrendValue = 0;

    if (validNdvis.length > 1) {
      const currentNdvi = validNdvis[0]!;
      const pastNdvis = validNdvis.slice(1);
      const rollingAvg = pastNdvis.reduce((acc, val) => acc + val, 0) / pastNdvis.length;
      vegetationTrendValue = currentNdvi - rollingAvg;
      
      if (vegetationTrendValue >= 0.05) {
        vegetationTrendLabel = "improving";
      } else if (vegetationTrendValue <= -0.05) {
        vegetationTrendLabel = "declining";
      } else {
        vegetationTrendLabel = "stable";
      }
    }

    // Simple trend calculation: current vs average of previous 90 days score
    const scoreHistory = await this.climateRepository.getScoreHistory(localityId, 90);
    
    let current90DayAvg: number | null = null;
    let prev90DayAvg: number | null = null;

    if (scoreHistory.length > 0) {
      current90DayAvg = scoreHistory[0]!.score;
      prev90DayAvg = scoreHistory.length > 1 
        ? scoreHistory.slice(1).reduce((acc, s) => acc + s.score, 0) / (scoreHistory.length - 1)
        : current90DayAvg;
    }

    const version = getActiveScoreVersion();
    const engine = new ClimateScoreEngine(version);

    // Dynamic confidence mapping
    const confidences = {
      heat: latestSnapshot.temperatureC !== null ? 1.0 : 0.0,
      aqi: latestSnapshot.aqi !== null ? 1.0 : 0.0,
      vegetation: latestSnapshot.ndvi !== null ? 1.0 : 0.0,
      rainfall: latestSnapshot.rainfallAnomalyPct !== null ? 1.0 : 0.0,
      historical_trend: (current90DayAvg !== null && prev90DayAvg !== null) ? 1.0 : 0.0,
    };

    // Calculate score. The breakdown will automatically contain the computed vegetation details.
    const result = engine.compute(
      latestSnapshot, 
      { current90DayAvg, prev90DayAvg }, 
      confidences
    );

    const newScore: ClimateScore = {
      id: "", // DB will generate
      localityId,
      version: version.id,
      score: result.score,
      label: result.label,
      trend: result.trend,
      temperatureC: latestSnapshot.temperatureC,
      heatIndexC: latestSnapshot.heatIndexC,
      aqi: latestSnapshot.aqi,
      ndvi: latestSnapshot.ndvi,
      ndviSource: latestSnapshot.ndviSource,
      ndviTimestamp: latestSnapshot.ndviTimestamp,
      rainfallMm: latestSnapshot.rainfallMm,
      rainfallBaselineMm: latestSnapshot.rainfallBaselineMm,
      rainfallBaselineSource: latestSnapshot.rainfallBaselineSource,
      rainfallBaselineConfidence: latestSnapshot.rainfallBaselineConfidence,
      rainfallAnomalyPct: latestSnapshot.rainfallAnomalyPct,
      confidence: result.confidence,
      breakdown: result.breakdown.map(item => {
        if (item.factor === "vegetation") {
          return {
            ...item,
            reason: `Based on NDVI readings. Vegetation trend is ${vegetationTrendLabel} (delta: ${vegetationTrendValue.toFixed(4)})`
          };
        }
        return item;
      }),
      computedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    return this.climateRepository.createClimateScore(newScore);
  }

  private toLatestDto(climateScore: ClimateScore): LatestClimateScoreDto {
    return {
      id: climateScore.id,
      localityId: climateScore.localityId,
      score: climateScore.score,
      label: climateScore.label,
      trend: climateScore.trend,
      confidence: climateScore.confidence,
      metrics: {
        temperatureC: climateScore.temperatureC,
        heatIndexC: climateScore.heatIndexC,
        aqi: climateScore.aqi,
        ndvi: climateScore.ndvi,
        ndviSource: climateScore.ndviSource,
        ndviTimestamp: climateScore.ndviTimestamp,
        rainfallMm: climateScore.rainfallMm,
        rainfallBaselineMm: climateScore.rainfallBaselineMm,
        rainfallBaselineSource: climateScore.rainfallBaselineSource,
        rainfallBaselineConfidence: climateScore.rainfallBaselineConfidence,
        rainfallAnomalyPct: climateScore.rainfallAnomalyPct,
      },
      breakdown: climateScore.breakdown,
      computedAt: climateScore.computedAt,
    };
  }
}
