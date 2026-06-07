/**
 * Cache policy registry.
 * TODO: Tune TTLs by provider cost, freshness requirements, and user-facing risk.
 */
export interface CachePolicy {
  ttlSeconds: number;
  allowStale: boolean;
}
