import type { SupabaseClient } from "@supabase/supabase-js";

import { UpstreamDataError } from "../../shared/errors.js";
import type { ClimateScore, ClimateSnapshot } from "./climate.types.js";

type ClimateScoreRow = {
  id: string;
  locality_id: string;
  score: number;
  label: "Healthy" | "Fair" | "Stressed" | "Critical";
  trend: "improving" | "stable" | "declining";
  temperature_c: number | string | null;
  heat_index_c: number | string | null;
  aqi: number | null;
  ndvi: number | string | null;
  ndvi_source: string | null;
  ndvi_timestamp: string | null;
  rainfall_mm: number | string | null;
  rainfall_baseline_mm: number | string | null;
  rainfall_anomaly_pct: number | string | null;
  rainfall_baseline_source: string | null;
  rainfall_baseline_confidence: string | null;
  confidence: "High" | "Medium" | "Low";
  breakdown: unknown[];
  computed_at: string;
  created_at: string;
};

type ClimateSnapshotRow = {
  id: string;
  locality_id: string;
  temperature_c: number | string | null;
  heat_index_c: number | string | null;
  aqi: number | null;
  ndvi: number | string | null;
  ndvi_source: string | null;
  ndvi_timestamp: string | null;
  rainfall_mm: number | string | null;
  rainfall_baseline_mm: number | string | null;
  rainfall_anomaly_pct: number | string | null;
  rainfall_baseline_source: string | null;
  rainfall_baseline_confidence: string | null;
  observed_at: string;
  created_at: string;
};

export class ClimateRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findLatestByLocalityId(localityId: string): Promise<ClimateScore | null> {
    const { data, error } = await this.supabase
      .from("climate_scores")
      .select("*")
      .eq("locality_id", localityId)
      .order("computed_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new UpstreamDataError(`Failed to load climate score: ${error.message}`);
    }

