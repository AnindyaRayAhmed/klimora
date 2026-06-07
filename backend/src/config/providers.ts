/**
 * Provider configuration contracts.
 * TODO: Load these values from Secret Manager in deployed Cloud Run environments.
 */
export type ProviderName = "supabase" | "gemini" | "planet" | "openweather" | "google-maps";

export interface ProviderConfig {
  name: ProviderName;
  enabled: boolean;
  baseUrl?: string;
}
