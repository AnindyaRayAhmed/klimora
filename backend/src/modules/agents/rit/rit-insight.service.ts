import { SupabaseClient } from "@supabase/supabase-js";
import { RitInsightSeverity } from "./rit.types.js";

export interface RitInsightData {
  localityId: string;
  userId?: string;
  insightType: string;
  severity: RitInsightSeverity;
  title: string;
  body: string;
  metadata?: any;
}

export class RitInsightService {
  constructor(private readonly supabase: SupabaseClient) {}

  private getSuppressionWindowHours(severity: RitInsightSeverity): number {
    switch (severity) {
      case RitInsightSeverity.LOW: return 24;
      case RitInsightSeverity.MEDIUM: return 12;
      case RitInsightSeverity.HIGH: return 6;
      case RitInsightSeverity.CRITICAL: return 0;
    }
  }

  private getExpirationHours(severity: RitInsightSeverity): number {
    switch (severity) {
      case RitInsightSeverity.LOW: return 48;
      case RitInsightSeverity.MEDIUM: return 24;
      case RitInsightSeverity.HIGH: return 12;
      case RitInsightSeverity.CRITICAL: return 6;
    }
  }

  async evaluateAndStoreInsight(data: RitInsightData): Promise<void> {
    const suppressionHours = this.getSuppressionWindowHours(data.severity);

    // 1. Check Noise Suppression
    if (suppressionHours > 0) {
      const suppressionCutoff = new Date(Date.now() - suppressionHours * 60 * 60 * 1000).toISOString();
      
      let query = this.supabase
        .from("rit_insights")
        .select("id")
        .eq("locality_id", data.localityId)
        .eq("insight_type", data.insightType)
        .gte("created_at", suppressionCutoff);

      if (data.userId) {
        query = query.eq("user_id", data.userId);
      } else {
        query = query.is("user_id", null);
      }

      const { data: existing } = await query.limit(1);
      
      if (existing && existing.length > 0) {
        // Insight is suppressed due to recent identical generation
        return;
      }
    }

    // 2. Enforce Max Insight Limits
    const now = new Date().toISOString();
    const limitQuery = this.supabase
      .from("rit_insights")
      .select("id", { count: "exact" })
      .eq("locality_id", data.localityId)
      .gt("expires_at", now);

    if (data.userId) {
      const { count: userCount } = await limitQuery.eq("user_id", data.userId);
      if (userCount && userCount >= 3) {
        return;
      }
    } else {
      const { count: locCount } = await limitQuery.is("user_id", null);
      if (locCount && locCount >= 5) {
        return;
      }
    }

    // 3. Store Insight
    const expirationHours = this.getExpirationHours(data.severity);
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000).toISOString();

    await this.supabase.from("rit_insights").insert({
      locality_id: data.localityId,
      user_id: data.userId || null,
      insight_type: data.insightType,
      severity: data.severity,
      title: data.title,
      body: data.body,
      metadata: data.metadata || {},
      created_at: now,
      expires_at: expiresAt
    });
  }

  async getActiveInsights(localityId: string, userId?: string) {
    const now = new Date().toISOString();
    
    let query = this.supabase
      .from("rit_insights")
      .select("*")
      .eq("locality_id", localityId)
      .gt("expires_at", now)
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},user_id.is.null`);
    } else {
      query = query.is("user_id", null);
    }

    const { data } = await query;
    return data || [];
  }
}
