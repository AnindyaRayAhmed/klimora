import type { ClimateScoreVersion } from "./climate.types.js";

export const SCORE_VERSIONS: Record<string, ClimateScoreVersion> = {
  "score-v1": {
    id: "score-v1",
    status: "active",
    weights: {
      heat: 0.30,
      aqi: 0.25,
      vegetation: 0.20,
      rainfall: 0.15,
      historical_trend: 0.10,
    },
    createdAt: "2026-05-31T00:00:00Z",
    notes: "Initial deterministic score version using Klimora Phase 1 standard weights.",
  },
};

export function getScoreVersion(id: string): ClimateScoreVersion {
  const version = SCORE_VERSIONS[id];
  if (!version) {
    throw new Error(`Score version ${id} not found.`);
  }
  return version;
}

export function getActiveScoreVersion(): ClimateScoreVersion {
  return getScoreVersion("score-v1");
}
