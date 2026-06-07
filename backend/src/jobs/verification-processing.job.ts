import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import path from "path";

import { env } from "../config/env.js";
import { VerificationOrchestratorService } from "../modules/verification/verification-orchestrator.service.js";
import { VerificationAgentService } from "../modules/agents/verification/verification-agent.service.js";
import { VerificationRulesService } from "../modules/verification/verification-rules.service.js";
import { PointsService } from "../modules/users/points.service.js";
import { GeminiClient } from "../providers/gemini/gemini.client.js";

export async function runVerificationProcessingJob() {
  console.log("Starting verification processing job...");

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  const gemini = new GeminiClient();
  const agent = new VerificationAgentService(supabase, gemini);
  const rules = new VerificationRulesService();
  const points = new PointsService(supabase);
  const orchestrator = new VerificationOrchestratorService(supabase, agent, rules, points);

  // Fetch pending submissions
  const { data: submissions, error } = await supabase
    .from("mission_submissions")
    .select("id")
    .eq("status", "pending")
    .order("submitted_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Failed to fetch pending submissions:", error);
    return;
  }

  if (!submissions || submissions.length === 0) {
    console.log("No pending submissions to process.");
    return;
  }

  for (const sub of submissions) {
    console.log(`Processing submission ${sub.id}...`);
    try {
      // Mark as processing/verifying
      await supabase.from("mission_submissions").update({ status: "verifying" }).eq("id", sub.id);
      
      const result = await orchestrator.processSubmission(sub.id);
      console.log(`Finished processing ${sub.id}: ${result.status} (confidence: ${result.confidence})`);
    } catch (e: any) {
      console.error(`Error processing submission ${sub.id}:`, e);
      // Mark for manual review on hard failure
      await supabase.from("mission_submissions").update({ status: "manual_review" }).eq("id", sub.id);
    }
  }
  
  console.log("verification processing job completed.");
}

const nodePath = fileURLToPath(import.meta.url);
const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (nodePath === argvPath) {
  runVerificationProcessingJob().catch(console.error);
}
