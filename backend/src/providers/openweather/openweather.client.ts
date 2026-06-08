import { env } from "../../config/env.js";

export class OpenWeatherClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.openweathermap.org/data/2.5";

  constructor() {
    this.apiKey = env.openWeatherApiKey || "";
  }

  private async fetchOpenWeather<T = any>(endpoint: string, params: Record<string, string>): Promise<T | null> {
    if (!this.apiKey) {
      console.warn("OpenWeather API key is missing.");
      return null;
    }
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.append("appid", this.apiKey);
    for (const [key, val] of Object.entries(params)) {
      url.searchParams.append(key, val);
    }
    
    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(`OpenWeather API error: ${response.status}`);
        return null;
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error("OpenWeather network error:", error);
      return null;
    }
  }

  async getCurrentWeather(lat: number, lon: number) {
    interface CurrentWeatherResponse {
      main?: { temp: number; feels_like: number; humidity: number };
      rain?: { "1h"?: number; "3h"?: number };
    }
    const data = await this.fetchOpenWeather<CurrentWeatherResponse>("/weather", { lat: lat.toString(), lon: lon.toString(), units: "metric" });
    if (!data) return null;
    return {
      tempC: data.main?.temp,
      heatIndexC: data.main?.feels_like,
      humidity: data.main?.humidity,
      rainMm: data.rain?.["1h"] ?? data.rain?.["3h"] ?? 0,
    };
  }

  async getForecast(lat: number, lon: number) {
    interface ForecastResponse {
      list?: Array<{
        dt: number;
        main?: { temp: number; feels_like: number };
        rain?: { "3h"?: number };
      }>;
    }
    return this.fetchOpenWeather<ForecastResponse>("/forecast", { lat: lat.toString(), lon: lon.toString(), units: "metric" });
  }

  async getAirQuality(lat: number, lon: number) {
    interface AirQualityResponse {
      list?: Array<{
        main: { aqi: number };
      }>;
    }
    const data = await this.fetchOpenWeather<AirQualityResponse>("/air_pollution", { lat: lat.toString(), lon: lon.toString() });
    if (!data || !data.list || data.list.length === 0) return null;
    
    const firstItem = data.list[0];
    if (!firstItem) return null;
    
    // Map OpenWeather AQI (1-5) to roughly US EPA standard for the formula (0-500)
    const rawAqi = firstItem.main.aqi;
    const aqiMap: Record<number, number> = { 1: 25, 2: 75, 3: 125, 4: 175, 5: 250 };
    return { aqiValue: aqiMap[rawAqi] || 50 };
  }

  async getHistoricalRainfallBaseline(lat: number, lon: number): Promise<number | null> {
    // Attempt to fetch from OpenWeather historical or climate endpoints
    // Note: Free tier might not have access to this, so we wrap in try-catch and return null if unauthorized/not available
    // Currently, we don't have a reliable free OpenWeather history API that gives a baseline without subscription, 
    // so we return null to force fallback to the Klimora snapshots logic.
    return null; 
  }
}
