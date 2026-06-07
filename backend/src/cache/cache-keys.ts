/**
 * Cache key registry.
 * TODO: Keep keys centralized so invalidation remains explainable and testable.
 */
export const cacheKeyPrefixes = {
  locality: "locality",
  climateScore: "climate-score",
  forecast: "forecast",
  layer: "layer",
  rankings: "rankings",
  ritContext: "rit-context",
} as const;
