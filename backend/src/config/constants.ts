import { env } from "./env.js";

/**
 * Shared backend constants.
 * TODO: Move domain thresholds to versioned config files when scoring is implemented.
 */
export const apiBasePath = env.apiBasePath;

export const serviceNames = {
  api: "klimora-api",
  worker: "klimora-worker",
  jobs: "klimora-jobs",
} as const;
