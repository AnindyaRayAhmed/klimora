/**
 * Result type placeholder.
 * TODO: Use this for expected domain outcomes where exceptions would obscure control flow.
 */
export type Result<TValue, TError = Error> =
  | { ok: true; value: TValue }
  | { ok: false; error: TError };
