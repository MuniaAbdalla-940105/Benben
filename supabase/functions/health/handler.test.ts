import { assertEquals } from 'jsr:@std/assert@1';
import { handleHealth } from './handler.ts';

Deno.test('GET /health answers ok', async () => {
  const res = handleHealth(new Request('http://localhost/health'));
  assertEquals(res.status, 200);
  assertEquals(await res.json(), { ok: true, service: 'benben-edge' });
});

Deno.test('POST /health is rejected', () => {
  const res = handleHealth(new Request('http://localhost/health', { method: 'POST' }));
  assertEquals(res.status, 405);
});
