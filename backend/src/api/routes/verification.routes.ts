import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { getSupabaseAdminClient } from "../../providers/supabase/supabase-admin.client.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { ForbiddenError } from "../../shared/errors.js";

// userId is removed from the request body as it comes from the authenticated context
const submitSchema = z.object({
  missionId: z.string().uuid(),
  localityId: z.string().uuid(),
  mediaBucket: z.string().default("mission-evidence"),
  mediaPath: z.string().min(1),
  mediaType: z.enum(["image", "video"]).default("image"),
  userNote: z.string().optional()
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const submissionIdParamSchema = z.object({
  submissionId: z.string().uuid(),
});

export async function registerVerificationRoutes(app: FastifyInstance): Promise<void> {
  const supabase = getSupabaseAdminClient();

  app.register(async (protectedApp) => {
    protectedApp.addHook("preHandler", authMiddleware);

    protectedApp.post("/submit", {
      bodyLimit: 1048576, // 1MB for the JSON payload (actual file goes to Storage)
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } }
    }, async (request, reply) => {
      const body = submitSchema.parse(request.body);
      const userId = request.user!.id;
      
      // Storage access validation: path must start with user's ID
      if (!body.mediaPath.startsWith(`${userId}/`)) {
        throw new ForbiddenError("Media path must belong to your user namespace.");
      }
      
      const { data, error } = await supabase
        .from("mission_submissions")
        .insert({
          user_id: userId,
          mission_id: body.missionId,
          locality_id: body.localityId,
          media_bucket: body.mediaBucket,
          media_path: body.mediaPath,
          media_type: body.mediaType,
          user_note: body.userNote,
          status: "pending"
        })
        .select()
        .single();

      if (error) {
        return reply.code(500).send({ error: { code: "UPSTREAM_DATA_ERROR", message: error.message } });
      }

      return { data };
    });

    protectedApp.get("/:id", async (request, reply) => {
      const { id } = idParamSchema.parse(request.params);
      
      const { data, error } = await supabase
        .from("verification_results")
        .select("*, mission_submissions!inner(user_id)")
        .eq("id", id)
        .single();

      if (error) {
        return reply.code(404).send({ error: { code: "NOT_FOUND", message: "Verification result not found" } });
      }

      // Allow users to see their own verification result only
      if (data.mission_submissions?.user_id !== request.user!.id) {
        throw new ForbiddenError("You can only access your own verification results");
      }

      return { data };
    });

    protectedApp.get("/status/:submissionId", async (request, reply) => {
      const { submissionId } = submissionIdParamSchema.parse(request.params);
      
      const { data, error } = await supabase
        .from("mission_submissions")
        .select("id, status, verified_at, user_id")
        .eq("id", submissionId)
        .single();

      if (error) {
        return reply.code(404).send({ error: { code: "NOT_FOUND", message: "Submission not found" } });
      }

      if (data.user_id !== request.user!.id) {
         throw new ForbiddenError("You can only access your own submissions");
      }

      return { data: { id: data.id, status: data.status, verified_at: data.verified_at } };
    });
  });
}

