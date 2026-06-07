import type { KlimoraEvent } from "./event-types.js";

/**
 * Event bus boundary.
 * TODO: Persist events, schedule retries, and support Cloud Run worker dispatch.
 */
export class EventBus {
  async publish(_event: KlimoraEvent): Promise<void> {
    // TODO: Store and dispatch durable events.
  }
}
