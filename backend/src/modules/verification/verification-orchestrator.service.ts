import { SupabaseClient } from "@supabase/supabase-js";
import { VerificationAgentService } from "../agents/verification/verification-agent.service.js";
import { VerificationRulesService } from "./verification-rules.service.js";
import { PointsService } from "../users/points.service.js";
import { VerificationResult, VerificationStatus } from "./verification.types.js";
import { UpstreamDataError, NotFoundError } from "../../shared/errors.js";

export class VerificationOrchestratorService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly verificationAgent: VerificationAgentService,
    private readonly rulesEngine: VerificationRulesService,
    private readonly pointsService: PointsService
  ) {}

  async processSubmission(submissionId: string): Promise<VerificationResult> {
    // 1. Fetch submission
    const { data: submission, error: fetchError } = await this.supabase
      .from("mission_submissions")
      .select("*, missions(slug, points)")
      .eq("id", submissionId)
      .single();

    if (fetchError || !submission) {
      throw new NotFoundError(`Submission not found: ${submissionId}`);
    }

    if (submission.status !== 'pending' && submission.status !== 'submitted') {
      return {
        submissionId,
        status: submission.status as VerificationStatus,
        confidence: 1,
        ruleResults: [],
        reason: "Already processed"
      };
    }

    const missionSlug = submission.missions?.slug;
    const missionPoints = submission.missions?.points || 0;
    const mediaPath = submission.media_path;

    if (!missionSlug || !mediaPath) {
      throw new Error("Submission is missing mission or media data");
    }

    try {
      // 2. Agent Extraction
      const geminiAnalysis = await this.verificationAgent.analyzeSubmissionMedia(missionSlug, mediaPath);

      // 3. Rules Evaluation
      const decision = this.rulesEngine.evaluate(missionSlug, geminiAnalysis);

      const status: VerificationStatus = decision.verified ? "verified" : "rejected";

      // 4. Update submission status
      const { error: updateSubError } = await this.supabase
        .from("mission_submissions")
        .update({ 
          status, 
          verified_at: new Date().toISOString()
        })
        .eq("id", submissionId);

      if (updateSubError) {
        throw new UpstreamDataError("Failed to update submission status");
      }

      // 5. Store verification result
      const { error: insertResultError } = await this.supabase
        .from("verification_results")
        .insert({
          submission_id: submissionId,
          status,
          confidence_score: decision.confidence,
          detected_objects: geminiAnalysis.detectedObjects,
          mission_compliance: { observations: geminiAnalysis.observations },
          reason: decision.reason,
          model_name: "gemini-2.0-flash",
          created_at: new Date().toISOString()
        });

      if (insertResultError) {
        throw new UpstreamDataError("Failed to store verification result");
      }

      // 6. Award Points if verified
      if (decision.verified) {
        await this.pointsService.awardPoints(
          submission.user_id,
          submissionId,
          missionPoints,
          `Mission verified: ${missionSlug}`
        );
      }

      return {
        submissionId,
        status,
        confidence: decision.confidence,
        ruleResults: [geminiAnalysis, decision],
        reason: decision.reason
      };

    } catch (e: any) {
      // Handle failure (e.g. Gemini error)
      await this.supabase
        .from("mission_submissions")
        .update({ status: "manual_review" })
        .eq("id", submissionId);
      
      return {
        submissionId,
        status: "manual_review",
        confidence: 0,
        ruleResults: [],
        reason: `Error during processing: ${e.message}`
      };
    }
  }
}
