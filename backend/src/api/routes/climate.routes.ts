import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ClimateRepository } from "../../modules/climate/climate.repo.js";
import { ClimateScoreService } from "../../modules/climate/climate-score.service.js";
import { ForecastsRepository } from "../../modules/forecasts/forecasts.repo.js";
import { ForecastsService } from "../../modules/forecasts/forecasts.service.js";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";

const querySchema = z.object({
  localityId: z.string(),
  limit: z.coerce.number().min(1).max(100).optional().default(30),
});

const coordinateQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

import { LocalitiesRepository } from "../../modules/localities/localities.repo.js";
import { LocalitiesService } from "../../modules/localities/localities.service.js";
import { GoogleMapsClient } from "../../providers/google-maps/google-maps.client.js";
import { OpenWeatherClient } from "../../providers/openweather/openweather.client.js";
import { PlanetClient } from "../../providers/planet/planet.client.js";
import { ClimateSignalsService } from "../../modules/climate/climate-signals.service.js";
import { ClimateScoreEngine } from "../../modules/climate/climate-score.engine.js";
import { getActiveScoreVersion } from "../../modules/climate/score-versioning.js";

export async function registerClimateRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const repo = new ClimateRepository(supabase);
  const service = new ClimateScoreService(repo);
  const forecastsRepo = new ForecastsRepository(supabase);
  const forecastsService = new ForecastsService(forecastsRepo);
  const localitiesService = new LocalitiesService(new LocalitiesRepository(supabase));

  // Preserve existing route if it was used somewhere
  app.get("/localities/:localityId/latest", async (request) => {
    const params = z.object({ localityId: z.string() }).parse(request.params);
    const locality = await localitiesService.getLocalityBySlugOrId(params.localityId);
    return { data: await service.getLatestForLocality(locality.id) };
  });

  app.get("/latest", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    return { data: await service.getLatestForLocality(locality.id) };
  });

  app.get("/history", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    return { data: await service.getHistoryForLocality(locality.id, query.limit) };
  });

  app.get("/forecast", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    const data = await forecastsService.getForecastsForLocality(locality.id, query.limit);
    return { data };
  });

  app.get("/coordinates", async (request) => {
    const query = coordinateQuerySchema.parse(request.query);
    
    // 1. Reverse geocode
    const mapsClient = new GoogleMapsClient();
    const locationMeta = await mapsClient.reverseGeocode(query.lat, query.lng);
    
    let city = "Unknown City";
    let state = "Unknown State";
    let country = "Unknown Country";
    
    if (locationMeta && locationMeta.address_components) {
      const getComponent = (type: string) => 
        locationMeta.address_components.find((c: any) => c.types.includes(type))?.long_name;
      city = getComponent("locality") || getComponent("administrative_area_level_2") || city;
      state = getComponent("administrative_area_level_1") || state;
      country = getComponent("country") || country;
    }

    // 2. Fetch live data
    const openWeather = new OpenWeatherClient();
    const planet = new PlanetClient();

    const [weatherData, aqiData, ndviData] = await Promise.all([
      openWeather.getCurrentWeather(query.lat, query.lng),
      openWeather.getAirQuality(query.lat, query.lng),
      planet.getNdviForLocation(query.lat, query.lng),
    ]);

    // 3. Normalize
    const signalsService = new ClimateSignalsService();
    const dynamicId = `dynamic-${query.lat.toFixed(4)}-${query.lng.toFixed(4)}`;
    const snapshot = signalsService.normalizeProviderData({
      localityId: dynamicId,
      weather: weatherData,
      aqi: aqiData,
      ndvi: ndviData,
      rainfall: null, // OpenWeather free tier lacks good rainfall baseline
    });

    // 4. Compute Dynamic Score
    const version = getActiveScoreVersion();
    const engine = new ClimateScoreEngine(version);
    
    const confidences = {
      heat: snapshot.temperatureC !== null ? 1.0 : 0.0,
      aqi: snapshot.aqi !== null ? 1.0 : 0.0,
      vegetation: snapshot.ndvi !== null ? 1.0 : 0.0,
      rainfall: snapshot.rainfallAnomalyPct !== null ? 1.0 : 0.0,
      historical_trend: 0.0, // No history for dynamic
    };

    const result = engine.compute(snapshot, { current90DayAvg: null, prev90DayAvg: null }, confidences);

    // 5. Construct Response
    return {
      data: {
        id: dynamicId,
        slug: dynamicId,
        name: city,
        city: city,
        state: state,
        country: country,
        latitude: query.lat,
        longitude: query.lng,
        score: result.score,
        label: result.label,
        trend: result.trend,
        confidence: result.confidence,
        metrics: {
          temperatureC: snapshot.temperatureC,
          heatIndexC: snapshot.heatIndexC,
          aqi: snapshot.aqi,
          ndvi: snapshot.ndvi,
          ndviSource: snapshot.ndviSource,
          ndviTimestamp: snapshot.ndviTimestamp,
          rainfallMm: snapshot.rainfallMm,
          rainfallAnomalyPct: snapshot.rainfallAnomalyPct,
        },
        breakdown: result.breakdown,
        computedAt: new Date().toISOString()
      }
    };
  });
}
