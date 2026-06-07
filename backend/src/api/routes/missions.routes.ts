import type { FastifyInstance } from "fastify";

import { MissionsRepository } from "../../modules/missions/missions.repo.js";
import { MissionsService } from "../../modules/missions/missions.service.js";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";

export async function registerMissionRoutes(app: FastifyInstance): Promise<void> {
  const service = new MissionsService(
    new MissionsRepository(getSupabaseAdminClient()),
  );

  app.get("/", async () => {
    return {
      data: await service.listActiveMissions(),
    };
  });
}
