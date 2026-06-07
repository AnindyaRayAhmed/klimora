import { SupabaseClient } from "@supabase/supabase-js";
import { GeminiClient } from "../../../providers/gemini/gemini.client.js";
import { verificationPrompts, defaultVerificationPrompt } from "./verification-prompts.js";
import { GeminiMissionAnalysis } from "../../verification/verification.types.js";

export class VerificationAgentService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly gemini: GeminiClient
  ) {}

  async analyzeSubmissionMedia(missionSlug: string, mediaPath: string): Promise<GeminiMissionAnalysis> {
    const { data, error } = await this.supabase.storage.from("mission-evidence").download(mediaPath);
    
    if (error || !data) {
      throw new Error(`Failed to download media: ${error?.message || "Unknown error"}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const mimeType = data.type || "image/jpeg";
    
    const prompt = verificationPrompts[missionSlug] || defaultVerificationPrompt;
    
    const result = await this.gemini.analyzeImage(buffer, mimeType, prompt);
    
    return {
      evidenceDetected: Boolean(result.evidenceDetected),
      confidence: Number(result.confidence) || 0,
      detectedObjects: Array.isArray(result.detectedObjects) ? result.detectedObjects : [],
      observations: Array.isArray(result.observations) ? result.observations : [],
      reason: result.reason || "Analysis completed",
    };
  }
}
