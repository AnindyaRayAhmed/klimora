import { localities as mockLocalities, type Locality } from '../ui-constants';

const frontendLocalityMap: Record<string, Partial<Locality>> = {
  'indiranagar': mockLocalities.find(l => l.id === 'indiranagar')!,
  'koramangala': mockLocalities.find(l => l.id === 'koramangala')!,
  'jayanagar': mockLocalities.find(l => l.id === 'jayanagar')!,
  'hsr-layout': mockLocalities.find(l => l.id === 'hsr')!,
  'whitefield': mockLocalities.find(l => l.id === 'whitefield')!,
};

export function adaptClimateScoreToLocality(localityRaw: any, scoreRaw: any): Locality {
  const base = frontendLocalityMap[localityRaw.slug] || mockLocalities[0];
  
  return {
    ...base,
    id: localityRaw.id,
    name: localityRaw.name,
    city: localityRaw.city,
    climateScore: scoreRaw.score,
    scoreDelta: 0, 
    trend: scoreRaw.trend,
    temperature: {
      value: scoreRaw.metrics?.temperatureC || base.temperature.value,
      delta: 0 
    },
    airQuality: {
      aqi: scoreRaw.metrics?.aqi || base.airQuality.aqi,
      label: scoreRaw.breakdown?.find((b:any) => b.label === 'AQI')?.reason || base.airQuality.label
    },
    vegetation: {
      ndvi: scoreRaw.metrics?.ndvi || base.vegetation.ndvi,
      label: scoreRaw.breakdown?.find((b:any) => b.label === 'Vegetation')?.reason || base.vegetation.label
    },
    rainfall: {
      mm: scoreRaw.metrics?.rainfallMm || base.rainfall.mm,
      delta: scoreRaw.metrics?.rainfallAnomalyPct || base.rainfall.delta,
      label: scoreRaw.breakdown?.find((b:any) => b.label === 'Rainfall')?.reason || base.rainfall.label
    },
    heatRisk: {
      value: scoreRaw.metrics?.heatIndexC ? Math.round((scoreRaw.metrics.heatIndexC / 50) * 100) : base.heatRisk.value,
      label: scoreRaw.breakdown?.find((b:any) => b.label === 'Heat Risk')?.reason || base.heatRisk.label
    }
  } as Locality;
}

export type ScoreBreakdownItem = {
  label: string;
  delta: number; // negative = penalty
  detail: string;
  token: "heat" | "aqi" | "vegetation" | "rainfall" | "climate";
};

export function getScoreBreakdown(loc: Locality): {
  items: ScoreBreakdownItem[];
  base: number;
  adjustments: number;
  final: number;
} {
  const heat = -Math.round(loc.heatRisk.value / 4);
  const aqi = -Math.round(Math.max(0, loc.airQuality.aqi - 100) / 4);
  const veg = -Math.round(Math.max(0, 0.6 - loc.vegetation.ndvi) * 60);
  const rain = -Math.round(Math.max(0, -loc.rainfall.delta) / 8);
  const items: ScoreBreakdownItem[] = [
    { label: "Heat Risk", delta: heat, detail: `${loc.heatRisk.label} · ${loc.heatRisk.value}/100`, token: "heat" },
    { label: "Air Quality", delta: aqi, detail: `AQI ${loc.airQuality.aqi} · ${loc.airQuality.label}`, token: "aqi" },
    { label: "Vegetation Loss", delta: veg, detail: `NDVI ${loc.vegetation.ndvi.toFixed(2)} · ${loc.vegetation.label}`, token: "vegetation" },
    { label: "Rainfall Deficit", delta: rain, detail: `${loc.rainfall.mm} mm · ${loc.rainfall.delta > 0 ? "+" : ""}${loc.rainfall.delta}% vs normal`, token: "rainfall" },
  ];
  const sum = items.reduce((s, i) => s + i.delta, 0);
  const adjustments = loc.climateScore - (100 + sum);
  return { items, base: 100, adjustments, final: loc.climateScore };
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export type ForecastOutlook = {
  label: string;
  level: "Low" | "Moderate" | "High" | "Severe" | "Good";
  detail: string;
  token: "heat" | "rainfall" | "aqi";
  confidence: ConfidenceLevel;
};

export function getLocalForecast(loc: Locality): {
  window: string;
  updated: string;
  outlooks: ForecastOutlook[];
} {
  const heatLevel: ForecastOutlook["level"] =
    loc.heatRisk.value >= 75 ? "Severe" : loc.heatRisk.value >= 60 ? "High" : loc.heatRisk.value >= 45 ? "Moderate" : "Low";
  const aqiLevel: ForecastOutlook["level"] =
    loc.airQuality.aqi >= 150 ? "Severe" : loc.airQuality.aqi >= 120 ? "High" : loc.airQuality.aqi >= 100 ? "Moderate" : "Good";
  const rainLevel: ForecastOutlook["level"] =
    loc.rainfall.delta <= -30 ? "Severe" : loc.rainfall.delta <= -15 ? "High" : loc.rainfall.delta < 0 ? "Moderate" : "Good";

  return {
    window: "Next 72 hours",
    updated: "Just now",
    outlooks: [
      { label: "Heat Outlook", level: heatLevel, detail: `Peak ${(loc.temperature.value + 1.2).toFixed(1)}°C · ${loc.temperature.delta > 0 ? "+" : ""}${loc.temperature.delta}° vs normal`, token: "heat", confidence: "High" },
      { label: "Rainfall Outlook", level: rainLevel, detail: rainLevel === "Good" ? "Showers likely · soil recharge expected" : `Deficit ${Math.abs(loc.rainfall.delta)}% · low probability of relief`, token: "rainfall", confidence: "Medium" },
      { label: "Air Quality Outlook", level: aqiLevel, detail: `AQI band ${loc.airQuality.aqi - 10}–${loc.airQuality.aqi + 14} · ${loc.airQuality.label}`, token: "aqi", confidence: "Medium" },
    ],
  };
}
