/**
 * Time utility boundary.
 * TODO: Centralize clock injection for deterministic tests and scheduled jobs.
 */
export interface Clock {
  now(): Date;
}
