import type { KlimoraEvent } from "./event-types.js";

/**
 * Event dispatcher boundary.
 * TODO: Route events to handlers with idempotency and retry tracking.
 */
export class EventDispatcher {
  async dispatch(_event: KlimoraEvent): Promise<void> {
    // TODO: Dispatch to registered handler.
  }
}
