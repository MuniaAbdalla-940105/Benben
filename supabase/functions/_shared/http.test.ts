import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import { errorResponse, json, methodNotAllowed } from './http.ts';

Deno.test('json() serialises the body with JSON and no-store headers', async () => {
  const res = json({ ok: true }, 201, { 'x-request-id': 'r-1' });
  assertEquals(res.status, 201);
  assertEquals(res.headers.get('content-type'), 'application/json; charset=utf-8');
  assertEquals(res.headers.get('cache-control'), 'no-store');
  assertEquals(res.headers.get('x-request-id'), 'r-1');
  assertEquals(await res.json(), { ok: true });
});

Deno.test('errorResponse() uses the stable error envelope', async () => {
  const res = errorResponse('BID_TOO_LOW', 'Bid is below the minimum', 422);
  assertEquals(res.status, 422);
  assertEquals(await res.json(), { error: { code: 'BID_TOO_LOW', message: 'Bid is below the minimum' } });
});

Deno.test('errorResponse() rejects non UPPER_SNAKE_CASE codes and non-error statuses', () => {
  assertThrows(() => errorResponse('bidTooLow', 'x', 422));
  assertThrows(() => errorResponse('OK', 'x', 200));
});

Deno.test('methodNotAllowed() sets the Allow header', async () => {
  const res = methodNotAllowed(['GET', 'HEAD']);
  assertEquals(res.status, 405);
  assertEquals(res.headers.get('allow'), 'GET, HEAD');
  assertEquals((await res.json()).error.code, 'METHOD_NOT_ALLOWED');
});
