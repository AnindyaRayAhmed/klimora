import { ClimateScoreService } from "../modules/climate/climate-score.service.js";
import { ClimateRepository } from "../modules/climate/climate.repo.js";
import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import path from "path";

export async function runComputeClimateScoresJob() {
  console.log("Starting compute-climate-scores job...");

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  const climateRepo = new ClimateRepository(supabase);
  const scoreService = new ClimateScoreService(climateRepo);

  const { data: localities, error } = await supabase.from("localities").select("id");
  if (error) {
    console.error("Failed to fetch localities", error);
    return;
  }

  for (const locality of localities) {
    try {
      await scoreService.computeAndStoreScore(locality.id);
      console.log(`Computed and stored score for locality ${locality.id}`);
    } catch (e) {
      console.error(`Error computing score for locality ${locality.id}:`, e);
    }
  }
  
  console.log("compute-climate-scores job completed.");
}

const nodePath = fileURLToPath(import.meta.url);
const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (nodePath === argvPath) {
  runComputeClimateScoresJob().catch(console.error);
}
