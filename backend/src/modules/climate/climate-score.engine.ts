import type { 
  ClimateSnapshot, 
  ClimateFactorBreakdown, 
  ClimateScoreVersion, 
  ClimateConfidence, 
  ClimateTrend, 
  ClimateSignalType 
} from "./climate.types.js";

// Helper function
function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export class ClimateScoreEngine {
  constructor(private readonly version: ClimateScoreVersion) {}

  public calculateHeatScore(temperatureC: number | null, heatIndexC: number | null): number {
    if (temperatureC === null && heatIndexC === null) return 60; // Missing data rule

    const heat = heatIndexC ?? temperatureC!;
    let score = 0;

    if (heat <= 26) score = 100;
    else if (heat <= 30) score = 100 - ((heat - 26) / 4) * 20;
    else if (heat <= 34) score = 80 - ((heat - 30) / 4) * 25;
    else if (heat <= 38) score = 55 - ((heat - 34) / 4) * 30;
    else if (heat <= 42) score = 25 - ((heat - 38) / 4) * 25;
    else score = 0;

    return clamp(score, 0, 100);
  }

  public calculateAqiScore(aqi: number | null): number {
    if (aqi === null) return 60;

    let score = 0;
    if (aqi <= 50) score = 100 - (aqi / 50) * 10;
    else if (aqi <= 100) score = 90 - ((aqi - 50) / 50) * 15;
    else if (aqi <= 150) score = 75 - ((aqi - 100) / 50) * 20;
    else if (aqi <= 200) score = 55 - ((aqi - 150) / 50) * 20;
    else if (aqi <= 300) score = 35 - ((aqi - 200) / 100) * 20;
    else score = Math.max(0, 15 - ((aqi - 300) / 200) * 15);

    return clamp(score, 0, 100);
  }

  public calculateVegetationScore(ndvi: number | null): number {
    if (ndvi === null) return 60;

    let score = 0;
    if (ndvi < 0.15) score = 0;
    else if (ndvi <= 0.30) score = ((ndvi - 0.15) / 0.15) * 35;
    else if (ndvi <= 0.45) score = 35 + ((ndvi - 0.30) / 0.15) * 25;
    else if (ndvi <= 0.60) score = 60 + ((ndvi - 0.45) / 0.15) * 20;
    else if (ndvi <= 0.75) score = 80 + ((ndvi - 0.60) / 0.15) * 20;
    else score = 100;

    return clamp(score, 0, 100);
  }

  public static calculateRainfallAnomaly(current: number | null, baseline: number | null): number | null {
    if (current === null || baseline === null || baseline <= 0) {
      return null;
    }
    return ((current - baseline) / baseline) * 100;
  }

  public calculateRainfallScore(rainfallAnomalyPct: number | null): number {
    if (rainfallAnomalyPct === null) return 60;

    const absAnomaly = Math.abs(rainfallAnomalyPct);
    let score = 0;

    if (absAnomaly <= 10) score = 100;
    else if (absAnomaly <= 25) score = 100 - ((absAnomaly - 10) / 15) * 25;
    else if (absAnomaly <= 50) score = 75 - ((absAnomaly - 25) / 25) * 35;
    else if (absAnomaly <= 75) score = 40 - ((absAnomaly - 50) / 25) * 30;
    else score = Math.max(0, 10 - ((absAnomaly - 75) / 50) * 10);

    return clamp(score, 0, 100);
  }

  public calculateTrendScore(current90DayAvg: number | null, prev90DayAvg: number | null): number {
    if (current90DayAvg === null || prev90DayAvg === null) return 60;

    const trendDelta = current90DayAvg - prev90DayAvg;
    let score = 0;

    if (trendDelta >= 8) score = 100;
    else if (trendDelta >= 4) score = 80 + ((trendDelta - 4) / 4) * 20;
    else if (trendDelta >= 0) score = 60 + (trendDelta / 4) * 20;
    else if (trendDelta >= -4) score = 60 + (trendDelta / 4) * 20; // Mathematically same as above block in the prompt
    else if (trendDelta >= -8) score = 40 + ((trendDelta + 4) / 4) * 20;
    else score = 20;

    return clamp(score, 0, 100);
  }

  private buildBreakdownItem(
    factor: ClimateSignalType | "historical_trend",
    label: string,
    rawValue: number | null,
    subScore: number,
    confidenceValue: number,
    reason: string
  ): ClimateFactorBreakdown {
    const weight = this.version.weights[factor];
    const maxPoints = weight * 100;
    const actualPoints = subScore * weight;
    const penalty = actualPoints - maxPoints; // should be <= 0

    return {
      factor: factor as ClimateSignalType,
      label,
      rawValue,
      normalizedScore: subScore,
      weight,
      maxPoints,
      actualPoints,
      penalty,
      confidence: confidenceValue,
      reason
    };
  }

  public compute(
    snapshot: ClimateSnapshot, 
    trendData: { current90DayAvg: number | null, prev90DayAvg: number | null },
    confidences: Record<ClimateSignalType | "historical_trend", number>
  ) {
    const heatScore = this.calculateHeatScore(snapshot.temperatureC, snapshot.heatIndexC);
    const aqiScore = this.calculateAqiScore(snapshot.aqi);
    const vegScore = this.calculateVegetationScore(snapshot.ndvi);
    const rainScore = this.calculateRainfallScore(snapshot.rainfallAnomalyPct);
    const trendScore = this.calculateTrendScore(trendData.current90DayAvg, trendData.prev90DayAvg);

    const heatConf = (snapshot.temperatureC === null && snapshot.heatIndexC === null) ? 0 : confidences.heat;
    const aqiConf = snapshot.aqi === null ? 0 : confidences.aqi;
    const vegConf = snapshot.ndvi === null ? 0 : confidences.vegetation;
    const rainConf = snapshot.rainfallAnomalyPct === null ? 0 : confidences.rainfall;
    const trendConf = (trendData.current90DayAvg === null || trendData.prev90DayAvg === null) ? 0 : confidences.historical_trend;

    const breakdown: ClimateFactorBreakdown[] = [
      this.buildBreakdownItem("heat", "Heat Risk", snapshot.heatIndexC ?? snapshot.temperatureC, heatScore, heatConf, "Based on temperature and heat index"),
      this.buildBreakdownItem("aqi", "Air Quality", snapshot.aqi, aqiScore, aqiConf, "Based on AQI levels"),
      this.buildBreakdownItem("vegetation", "Vegetation Health", snapshot.ndvi, vegScore, vegConf, "Based on NDVI readings"),
      this.buildBreakdownItem("rainfall", "Rainfall Anomaly", snapshot.rainfallAnomalyPct, rainScore, rainConf, "Based on rainfall anomaly percentage"),
      this.buildBreakdownItem("historical_trend", "Historical Trend", trendData.current90DayAvg ? (trendData.current90DayAvg - (trendData.prev90DayAvg ?? 0)) : null, trendScore, trendConf, "Based on 90-day score trend")
    ];

    const finalScoreRaw = 
      (heatScore * this.version.weights.heat) +
      (aqiScore * this.version.weights.aqi) +
      (vegScore * this.version.weights.vegetation) +
      (rainScore * this.version.weights.rainfall) +
      (trendScore * this.version.weights.historical_trend);

    const finalScore = Math.round(clamp(finalScoreRaw, 0, 100));

    const overallConfRaw = 
      (heatConf * this.version.weights.heat) +
      (aqiConf * this.version.weights.aqi) +
      (vegConf * this.version.weights.vegetation) +
      (rainConf * this.version.weights.rainfall) +
      (trendConf * this.version.weights.historical_trend);

    let confidenceLabel: ClimateConfidence;
    if (overallConfRaw >= 0.80) confidenceLabel = "High";
    else if (overallConfRaw >= 0.55) confidenceLabel = "Medium";
    else confidenceLabel = "Low";

    let scoreLabel: "Healthy" | "Fair" | "Stressed" | "Critical";
    if (finalScore >= 80) scoreLabel = "Healthy";
    else if (finalScore >= 60) scoreLabel = "Fair";
    else if (finalScore >= 40) scoreLabel = "Stressed";
    else scoreLabel = "Critical";

    const trendDelta = trendData.current90DayAvg && trendData.prev90DayAvg ? trendData.current90DayAvg - trendData.prev90DayAvg : 0;
    let trendLabel: ClimateTrend;
    if (trendDelta >= 4) trendLabel = "improving";
    else if (trendDelta <= -4) trendLabel = "declining";
    else trendLabel = "stable";

    return {
      score: finalScore,
      label: scoreLabel,
      confidence: confidenceLabel,
      trend: trendLabel,
      breakdown
    };
  }
}
