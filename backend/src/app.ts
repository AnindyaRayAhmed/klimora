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
import { GeminiClient } from "./providers/gemini/gemini.client.js";

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

  // Verify Gemini model initialization on startup
  try {
    const gemini = new GeminiClient();
    const activeModel = gemini.getModelName();
    console.log(`[Gemini Init] Active Gemini model: ${activeModel}`);
    console.log(`[Gemini Init] Gemini client initialized successfully.`);
    app.log.info(`[Gemini Init] Active Gemini model: ${activeModel}`);
    app.log.info(`[Gemini Init] Gemini client initialized successfully.`);
  } catch (error: any) {
    console.error(`[Gemini Init] Failed to initialize Gemini client: ${error.message}`);
    app.log.error(`[Gemini Init] Failed to initialize Gemini client: ${error.message}`);
    throw new Error(`Critical backend startup failure: Gemini client initialization failed. ${error.message}`);
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      const allowed = origin.endsWith('.vercel.app') || origin.includes('localhost');
      cb(null, allowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

  const registerWithLog = async (name: string, plugin: any, prefix: string) => {
    console.log(`[BOOT] Registering ${name}...`);
    try {
      await app.register(plugin, { prefix });
      console.log(`[BOOT] ${name} registered successfully`);
    } catch (error: any) {
      console.error(`[BOOT] Failed to register ${name}:`, error);
      throw new Error(`Critical boot failure: ${name} failed to register. ${error.message}`);
    }
  };

  await registerWithLog("auth routes", registerAuthRoutes, `${apiBasePath}/auth`);
  await registerWithLog("user routes", registerUserRoutes, `${apiBasePath}/users`);
  await registerWithLog("locality routes", registerLocalityRoutes, `${apiBasePath}/localities`);
  await registerWithLog("climate routes", registerClimateRoutes, `${apiBasePath}/climate`);
  await registerWithLog("forecast routes", registerForecastRoutes, `${apiBasePath}/forecasts`);
  await registerWithLog("layer routes", registerLayerRoutes, `${apiBasePath}/layers`);
  await registerWithLog("rit routes", registerRitRoutes, `${apiBasePath}/rit`);
  await registerWithLog("mission routes", registerMissionRoutes, `${apiBasePath}/missions`);
  await registerWithLog("verification routes", registerVerificationRoutes, `${apiBasePath}/verification`);
  await registerWithLog("recommendation routes", registerRecommendationRoutes, `${apiBasePath}/recommendations`);
  await registerWithLog("community routes", registerCommunityRoutes, `${apiBasePath}/community`);
  await registerWithLog("admin routes", registerAdminRoutes, `${apiBasePath}/admin`);

  app.ready(() => {
    console.log("[BOOT] Fastify routes tree:");
    console.log(app.printRoutes());
  });

  return app;
}
