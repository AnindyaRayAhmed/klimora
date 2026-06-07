import type { SupabaseClient } from "@supabase/supabase-js";

import { UpstreamDataError } from "../../shared/errors.js";
import type { Mission } from "./missions.types.js";

type MissionRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  points: number;
  active: boolean;
  verification_prompt_hint: string | null;
  created_at: string;
};

export class MissionsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findActive(): Promise<Mission[]> {
    const { data, error } = await this.supabase
      .from("missions")
      .select("id, slug, title, category, description, points, active, verification_prompt_hint, created_at")
      .eq("active", true)
      .order("points", { ascending: true });

    if (error) {
      throw new UpstreamDataError(`Failed to load missions: ${error.message}`);
    }

    return (data ?? []).map((row) => this.toDomain(row as MissionRow));
  }

  private toDomain(row: MissionRow): Mission {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      description: row.description,
      points: row.points,
      active: row.active,
      verificationPromptHint: row.verification_prompt_hint,
      createdAt: row.created_at,
    };
  }
}