    return data ? this.toDomain(data as ClimateScoreRow) : null;
  }

  async createClimateSnapshot(snapshot: ClimateSnapshot): Promise<ClimateSnapshot> {
    const { data, error } = await this.supabase
      .from("climate_snapshots")
      .insert({
        locality_id: snapshot.localityId,
        temperature_c: snapshot.temperatureC,
        heat_index_c: snapshot.heatIndexC,
        aqi: snapshot.aqi,
        ndvi: snapshot.ndvi,
        ndvi_source: snapshot.ndviSource || "planet",
        ndvi_timestamp: snapshot.ndviTimestamp || snapshot.observedAt,
        rainfall_mm: snapshot.rainfallMm,
        rainfall_baseline_mm: snapshot.rainfallBaselineMm,
        rainfall_baseline_source: snapshot.rainfallBaselineSource,
        rainfall_baseline_confidence: snapshot.rainfallBaselineConfidence,
        rainfall_anomaly_pct: snapshot.rainfallAnomalyPct,
        observed_at: snapshot.observedAt,
      })
      .select("*")
      .single();

    if (error) {
      throw new UpstreamDataError(`Failed to create climate snapshot: ${error.message}`);
    }

    return this.toSnapshotDomain(data as ClimateSnapshotRow);
  }

  async createClimateScore(score: ClimateScore): Promise<ClimateScore> {
    const { data, error } = await this.supabase
      .from("climate_scores")
      .insert({
        locality_id: score.localityId,
        score: score.score,
        label: score.label,
        trend: score.trend,
        temperature_c: score.temperatureC,
        heat_index_c: score.heatIndexC,
        aqi: score.aqi,
        ndvi: score.ndvi,
        ndvi_source: score.ndviSource || "planet",
        ndvi_timestamp: score.ndviTimestamp || score.computedAt,
        rainfall_mm: score.rainfallMm,
        rainfall_baseline_mm: score.rainfallBaselineMm,
        rainfall_baseline_source: score.rainfallBaselineSource,
        rainfall_baseline_confidence: score.rainfallBaselineConfidence,
        rainfall_anomaly_pct: score.rainfallAnomalyPct,
        confidence: score.confidence,
        breakdown: score.breakdown,
        computed_at: score.computedAt,
      })
      .select("*")
      .single();

    if (error) {
      throw new UpstreamDataError(`Failed to create climate score: ${error.message}`);
    }

    return this.toDomain(data as ClimateScoreRow);
  }

  async getClimateHistory(localityId: string, limit: number = 30): Promise<ClimateSnapshot[]> {
    const { data, error } = await this.supabase
      .from("climate_snapshots")
      .select("*")
      .eq("locality_id", localityId)
      .order("observed_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new UpstreamDataError(`Failed to load climate history: ${error.message}`);
    }

    return (data as ClimateSnapshotRow[]).map((row) => this.toSnapshotDomain(row));
  }

  async getSeasonalClimateHistory(localityId: string, currentMonth: number): Promise<ClimateSnapshot[]> {
    // Current month is 1-12 (JS getMonth() + 1 typically, but we should use 1-12).
    // PostgreSQL doesn't have an easy way to extract month via Supabase JS without RPC or raw SQL view.
    // However, since we just need history, we'll fetch all snapshots for the locality
    // and filter them in memory. In a real system with massive data, we'd use a DB function.
    const snapshots = await this.getClimateHistory(localityId, 1000); // Fetch a lot of history
    return snapshots.filter(s => {
      const d = new Date(s.observedAt);
      return (d.getMonth() + 1) === currentMonth; // JS getMonth is 0-indexed
    });
  }

  async getScoreHistory(localityId: string, limit: number = 30): Promise<ClimateScore[]> {
    const { data, error } = await this.supabase
      .from("climate_scores")
      .select("*")
      .eq("locality_id", localityId)
      .order("computed_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new UpstreamDataError(`Failed to load score history: ${error.message}`);
    }

    return (data as ClimateScoreRow[]).map((row) => this.toDomain(row));
  }

  private toDomain(row: ClimateScoreRow): ClimateScore {
    return {
      id: row.id,
      localityId: row.locality_id,
      version: "score-v1", // Default to v1 since it's not in DB schema yet
      score: row.score,
      label: row.label,
      trend: row.trend,
      temperatureC: row.temperature_c == null ? null : Number(row.temperature_c),
      heatIndexC: row.heat_index_c == null ? null : Number(row.heat_index_c),
      aqi: row.aqi,
      ndvi: row.ndvi == null ? null : Number(row.ndvi),
      ndviSource: row.ndvi_source ?? "planet",
      ndviTimestamp: row.ndvi_timestamp ?? row.computed_at,
      rainfallMm: row.rainfall_mm == null ? null : Number(row.rainfall_mm),
      rainfallBaselineMm: row.rainfall_baseline_mm == null ? null : Number(row.rainfall_baseline_mm),
      rainfallBaselineSource: row.rainfall_baseline_source ?? null,
      rainfallBaselineConfidence: row.rainfall_baseline_confidence ?? null,
      rainfallAnomalyPct:
        row.rainfall_anomaly_pct == null ? null : Number(row.rainfall_anomaly_pct),
      confidence: row.confidence,
      breakdown: Array.isArray(row.breakdown) ? (row.breakdown as any[]) : [],
      computedAt: row.computed_at,
      createdAt: row.created_at,
    };
  }

  private toSnapshotDomain(row: ClimateSnapshotRow): ClimateSnapshot {
    return {
      id: row.id,
      localityId: row.locality_id,
      temperatureC: row.temperature_c == null ? null : Number(row.temperature_c),
      heatIndexC: row.heat_index_c == null ? null : Number(row.heat_index_c),
      aqi: row.aqi,
      ndvi: row.ndvi == null ? null : Number(row.ndvi),
      ndviSource: row.ndvi_source ?? "planet",
      ndviTimestamp: row.ndvi_timestamp ?? row.observed_at,
      rainfallMm: row.rainfall_mm == null ? null : Number(row.rainfall_mm),
      rainfallBaselineMm: row.rainfall_baseline_mm == null ? null : Number(row.rainfall_baseline_mm),
      rainfallBaselineSource: row.rainfall_baseline_source ?? null,
      rainfallBaselineConfidence: row.rainfall_baseline_confidence ?? null,
      rainfallAnomalyPct:
        row.rainfall_anomaly_pct == null ? null : Number(row.rainfall_anomaly_pct),
      observedAt: row.observed_at,
      createdAt: row.created_at,
    };
  }
}
