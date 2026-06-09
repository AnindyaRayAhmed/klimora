import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { ClimateRepository } from "../../modules/climate/climate.repo.js";
import { ClimateScoreService } from "../../modules/climate/climate-score.service.js";
import { ForecastsRepository } from "../../modules/forecasts/forecasts.repo.js";
import { ForecastsService } from "../../modules/forecasts/forecasts.service.js";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";

const querySchema = z.object({
  localityId: z.string(),
  limit: z.coerce.number().min(1).max(100).optional().default(30),
});

import { LocalitiesRepository } from "../../modules/localities/localities.repo.js";
import { LocalitiesService } from "../../modules/localities/localities.service.js";

export async function registerClimateRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const repo = new ClimateRepository(supabase);
  const service = new ClimateScoreService(repo);
  const forecastsRepo = new ForecastsRepository(supabase);
  const forecastsService = new ForecastsService(forecastsRepo);
  const localitiesService = new LocalitiesService(new LocalitiesRepository(supabase));

  // Preserve existing route if it was used somewhere
  app.get("/localities/:localityId/latest", async (request) => {
    const params = z.object({ localityId: z.string() }).parse(request.params);
    const locality = await localitiesService.getLocalityBySlugOrId(params.localityId);
    return { data: await service.getLatestForLocality(locality.id) };
  });

  app.get("/latest", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    return { data: await service.getLatestForLocality(locality.id) };
  });

  app.get("/history", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    return { data: await service.getHistoryForLocality(locality.id, query.limit) };
  });

  app.get("/forecast", async (request) => {
    const query = querySchema.parse(request.query);
    const locality = await localitiesService.getLocalityBySlugOrId(query.localityId);
    const data = await forecastsService.getForecastsForLocality(locality.id, query.limit);
    return { data };
  });
}
