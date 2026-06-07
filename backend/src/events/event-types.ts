/**
 * Event contracts for durable workflow orchestration.
 * TODO: Add payload schemas for each event type and validation at dispatch boundaries.
 */
export type KlimoraEventType =
  | "mission.submitted"
  | "verification.completed"
  | "climate.data_ingested"
  | "ranking.refresh_requested";

export interface KlimoraEvent<TPayload = unknown> {
  id: string;
  type: KlimoraEventType;
  aggregateId: string;
  payload: TPayload;
  createdAt: string;
}
