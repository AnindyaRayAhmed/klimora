import type { SupabaseClient } from "@supabase/supabase-js";

import { UpstreamDataError } from "../../shared/errors.js";
import type { Locality } from "./localities.types.js";

type LocalityRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number | string;
  longitude: number | string;
  description: string | null;
  created_at: string;
};

export class LocalitiesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findAll(): Promise<Locality[]> {
    const { data, error } = await this.supabase
      .from("localities")
      .select("id, slug, name, city, state, country, latitude, longitude, description, created_at")
      .order("name", { ascending: true });

    if (error) {
      throw new UpstreamDataError(`Failed to load localities: ${error.message}`);
    }

    return (data ?? []).map((row) => this.toDomain(row as LocalityRow));
  }

  async findById(id: string): Promise<Locality | null> {
    const { data, error } = await this.supabase
      .from("localities")
      .select("id, slug, name, city, state, country, latitude, longitude, description, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new UpstreamDataError(`Failed to load locality: ${error.message}`);
    }

    return data ? this.toDomain(data as LocalityRow) : null;
  }

  private toDomain(row: LocalityRow): Locality {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      city: row.city,
      state: row.state,
      country: row.country,
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      description: row.description,
      createdAt: row.created_at,
    };
  }
}
