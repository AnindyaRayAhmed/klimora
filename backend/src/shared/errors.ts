export class KlimoraError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(message: string, statusCode = 500, code = "KLIMORA_ERROR") {
    super(message);
    this.name = "KlimoraError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class NotFoundError extends KlimoraError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UpstreamDataError extends KlimoraError {
  constructor(message: string) {
    super(message, 502, "UPSTREAM_DATA_ERROR");
    this.name = "UpstreamDataError";
  }
}

export class UnauthorizedError extends KlimoraError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends KlimoraError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}
