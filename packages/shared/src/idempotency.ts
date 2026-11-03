/** A fresh idempotency key for one user action (ADR-002 §15). Reuse the same key when retrying it. */
export function newIdempotencyKey(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (!c?.randomUUID) throw new Error('crypto.randomUUID is not available');
  return c.randomUUID();
}
