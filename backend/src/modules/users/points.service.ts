import { SupabaseClient } from "@supabase/supabase-js";
import { UpstreamDataError } from "../../shared/errors.js";

export class PointsService {
  constructor(private readonly supabase: SupabaseClient) {}

  async awardPoints(userId: string, submissionId: string, points: number, reason: string): Promise<void> {
    // 1. Log transaction in user_points
    const { error: txError } = await this.supabase
      .from("user_points")
      .insert({
        user_id: userId,
        submission_id: submissionId,
        points,
        reason,
        created_at: new Date().toISOString()
      });

    if (txError) {
      if (txError.code === '23505') {
        // Unique constraint violation: points already awarded for this submission
        return;
      }
      throw new UpstreamDataError(`Failed to insert user points: ${txError.message}`);
    }

    // 2. The database trigger 'handle_new_user' auto-creates the profile.
    // We just need to increment total_points in profiles table.
    
    // Using RPC to increment points safely or a direct update
    // If no RPC, we fetch current profile, then update.
    const { data: profile, error: profileFetchError } = await this.supabase
      .from("profiles")
      .select("total_points")
      .eq("id", userId)
      .single();
      
    if (profileFetchError) {
      throw new UpstreamDataError(`Failed to fetch profile: ${profileFetchError.message}`);
    }

    const currentPoints = profile?.total_points || 0;
    
    const { error: profileUpdateError } = await this.supabase
      .from("profiles")
      .update({ total_points: currentPoints + points })
      .eq("id", userId);

    if (profileUpdateError) {
      throw new UpstreamDataError(`Failed to update profile points: ${profileUpdateError.message}`);
    }
  }
}
