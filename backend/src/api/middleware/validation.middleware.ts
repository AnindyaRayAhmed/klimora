/**
 * Validation middleware boundary.
 * TODO: Centralize schema validation helpers for route params, body, query, and response contracts.
 */
export interface ValidationTarget<TSchema> {
  schema: TSchema;
  source: "body" | "query" | "params";
}
