import { buildApp } from "./app.js";
import { env } from "./config/env.js";

/**
 * Cloud Run HTTP entrypoint.
 * TODO: Harden startup logging and graceful shutdown once providers are wired.
 */
const app = await buildApp();

await app.listen({
  host: "0.0.0.0",
  port: env.port,
});
