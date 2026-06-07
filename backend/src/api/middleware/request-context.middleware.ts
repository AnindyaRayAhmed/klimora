import type { FastifyRequest } from "fastify";

/**
 * Request context middleware boundary.
 * TODO: Add request ids, authenticated user ids, trace metadata, and audit context.
 */
export async function requestContextMiddleware(_request: FastifyRequest): Promise<void> {}
