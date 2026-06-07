import type { SupabaseClient } from "@supabase/supabase-js";
import { UpstreamDataError } from "../../shared/errors.js";

export interface ClimateForecast {
  id?: string;
  localityId: string;
  forecastDate: string; // YYYY-MM-DD
  temperatureC: number | null;
  heatIndexC: number | null;
  aqi: number | null;
  rainfallMm: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export class ForecastsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async upsertForecasts(forecasts: ClimateForecast[]): Promise<void> {
    if (forecasts.length === 0) return;

    const rows = forecasts.map((f) => ({
      locality_id: f.localityId,
      forecast_date: f.forecastDate,
      temperature_c: f.temperatureC,
      heat_index_c: f.heatIndexC,
      aqi: f.aqi,
      rainfall_mm: f.rainfallMm,
    }));

    const { error } = await this.supabase
      .from("climate_forecasts")
      .upsert(rows, { onConflict: "locality_id,forecast_date" });

    if (error) {
      throw new UpstreamDataError(`Failed to upsert climate forecasts: ${error.message}`);
    }
  }

  async getForecastsForLocality(localityId: string, limit: number = 30): Promise<ClimateForecast[]> {
    const { data, error } = await this.supabase
      .from("climate_forecasts")
      .select("*")
      .eq("locality_id", localityId)
      .order("forecast_date", { ascending: true })
      .limit(limit);

    if (error) {
      throw new UpstreamDataError(`Failed to fetch forecasts: ${error.message}`);
    }

    return (data || []).map((row) => ({
      id: row.id,
      localityId: row.locality_id,
      forecastDate: row.forecast_date,
      temperatureC: row.temperature_c == null ? null : Number(row.temperature_c),
      heatIndexC: row.heat_index_c == null ? null : Number(row.heat_index_c),
      aqi: row.aqi,
      rainfallMm: row.rainfall_mm == null ? null : Number(row.rainfall_mm),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }
}
