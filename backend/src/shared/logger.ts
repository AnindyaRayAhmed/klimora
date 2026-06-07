/**
 * Logger boundary.
 * TODO: Standardize structured logging fields for Cloud Logging.
 */
export interface LoggerContext {
  requestId?: string;
  userId?: string;
}
