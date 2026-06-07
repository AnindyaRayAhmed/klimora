import type { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../shared/errors.js";
import { createSupabaseUserClient } from "../../providers/supabase/supabase.client.js";

/**
 * Authentication middleware boundary for Supabase JWT validation.
 */
export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Malformed Bearer token");
  }

  const supabase = createSupabaseUserClient(token);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  request.user = {
    id: data.user.id,
    email: data.user.email,
  };
}
