/**
 * Climate module contracts.
 * Climate Health Score must remain deterministic and versioned.
 */

export type ClimateSignalType = "heat" | "aqi" | "vegetation" | "rainfall" | "historical_trend";

export type ClimateConfidence = "High" | "Medium" | "Low";
export type ClimateTrend = "improving" | "stable" | "declining";

export interface ClimateSnapshot {
  id?: string;
  localityId: string;
  temperatureC: number | null;
  heatIndexC: number | null;
  aqi: number | null;
  ndvi: number | null;
  ndviSource?: string | null;
  ndviTimestamp?: string | null;
  rainfallMm: number | null;
  rainfallBaselineMm?: number | null;
  rainfallBaselineSource?: string | null;
  rainfallBaselineConfidence?: string | null;
  rainfallAnomalyPct: number | null;
  observedAt: string;
  createdAt?: string;
}

export interface ClimateSignal {
  type: ClimateSignalType;
  value: number | null;
  observedAt: string;
  source: string;
}

export interface ClimateFactorBreakdown {
  factor: ClimateSignalType;
  label: string;
  rawValue: number | null;
  normalizedScore: number;
  weight: number;
  maxPoints: number;
  actualPoints: number;
  penalty: number;
  confidence: number;
  reason: string;
}

export interface ClimateScoreVersion {
  id: string;
  status: "active" | "deprecated" | "draft";
  weights: Record<ClimateSignalType, number>;
  createdAt: string;
  notes: string;
}

export interface ClimateScore {
  id: string;
  localityId: string;
  version: string;
  score: number;
  label: "Healthy" | "Fair" | "Stressed" | "Critical";
  trend: ClimateTrend;
  temperatureC: number | null;
  heatIndexC: number | null;
  aqi: number | null;
  ndvi: number | null;
  ndviSource?: string | null;
  ndviTimestamp?: string | null;
  rainfallMm: number | null;
  rainfallBaselineMm?: number | null;
  rainfallBaselineSource?: string | null;
  rainfallBaselineConfidence?: string | null;
  rainfallAnomalyPct: number | null;
  confidence: ClimateConfidence;
  breakdown: ClimateFactorBreakdown[];
  computedAt: string;
  createdAt: string;
}

export interface LatestClimateScoreDto {
  id: string;
  localityId: string;
  score: number;
  label: "Healthy" | "Fair" | "Stressed" | "Critical";
  trend: ClimateTrend;
  confidence: ClimateConfidence;
  metrics: {
    temperatureC: number | null;
    heatIndexC: number | null;
    aqi: number | null;
    ndvi: number | null;
    ndviSource?: string | null;
    ndviTimestamp?: string | null;
    rainfallMm: number | null;
    rainfallBaselineMm?: number | null;
    rainfallBaselineSource?: string | null;
    rainfallBaselineConfidence?: string | null;
    rainfallAnomalyPct: number | null;
  };
  breakdown: ClimateFactorBreakdown[];
  computedAt: string;
}
