import { env } from "../../config/env.js";

export class PlanetClient {
  private readonly planetApiKey: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  // In-memory token cache
  private cachedToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor() {
    this.planetApiKey = env.planetApiKey || "";
    this.clientId = env.sentinelHubClientId || "";
    this.clientSecret = env.sentinelHubClientSecret || "";
  }

  /**
   * Safe, cached retriever for the active Sentinel Hub access token.
   * Leverages client credentials grant flow if ID and Secret are configured.
   * Falls back to PLANET_API_KEY directly if client credentials are not available.
   */
  private async getAccessToken(): Promise<string | null> {
    // 1. If we have a valid cached token that isn't about to expire (with a 60-second buffer), reuse it
    if (this.cachedToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken;
    }

    // 2. Attempt to fetch OAuth token using Sentinel Hub Client Credentials if available
    if (this.clientId && this.clientSecret) {
      try {
        console.log("Sentinel Hub access token expired or missing. Fetching new OAuth token via client credentials...");
        
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", this.clientId);
        params.append("client_secret", this.clientSecret);

        const response = await fetch("https://services.sentinel-hub.com/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: params.toString()
        });

        if (!response.ok) {
          throw new Error(`OAuth server returned status ${response.status}`);
        }

        const data = await response.json();
        const token = data?.access_token;
        const expiresIn = data?.expires_in ?? 3600; // default to 1 hour

        if (token) {
          this.cachedToken = token;
          this.tokenExpiresAt = Date.now() + expiresIn * 1000;
          console.log("Successfully cached new Sentinel Hub OAuth token.");
          return this.cachedToken;
        }

        throw new Error("Access token missing from OAuth response payload.");
      } catch (error) {
        console.error("Failed to acquire Sentinel Hub OAuth token:", error);
        // Do not crash; fall through to see if we can use legacy PLANET_API_KEY
      }
    }

    // 3. Backward compatibility: fall back to using PLANET_API_KEY as the Bearer token directly
    if (this.planetApiKey) {
      console.warn("Sentinel Hub OAuth credentials missing or failed. Falling back to legacy PLANET_API_KEY authentication.");
      return this.planetApiKey;
    }

    return null;
  }

  async getNdviForLocation(lat: number, lon: number) {
    const token = await this.getAccessToken();

    if (!token) {
      console.warn("No valid Planet API key or Sentinel Hub OAuth credentials found. Returning default NDVI.");
      return { value: 0.65, source: "mock", observedAt: new Date().toISOString() };
    }

    // Construct a small bounding box around the coordinates (approx. 100m x 100m)
    const delta = 0.0009; // approx 100m in degrees
    const minLon = lon - delta;
    const minLat = lat - delta;
    const maxLon = lon + delta;
    const maxLat = lat + delta;

    const requestBody = {
      input: {
        bounds: {
          bbox: [minLon, minLat, maxLon, maxLat],
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
          }
        },
        data: [
          {
            type: "sentinel-2-l2a",
            dataFilter: {
              timeRange: {
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // last 30 days
                to: new Date().toISOString()
              },
              maxCloudCoverage: 20
            }
          }
        ]
      },
      aggregation: {
        timeRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        },
        aggregationInterval: {
          of: "P30D"
        },
        evalscript: `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08"],
    output: { bands: 1 }
  };
}
function evaluatePixel(samples) {
  let ndvi = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
  return [ndvi];
}`
      }
    };

    try {
      const response = await fetch("https://services.sentinel-hub.com/api/v1/statistics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.warn(`Sentinel Hub Statistical API returned status ${response.status}. Falling back to default.`);
        return { value: 0.65, source: "sentinel_hub_fallback", observedAt: new Date().toISOString() };
      }

      const data = await response.json();
      
      const meanNdvi = data?.data?.[0]?.outputs?.default?.bands?.B0?.stats?.mean;
      if (meanNdvi !== undefined && meanNdvi !== null && !isNaN(Number(meanNdvi))) {
        return {
          value: Number(meanNdvi),
          source: "sentinel_hub",
          observedAt: data?.data?.[0]?.interval?.from || new Date().toISOString()
        };
      }

      console.warn("Sentinel Hub response missing NDVI mean metric. Falling back to default.");
      return { value: 0.65, source: "sentinel_hub_fallback", observedAt: new Date().toISOString() };
    } catch (error) {
      console.error("Sentinel Hub Statistical API error:", error);
      return { value: 0.65, source: "sentinel_hub_error_fallback", observedAt: new Date().toISOString() };
    }
  }

  async getVegetationTrend(lat: number, lon: number) {
    return { trend: "stable" as const };
  }
}
