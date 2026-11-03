/**
 * Small HTTP helpers shared by every Edge Function (ADR-002 §3).
 * Provider adapters (payments, KYC, SMS) join this folder in ST-004 … ST-007.
 */

export const JSON_HEADERS: Readonly<Record<string, string>> = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  const merged = new Headers(JSON_HEADERS);
  new Headers(headers).forEach((value, key) => merged.set(key, value));
  return new Response(JSON.stringify(body), { status, headers: merged });
}

/** Stable error envelope: `{ error: { code, message } }`. Codes are UPPER_SNAKE_CASE (design-system.md). */
export function errorResponse(code: string, message: string, status: number): Response {
  if (!/^[A-Z][A-Z0-9_]*$/.test(code)) {
    throw new Error(`error code must be UPPER_SNAKE_CASE, got "${code}"`);
  }
  if (status < 400 || status > 599) {
    throw new Error(`error status must be 4xx or 5xx, got ${status}`);
  }
  return json({ error: { code, message } }, status);
}

export function methodNotAllowed(allowed: readonly string[]): Response {
  return json(
    { error: { code: 'METHOD_NOT_ALLOWED', message: `Use ${allowed.join(', ')}` } },
    405,
    { allow: allowed.join(', ') },
  );
}
