import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Fastify, { type FastifyInstance } from "fastify";

import { apiBasePath } from "./config/constants.js";
import { errorMiddleware } from "./api/middleware/error.middleware.js";
import { registerAdminRoutes } from "./api/routes/admin.routes.js";
import { registerAuthRoutes } from "./api/routes/auth.routes.js";
import { registerClimateRoutes } from "./api/routes/climate.routes.js";
import { registerCommunityRoutes } from "./api/routes/community.routes.js";
import { registerForecastRoutes } from "./api/routes/forecasts.routes.js";
import { registerLayerRoutes } from "./api/routes/layers.routes.js";
import { registerLocalityRoutes } from "./api/routes/localities.routes.js";
import { registerMissionRoutes } from "./api/routes/missions.routes.js";
import { registerRitRoutes } from "./api/routes/rit.routes.js";
import { registerUserRoutes } from "./api/routes/users.routes.js";
import { registerVerificationRoutes } from "./api/routes/verification.routes.js";
import { registerRecommendationRoutes } from "./api/routes/recommendations.routes.js";

import crypto from "node:crypto";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ 
    logger: {
      level: "info",
      redact: {
        paths: ["req.headers.authorization", "req.body.password", "req.body.token"],
        censor: "***"
      }
    },
    bodyLimit: 5242880, // 5MB global body limit
    genReqId: () => crypto.randomUUID()
  });

  app.setErrorHandler(errorMiddleware);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  
  await app.register(cors, {
    origin: frontendUrl === "*" ? true : [frontendUrl, "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: ["'self'", frontendUrl, "https://*.supabase.co"],
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  });

  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    keyGenerator: (req) => {
      // Use user ID if authenticated, else IP
      if (req.user?.id) return req.user.id;
      return req.ip;
    }
  });

  app.get("/health", async (request, reply) => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await app.register(registerAuthRoutes, { prefix: `${apiBasePath}/auth` });
  await app.register(registerUserRoutes, { prefix: `${apiBasePath}/users` });
  await app.register(registerLocalityRoutes, { prefix: `${apiBasePath}/localities` });
  await app.register(registerClimateRoutes, { prefix: `${apiBasePath}/climate` });
  await app.register(registerForecastRoutes, { prefix: `${apiBasePath}/forecasts` });
  await app.register(registerLayerRoutes, { prefix: `${apiBasePath}/layers` });
  await app.register(registerRitRoutes, { prefix: `${apiBasePath}/rit` });
  await app.register(registerMissionRoutes, { prefix: `${apiBasePath}/missions` });
  await app.register(registerVerificationRoutes, { prefix: `${apiBasePath}/verification` });
  await app.register(registerRecommendationRoutes, { prefix: `${apiBasePath}/recommendations` });
  await app.register(registerCommunityRoutes, { prefix: `${apiBasePath}/community` });
  await app.register(registerAdminRoutes, { prefix: `${apiBasePath}/admin` });

  return app;
}
