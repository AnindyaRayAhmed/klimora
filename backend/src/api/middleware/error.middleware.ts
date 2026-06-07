import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

import { KlimoraError } from "../../shared/errors.js";

export async function errorMiddleware(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  request.log.error(error);

  if (error instanceof KlimoraError) {
    await reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof ZodError || ("validation" in error && error.validation)) {
    await reply.status(400).send({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed.",
      },
    });
    return;
  }

  await reply.status(500).send({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected backend error.",
    },
  });
}
