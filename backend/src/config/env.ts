import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  API_BASE_PATH: z.string().min(1).default("/api/v1"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  PLANET_API_KEY: z.string().optional(),
  OPENWEATHER_API_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  SENTINEL_HUB_CLIENT_ID: z.string().optional(),
  SENTINEL_HUB_CLIENT_SECRET: z.string().optional(),
  FRONTEND_URL: z.string().optional().default("http://localhost:5173"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues.map((issue) => issue.path.join(".")).join(", ");
  console.error(`[ENV WARNING] Invalid backend environment configuration: ${details}`);
  // We throw only for critical supabase issues, others we let pass as undefined.
  const critical = parsedEnv.error.issues.some(i => i.path[0]?.toString().startsWith('SUPABASE_'));
  if (critical) {
    throw new Error(`Critical backend environment configuration missing: ${details}`);
  }
}

// Fallback to partially parsed data if it failed for non-critical things
const data = parsedEnv.success ? parsedEnv.data : (process.env as any);

export const env = {
  nodeEnv: data.NODE_ENV,
  port: data.PORT,
  apiBasePath: data.API_BASE_PATH,
  supabaseUrl: data.SUPABASE_URL,
  supabaseAnonKey: data.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: data.SUPABASE_SERVICE_ROLE_KEY,
  geminiApiKey: data.GEMINI_API_KEY,
  planetApiKey: data.PLANET_API_KEY,
  openWeatherApiKey: data.OPENWEATHER_API_KEY,
  googleMapsApiKey: data.GOOGLE_MAPS_API_KEY,
  sentinelHubClientId: data.SENTINEL_HUB_CLIENT_ID,
  sentinelHubClientSecret: data.SENTINEL_HUB_CLIENT_SECRET,
  frontendUrl: data.FRONTEND_URL,
};
