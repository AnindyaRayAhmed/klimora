/**
 * Row-level access policy notes.
 * TODO: Mirror Supabase RLS expectations in repository-level checks where needed.
 */
export interface RowAccessContext {
  userId?: string;
  role: string;
}
