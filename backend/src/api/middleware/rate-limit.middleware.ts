/**
 * Rate-limit middleware configuration placeholder.
 * TODO: Apply stricter limits for Rit, media verification, and admin endpoints.
 */
export interface RateLimitPolicy {
  max: number;
  window: string;
}
