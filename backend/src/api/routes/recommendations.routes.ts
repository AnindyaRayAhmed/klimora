import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";
import { RecommendationAgentService } from "../../modules/agents/recommendations/recommendation-agent.service.js";
import { RecommendationRulesEngine } from "../../modules/agents/recommendations/recommendation-rules.engine.js";
import { ClimateScoreService } from "../../modules/climate/climate-score.service.js";
import { ClimateRepository } from "../../modules/climate/climate.repo.js";
import { MissionsService } from "../../modules/missions/missions.service.js";
import { MissionsRepository } from "../../modules/missions/missions.repo.js";
import { GeminiClient } from "../../providers/gemini/gemini.client.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { ForbiddenError } from "../../shared/errors.js";

const querySchema = z.object({
  localityId: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

const localityParamSchema = z.object({
  id: z.string().uuid(),
});

const userParamSchema = z.object({
  id: z.string().uuid(),
});

export async function registerRecommendationRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const climateRepo = new ClimateRepository(supabase);
  const climateScoreService = new ClimateScoreService(climateRepo);
  const missionsRepo = new MissionsRepository(supabase);
  const missionsService = new MissionsService(missionsRepo);
  const rulesEngine = new RecommendationRulesEngine();
  const geminiClient = new GeminiClient();
  
  const recommendationAgent = new RecommendationAgentService(
    climateScoreService,
    missionsService,
    rulesEngine,
    geminiClient
  );

  app.get("/", async (request, reply) => {
    const query = querySchema.parse(request.query);
    const data = await recommendationAgent.getRecommendations(query.localityId, query.userId);
    return { data };
  });

  app.get("/locality/:id", async (request, reply) => {
    const params = localityParamSchema.parse(request.params);
    const data = await recommendationAgent.getRecommendations(params.id);
    return { data };
  });

  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authMiddleware);

    protectedApp.get("/user/:id", async (request, reply) => {
      const params = userParamSchema.parse(request.params);
      
      if (request.user!.id !== params.id) {
        throw new ForbiddenError("You can only access your own recommendations.");
      }

      // User route usually needs a localityId, let's assume it's passed in query
      const query = z.object({ localityId: z.string().uuid() }).parse(request.query);
      const data = await recommendationAgent.getRecommendations(query.localityId, params.id);
      return { data };
    });
  });
}

