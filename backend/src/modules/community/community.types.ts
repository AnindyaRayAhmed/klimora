/**
 * Community module contracts.
 * TODO: Add ranking scopes, movement history, and leaderboard entry details.
 */
export type RankingScope = "ward" | "municipality" | "city";

export interface CommunityRanking {
  scope: RankingScope;
  scopeId: string;
  rank: number;
  score: number;
}
