import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ClimateRepository } from "../../modules/climate/climate.repo.js";
import { ClimateScoreService } from "../../modules/climate/climate-score.service.js";
import { ForecastsRepository } from "../../modules/forecasts/forecasts.repo.js";
import { ForecastsService } from "../../modules/forecasts/forecasts.service.js";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";

const querySchema = z.object({
  localityId: z.string().uuid(),
  limit: z.coerce.number().min(1).max(100).optional().default(30),
});

export async function registerClimateRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const repo = new ClimateRepository(supabase);
  const service = new ClimateScoreService(repo);
  const forecastsRepo = new ForecastsRepository(supabase);
  const forecastsService = new ForecastsService(forecastsRepo);

  // Preserve existing route if it was used somewhere
  app.get("/localities/:localityId/latest", async (request) => {
    const params = z.object({ localityId: z.string().uuid() }).parse(request.params);
    return { data: await service.getLatestForLocality(params.localityId) };
  });

  app.get("/latest", async (request) => {
    const query = querySchema.parse(request.query);
    return { data: await service.getLatestForLocality(query.localityId) };
  });

  app.get("/history", async (request) => {
    const query = querySchema.parse(request.query);
    return { data: await service.getHistoryForLocality(query.localityId, query.limit) };
  });

  app.get("/forecast", async (request) => {
    const query = querySchema.parse(request.query);
    const data = await forecastsService.getForecastsForLocality(query.localityId, query.limit);
    return { data };
  });
}
