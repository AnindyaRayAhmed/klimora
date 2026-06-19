import type { ClimateSnapshot } from "./climate.types.js";

export interface RawProviderData {
  localityId: string;
  weather: {
    tempC?: number | null;
    heatIndexC?: number | null;
  } | null;
  aqi: {
    aqiValue?: number | null;
  } | null;
  ndvi: {
    value?: number | null;
    source?: string | null;
    observedAt?: string | null;
  } | null;
  rainfall: {
    mm?: number | null;
    baselineMm?: number | null;
    baselineSource?: string | null;
    baselineConfidence?: string | null;
    anomalyPct?: number | null;
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
