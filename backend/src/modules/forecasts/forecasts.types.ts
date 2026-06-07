/**
 * Forecast module contracts.
 * TODO: Model provider freshness, uncertainty, and forecast windows.
 */
export interface EnvironmentalForecast {
  localityId: string;
  windowStart: string;
  windowEnd: string;
  source: string;
}
