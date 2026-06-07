import { OpenWeatherClient } from "../providers/openweather/openweather.client.js";
import { ForecastsRepository } from "../modules/forecasts/forecasts.repo.js";
import { ForecastsService } from "../modules/forecasts/forecasts.service.js";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import path from "path";

export async function runRefreshForecastsJob() {
  console.log("Starting refresh-forecasts job...");

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  const weatherClient = new OpenWeatherClient();
  const forecastsRepo = new ForecastsRepository(supabase);
  const forecastsService = new ForecastsService(forecastsRepo);

  const { data: localities, error } = await supabase.from("localities").select("id, latitude, longitude");
  if (error) {
    console.error("Failed to fetch localities", error);
    return;
  }

  for (const locality of localities) {
    try {
      const forecast = await weatherClient.getForecast(Number(locality.latitude), Number(locality.longitude));
      if (!forecast || !forecast.list) {
        continue;
      }
      
      // Group OpenWeather 3-hour intervals by day (YYYY-MM-DD)
      const dailyGroups: Record<string, { tempSum: number; heatIndexSum: number; rainSum: number; count: number }> = {};
      
      for (const item of forecast.list) {
        if (!item.dt) continue;
        const dateStr = new Date(item.dt * 1000).toISOString().split("T")[0]!;
        
        if (!dailyGroups[dateStr]) {
          dailyGroups[dateStr] = { tempSum: 0, heatIndexSum: 0, rainSum: 0, count: 0 };
        }
        
        const group = dailyGroups[dateStr]!;
        group.tempSum += item.main?.temp ?? 0;
        group.heatIndexSum += item.main?.feels_like ?? item.main?.temp ?? 0;
        group.rainSum += item.rain?.["3h"] ?? 0;
        group.count += 1;
      }

      const forecastsToSave = Object.entries(dailyGroups).map(([dateStr, stats]) => ({
        localityId: locality.id,
        forecastDate: dateStr,
        temperatureC: stats.count > 0 ? stats.tempSum / stats.count : null,
        heatIndexC: stats.count > 0 ? stats.heatIndexSum / stats.count : null,
        aqi: null, // AQI is not part of standard weather forecast payload
        rainfallMm: stats.rainSum, // sum up total expected rainfall for the day
      }));

      if (forecastsToSave.length > 0) {
        await forecastsService.saveForecasts(forecastsToSave);
        console.log(`Successfully stored ${forecastsToSave.length} daily forecast entries for locality ${locality.id}.`);
      }
    } catch (e) {
      console.error(`Error processing forecast for locality ${locality.id}:`, e);
    }
  }
  
  console.log("refresh-forecasts job completed.");
}

const nodePath = fileURLToPath(import.meta.url);
const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (nodePath === argvPath) {
  runRefreshForecastsJob().catch(console.error);
}
