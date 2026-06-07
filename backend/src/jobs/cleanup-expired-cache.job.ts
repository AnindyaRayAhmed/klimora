import { createClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { fileURLToPath } from "url";
import path from "path";

export async function runCleanupExpiredCacheJob() {
  console.log("Starting cleanup-expired-cache job...");

  const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);

  // Example cleanup: remove snapshots older than 365 days
  const oneYearAgo = new Date();
  oneYearAgo.setDate(oneYearAgo.getDate() - 365);

  try {
    const { count, error } = await supabase
      .from("climate_snapshots")
      .delete({ count: "exact" })
      .lt("observed_at", oneYearAgo.toISOString());

    if (error) {
      console.error("Error during cleanup:", error);
    } else {
      console.log(`Cleaned up ${count || 0} old climate snapshots.`);
    }
  } catch (e) {
    console.error("Cleanup job failed:", e);
  }

  console.log("cleanup-expired-cache job completed.");
}

const nodePath = fileURLToPath(import.meta.url);
const argvPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (nodePath === argvPath) {
  runCleanupExpiredCacheJob().catch(console.error);
}
