import { SupabaseClient } from "@supabase/supabase-js";
import { ClimateScoreService } from "../../climate/climate-score.service.js";
import { ForecastsService } from "../../forecasts/forecasts.service.js";
import { MissionsService } from "../../missions/missions.service.js";
import { RecommendationAgentService } from "../recommendations/recommendation-agent.service.js";
import { OpenWeatherClient } from "../../../providers/openweather/openweather.client.js";
import { PlanetClient } from "../../../providers/planet/planet.client.js";
import { RitBehaviorProfile } from "./rit.types.js";
import { ClimateSignalsService } from "../../climate/climate-signals.service.js";
import { ClimateScoreEngine } from "../../climate/climate-score.engine.js";
import { getActiveScoreVersion } from "../../climate/score-versioning.js";

/**
 * Rit internal tools abstraction layer.
 * Provides clean centralized data retrieval for context assembly.
 */
export class RitToolsService {
  private openWeather: OpenWeatherClient;
  private planet: PlanetClient;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly climateScoreService: ClimateScoreService,
    private readonly forecastsService: ForecastsService,
    private readonly missionsService: MissionsService,
    private readonly recommendationAgentService: RecommendationAgentService
  ) {
    this.openWeather = new OpenWeatherClient();
    this.planet = new PlanetClient();
  }

  async getLocalityCoordinates(localityId: string) {
    const { data } = await this.supabase.from("localities").select("latitude, longitude").eq("id", localityId).single();
    return data;
  }

  async getLatestClimateScore(localityId: string) {
    if (localityId === "dynamic" || localityId.startsWith("dynamic-")) {
      return null;
    }
    try {
      return await this.climateScoreService.getLatestForLocality(localityId);
    } catch {
      return null;
    }
  }

  async getDynamicClimateScore(lat: number, lon: number, city: string) {
    console.log("[Rit Debug] Using coordinate-native context for climate score");
    try {
      const [weatherData, aqiData, ndviData] = await Promise.all([
        this.openWeather.getCurrentWeather(lat, lon).catch(() => null),
        this.openWeather.getAirQuality(lat, lon).catch(() => null),
        this.planet.getNdviForLocation(lat, lon).catch(() => null),
      ]);

      const signalsService = new ClimateSignalsService();
      const snapshot = signalsService.normalizeProviderData({
        localityId: "dynamic",
        weather: weatherData,
        aqi: aqiData,
        ndvi: ndviData,
        rainfall: null, 
      });

      const version = getActiveScoreVersion();
      const engine = new ClimateScoreEngine(version);
      
      const confidences = {
        heat: snapshot.temperatureC !== null ? 1.0 : 0.0,
        aqi: snapshot.aqi !== null ? 1.0 : 0.0,
        vegetation: snapshot.ndvi !== null ? 1.0 : 0.0,
        rainfall: snapshot.rainfallAnomalyPct !== null ? 1.0 : 0.0,
        historical_trend: 0.0,
      };

      const result = engine.compute(snapshot, { current90DayAvg: null, prev90DayAvg: null }, confidences);

      return {
        score: result.score,
        label: result.label,
        trend: result.trend,
        confidence: result.confidence,
        metrics: {
          temperatureC: snapshot.temperatureC,
          heatIndexC: snapshot.heatIndexC,
          aqi: snapshot.aqi,
          ndvi: snapshot.ndvi,
          rainfallMm: snapshot.rainfallMm,
          rainfallAnomalyPct: snapshot.rainfallAnomalyPct
        },
        breakdown: result.breakdown
      };
    } catch (e) {
      console.warn("Dynamic climate score assembly failed in RitTools");
      return null;
    }
  }

  async getLiveForecast(localityId: string, lat: number, lon: number) {
    try {
      const live = await this.openWeather.getForecast(lat, lon);
      if (live) return { source: "live", data: live };
    } catch (e) {
      console.warn("Live forecast failed, falling back to stored");
    }
    if (localityId === "dynamic" || localityId.startsWith("dynamic-")) {
      return { source: "stored", data: [] };
    }
    try {
      const stored = await this.forecastsService.getForecastsForLocality(localityId, 5);
      return { source: "stored", data: stored };
    } catch {
      return { source: "stored", data: [] };
    }
  }

  async getFreshNDVI(localityId: string, lat: number, lon: number) {
    const isDynamic = localityId === "dynamic" || localityId.startsWith("dynamic-");
    if (!isDynamic) {
      const score = await this.getLatestClimateScore(localityId);
      if (score && score.metrics.ndviTimestamp) {
        const ageHours = (Date.now() - new Date(score.metrics.ndviTimestamp).getTime()) / (1000 * 60 * 60);
        if (ageHours < 24) {
          return { value: score.metrics.ndvi, source: "stored_cache", timestamp: score.metrics.ndviTimestamp };
        }
      }
    }
    try {
      const ndvi = await this.planet.getNdviForLocation(lat, lon);
      return ndvi;
    } catch (e) {
      return { value: null, source: "stored_fallback", observedAt: new Date().toISOString() };
    }
  }

  async getActiveMissions() {
    try {
      return await this.missionsService.listActiveMissions();
    } catch {
      return [];
    }
  }

  async getRecommendations(localityId: string, userId: string) {
    if (localityId === "dynamic" || localityId.startsWith("dynamic-")) {
      return [];
    }
    try {
      return await this.recommendationAgentService.getRecommendations(localityId, userId);
    } catch {
      return [];
    }
  }

  async getUserProfile(userId: string) {
    const { data } = await this.supabase
      .from("profiles")
      .select("id, full_name, total_points, level, home_locality_id")
      .eq("id", userId)
      .single();
    return data;
  }

  async getLatestVerificationResult(userId: string) {
    const { data: submission } = await this.supabase
      .from("mission_submissions")
      .select("id, status, missions(title)")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .single();

    if (!submission) return null;

    const { data: result } = await this.supabase
      .from("verification_results")
      .select("*")
      .eq("submission_id", submission.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return { submission, result };
  }

  async getCommunityImpact(localityId: string) {
    if (localityId === "dynamic" || localityId.startsWith("dynamic-")) {
      return { verifiedMissionsCount: 0 };
    }
    const { count } = await this.supabase
      .from("mission_submissions")
      .select("*", { count: "exact", head: true })
      .eq("locality_id", localityId)
      .eq("status", "verified");
      
    return {
      verifiedMissionsCount: count || 0
    };
  }

  async getClimateTrendNarrative(localityId: string): Promise<string> {
    if (localityId === "dynamic" || localityId.startsWith("dynamic-")) {
      return "Live coordinate reading — trend history not tracked.";
    }
    try {
      const history = await this.climateScoreService.getHistoryForLocality(localityId, 30);
      if (history.length < 2) return "Insufficient data for trend analysis.";
      const latest = history[0]!;
      const oldest = history[history.length - 1]!;
      
      let narrative = `Over the past ${history.length} days, the climate score went from ${oldest.score} to ${latest.score}. `;
      if (latest.metrics.aqi && oldest.metrics.aqi) {
        narrative += `AQI changed from ${oldest.metrics.aqi} to ${latest.metrics.aqi}. `;
      }
      return narrative;
    } catch {
      return "Unable to retrieve trend data.";
    }
  }

  async inferBehaviorProfile(userId: string): Promise<RitBehaviorProfile> {
    const { data: submissions } = await this.supabase
      .from("mission_submissions")
      .select("status, missions(category)")
      .eq("user_id", userId)
      .eq("status", "verified")
      .order("submitted_at", { ascending: false })
      .limit(20);

    if (!submissions || submissions.length === 0) return RitBehaviorProfile.LOW_ACTIVITY_USER;
    
    const categoryCounts: Record<string, number> = {};
    for (const sub of submissions) {
      const missionsData = sub.missions as any;
      const cat = Array.isArray(missionsData) ? missionsData[0]?.category : missionsData?.category;
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    if (categoryCounts["green"] && categoryCounts["green"] >= 3) return RitBehaviorProfile.TREE_ADVOCATE;
    if (categoryCounts["community"] && categoryCounts["community"] >= 3) return RitBehaviorProfile.COMMUNITY_VOLUNTEER;

    return RitBehaviorProfile.GENERAL_USER;
  }
}
