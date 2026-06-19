import { env } from "../../config/env.js";

export class GoogleMapsClient {
  private readonly apiKey: string;

  constructor() {
    this.apiKey = env.googleMapsApiKey || "";
  }

  async reverseGeocode(lat: number, lon: number) {
    if (!this.apiKey) {
      console.warn("Google Maps API key missing.");
      return null;
    }
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${this.apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[GoogleMapsClient] Reverse geocoding failed with status: ${response.status}`);
        return null;
      }
      const data = (await response.json()) as { results?: any[], status?: string, error_message?: string };
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`[GoogleMapsClient] API returned non-OK status: ${data.status}, message: ${data.error_message || 'N/A'}`);
      }
      return data.results?.[0] || null;
    } catch (error) {
      console.error("[GoogleMapsClient] Exception during reverse geocoding:", error);
      return null;
    }
  }

  async getLocationMetadata(lat: number, lon: number) {
    return this.reverseGeocode(lat, lon);
  }
}
