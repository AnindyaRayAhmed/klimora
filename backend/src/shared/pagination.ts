/**
 * Pagination contracts.
 * TODO: Use cursor pagination for history, rankings, and audit logs.
 */
export interface PageRequest {
  cursor?: string;
  limit?: number;
}

export interface PageResult<TItem> {
  items: TItem[];
  nextCursor?: string;
}
