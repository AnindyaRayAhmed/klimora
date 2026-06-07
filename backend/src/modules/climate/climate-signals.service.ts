import type { ClimateSnapshot } from "./climate.types.js";

export interface RawProviderData {
  localityId: string;
  weather: {
    tempC?: number;
    heatIndexC?: number;
  } | null;
  aqi: {
    aqiValue?: number;
  } | null;
  ndvi: {
    value?: number;
    source?: string;
    observedAt?: string;
  } | null;
  rainfall: {
    mm?: number;
    baselineMm?: number;
    baselineSource?: string | null;
    baselineConfidence?: string | null;
    anomalyPct?: number;
  } | null;
  observedAt?: string;
}

export class ClimateSignalsService {
  public normalizeProviderData(rawData: RawProviderData): ClimateSnapshot {
    const defaultObservedAt = rawData.observedAt || new Date().toISOString();
    return {
      localityId: rawData.localityId,
      temperatureC: rawData.weather?.tempC ?? null,
      heatIndexC: rawData.weather?.heatIndexC ?? null,
      aqi: rawData.aqi?.aqiValue ?? null,
      ndvi: rawData.ndvi?.value ?? null,
      ndviSource: rawData.ndvi?.source ?? "planet",
      ndviTimestamp: rawData.ndvi?.observedAt ?? defaultObservedAt,
      rainfallMm: rawData.rainfall?.mm ?? null,
      rainfallBaselineMm: rawData.rainfall?.baselineMm ?? null,
      rainfallBaselineSource: rawData.rainfall?.baselineSource ?? null,
      rainfallBaselineConfidence: rawData.rainfall?.baselineConfidence ?? null,
      rainfallAnomalyPct: rawData.rainfall?.anomalyPct ?? null,
      observedAt: defaultObservedAt,
    };
  }
}
