import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { LocalitiesRepository } from "../../modules/localities/localities.repo.js";
import { LocalitiesService } from "../../modules/localities/localities.service.js";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";

const localityParamsSchema = z.object({
  id: z.string().uuid(),
});

export async function registerLocalityRoutes(app: FastifyInstance): Promise<void> {
  const service = new LocalitiesService(
    new LocalitiesRepository(getSupabaseAdminClient()),
  );

  app.get("/", async () => {
    return {
      data: await service.listLocalities(),
    };
  });

  app.get("/:id", async (request) => {
    const params = localityParamsSchema.parse(request.params);

    return {
      data: await service.getLocality(params.id),
    };
  });
}
