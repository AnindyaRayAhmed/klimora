/**
 * User module contracts.
 * TODO: Align these types with Supabase auth claims and profile table schema.
 */
export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  localityId?: string;
}
