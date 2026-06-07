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
      if (!response.ok) return null;
      const data = await response.json();
      return data.results?.[0] || null;
    } catch {
      return null;
    }
  }

  async getLocationMetadata(lat: number, lon: number) {
    return this.reverseGeocode(lat, lon);
  }
}
