import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";
import { GeminiClient } from "../../providers/gemini/gemini.client.js";
import { ClimateScoreService } from "../../modules/climate/climate-score.service.js";
import { ClimateRepository } from "../../modules/climate/climate.repo.js";
import { ForecastsService } from "../../modules/forecasts/forecasts.service.js";
import { ForecastsRepository } from "../../modules/forecasts/forecasts.repo.js";
import { MissionsService } from "../../modules/missions/missions.service.js";
import { MissionsRepository } from "../../modules/missions/missions.repo.js";
import { RecommendationAgentService } from "../../modules/agents/recommendations/recommendation-agent.service.js";
import { RecommendationRulesEngine } from "../../modules/agents/recommendations/recommendation-rules.engine.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { LocalitiesRepository } from "../../modules/localities/localities.repo.js";
import { LocalitiesService } from "../../modules/localities/localities.service.js";

import { MemoryService } from "../../modules/agents/rit/memory.service.js";
import { RitToolsService } from "../../modules/agents/rit/rit-tools.service.js";
import { ContextAssemblerService } from "../../modules/agents/rit/context-assembler.service.js";
import { ResponseSynthesisService } from "../../modules/agents/rit/response-synthesis.service.js";
import { RitAgentService } from "../../modules/agents/rit/rit-agent.service.js";
import { RitInsightService } from "../../modules/agents/rit/rit-insight.service.js";

const chatSchema = z.object({
  message: z.string().min(1),
  localityId: z.string(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  conversationId: z.string().uuid().optional(),
  climateMetrics: z.object({
    temperatureC: z.number().nullable().optional(),
    aqi: z.number().nullable().optional(),
    ndvi: z.number().nullable().optional(),
    rainfallMm: z.number().nullable().optional(),
    score: z.number().nullable().optional(),
  }).optional(),
});

export async function registerRitRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const gemini = new GeminiClient();

  const climateRepo = new ClimateRepository(supabase);
  const climateScoreService = new ClimateScoreService(climateRepo);
  const forecastsRepo = new ForecastsRepository(supabase);
  const forecastsService = new ForecastsService(forecastsRepo);
  const missionsRepo = new MissionsRepository(supabase);
  const missionsService = new MissionsService(missionsRepo);
  const recommendationRulesEngine = new RecommendationRulesEngine();
  const recommendationAgentService = new RecommendationAgentService(
    climateScoreService,
    missionsService,
    recommendationRulesEngine,
    gemini
  );

  const memoryService = new MemoryService(supabase);
  const ritTools = new RitToolsService(
    supabase,
    climateScoreService,
    forecastsService,
    missionsService,
    recommendationAgentService
  );
  const contextAssembler = new ContextAssemblerService(ritTools, memoryService);
  const synthesisService = new ResponseSynthesisService(gemini);
  const ritInsightService = new RitInsightService(supabase);
  const ritAgent = new RitAgentService(memoryService, contextAssembler, synthesisService);

  const localitiesService = new LocalitiesService(new LocalitiesRepository(supabase));

  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authMiddleware);

    protectedApp.post("/chat", {
      bodyLimit: 512000, // 500KB
      config: { rateLimit: { max: 15, timeWindow: "1 minute" } }
    }, async (request, reply) => {
      const body = chatSchema.parse(request.body);
      const userId = request.user!.id;
      
      let finalLocalityId = body.localityId;
      if (body.localityId !== "dynamic" && !body.localityId.startsWith("dynamic-")) {
        const locality = await localitiesService.getLocalityBySlugOrId(body.localityId);
        finalLocalityId = locality.id;
      }
      
      // We pass the finalLocalityId along with the optional lat/lng context 
      // and climate metrics to the Rit Agent.
      return await ritAgent.processQuery({
        userId,
        localityId: finalLocalityId,
        message: body.message,
        conversationId: body.conversationId,
        lat: body.lat,
        lng: body.lng,
        climateMetrics: body.climateMetrics
      });
    });

    protectedApp.post("/chat-with-image", async (request, reply) => {
      // Future scaffold for multi-modal context (e.g. lake analysis, vegetation discussion)
      // Expects multipart/form-data with image and text
      return {
        message: {
          role: "assistant",
          content: "Image processing is currently offline. I can still help you with text queries!"
        }
      };
    });

    protectedApp.get("/insights", async (request, reply) => {
      const userId = request.user!.id;
      const query = z.object({ localityId: z.string() }).parse(request.query);
      if (query.localityId === "dynamic" || query.localityId.startsWith("dynamic-")) {
        return { data: [] };
      }
      const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
      const insights = await ritInsightService.getActiveInsights(locality.id, userId);
      return { data: insights };
    });

    protectedApp.get("/conversations", async (request, reply) => {
      const userId = request.user!.id;
      const { data, error } = await supabase
        .from("rit_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);
      return { data };
    });

    protectedApp.get("/conversations/:id", async (request, reply) => {
      const userId = request.user!.id;
      const { id } = request.params as { id: string };

      const { data: conversation, error: convError } = await supabase
        .from("rit_conversations")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (convError) throw new Error(convError.message);

      const { data: messages, error: msgError } = await supabase
        .from("rit_messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });

      if (msgError) throw new Error(msgError.message);

      return { conversation, messages };
    });
  });
}
