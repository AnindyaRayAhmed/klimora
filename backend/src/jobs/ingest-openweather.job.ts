import { OpenWeatherClient } from "../providers/openweather/openweather.client.js";
import { PlanetClient } from "../providers/planet/planet.client.js";
import { ClimateSignalsService } from "../modules/climate/climate-signals.service.js";
import { ClimateRepository } from "../modules/climate/climate.repo.js";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import path from "path";

// Ingestion execution logic
export async function runIngestOpenweatherJob() {
  console.log("Starting ingest-openweather job...");

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  const climateRepo = new ClimateRepository(supabase);
  const signalsService = new ClimateSignalsService();
  
  const weatherClient = new OpenWeatherClient();
  const planetClient = new PlanetClient();

  // Fetch localities
  const { data: localities, error } = await supabase.from("localities").select("id, latitude, longitude");
  if (error) {
    console.error("Failed to fetch localities", error);
    return;
  }

  for (const locality of localities) {
    try {
      const lat = Number(locality.latitude);
      const lon = Number(locality.longitude);

      // Fetch live weather (contains rainMm)
      const weather = await weatherClient.getCurrentWeather(lat, lon);
      
      // Fetch air quality
      const aqi = await weatherClient.getAirQuality(lat, lon);
      
      // Fetch rainfall baseline hierarchy
      const rainMm = weather?.rainMm ?? 0;
      let baselineMm: number | null = null;
      let baselineSource: string = "";
      let baselineConfidence: string = "";

      // Priority 1: OpenWeather Historical Baseline
      baselineMm = await weatherClient.getHistoricalRainfallBaseline(lat, lon);
      if (baselineMm !== null) {
        baselineSource = "OPENWEATHER_HISTORY";
        baselineConfidence = "HIGH";
      }

      // Priority 2: Seasonally Comparable Klimora History
      if (baselineMm === null) {
        const currentMonth = new Date().getMonth() + 1;
        const seasonalSnapshots = await climateRepo.getSeasonalClimateHistory(locality.id, currentMonth);
        const validSeasonal = seasonalSnapshots.map(s => s.rainfallMm).filter((r): r is number => r !== null);
        if (validSeasonal.length >= 5) { // Assuming 5 is sufficient
          baselineMm = validSeasonal.reduce((a, b) => a + b, 0) / validSeasonal.length;
          baselineSource = "KLIMORA_SEASONAL";
          baselineConfidence = "HIGH";
        }
      }

      // Priority 3: Rolling Klimora History
      if (baselineMm === null) {
        const rollingSnapshots = await climateRepo.getClimateHistory(locality.id, 90);
        const validRolling = rollingSnapshots.map(s => s.rainfallMm).filter((r): r is number => r !== null);
        if (validRolling.length >= 5) { // Assuming 5 is sufficient
          baselineMm = validRolling.reduce((a, b) => a + b, 0) / validRolling.length;
          baselineSource = "KLIMORA_ROLLING";
          baselineConfidence = "MEDIUM";
        }
      }

      // Priority 4: 80mm Fallback
      if (baselineMm === null) {
        baselineMm = 80;
        baselineSource = "FALLBACK";
        baselineConfidence = "LOW";
      }

      let anomalyPct = 0;
      if (baselineMm !== null && baselineMm > 0) {
        anomalyPct = ((rainMm - baselineMm) / baselineMm) * 100;
      }

      const rainfall = {
        mm: rainMm,
        baselineMm,
        baselineSource: baselineSource || null,
        baselineConfidence: baselineConfidence || null,
        anomalyPct
      };
      
      // Fetch real NDVI from Sentinel Hub Statistical API
      const ndvi = await planetClient.getNdviForLocation(lat, lon);

      const rawData = {
        localityId: locality.id,
        weather,
        aqi,
        rainfall,
        ndvi: {
          value: ndvi.value,
          source: ndvi.source,
          observedAt: ndvi.observedAt
        },
        observedAt: new Date().toISOString()
      };

      const snapshot = signalsService.normalizeProviderData(rawData);
      await climateRepo.createClimateSnapshot(snapshot);
      
      console.log(`Successfully ingested snapshot for locality ${locality.id} with NDVI ${ndvi.value} and Rainfall ${rainfall.mm}mm.`);
    } catch (e) {
      console.error(`Error processing locality ${locality.id}:`, e);
    }
  }
  
  console.log("ingest-openweather job completed.");
}

const nodePath = fileURLToPath(import.meta.url);
const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (nodePath === argvPath) {
  runIngestOpenweatherJob().catch(console.error);
}
