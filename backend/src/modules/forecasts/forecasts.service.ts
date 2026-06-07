import { ForecastsRepository, type ClimateForecast } from "./forecasts.repo.js";

export class ForecastsService {
  constructor(private readonly repo: ForecastsRepository) {}

  async saveForecasts(forecasts: ClimateForecast[]): Promise<void> {
    await this.repo.upsertForecasts(forecasts);
  }

  async getForecastsForLocality(localityId: string, limit: number = 30): Promise<ClimateForecast[]> {
    return this.repo.getForecastsForLocality(localityId, limit);
  }
}
export type { ClimateForecast };
