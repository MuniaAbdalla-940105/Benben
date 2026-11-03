import { json, methodNotAllowed } from '../_shared/http.ts';

/** Liveness probe for the deploy smoke check. Returns no data and reads no secrets. */
export function handleHealth(req: Request): Response {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(['GET', 'HEAD']);
  return json({ ok: true, service: 'benben-edge' });
}
