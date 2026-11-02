# ADR-001: Stack, MVP platform and third-party providers

- Status: **accepted** (stakeholder decision)
- Date: 2026-11-02
- Decided by: Munia Abdalla (stakeholder)
- PRD sections: 8.4 (non-functional), 8.5 (suggested stack), 8.7 (roadmap)

## Context
PRD 8.5 *suggests* Flutter (mobile), Next.js (web/admin), NestJS, Redis, BullMQ and Socket.IO. The delivery framework in `CLAUDE.md` is built for React 19 + Vite + Supabase. The two conflict, and the conflict blocked planning.

## Decision
1. **Stack: React + Supabase** (the framework stack), not the PRD 8.5 stack.
   - Frontend: React 19, TypeScript, Vite, Tailwind, TanStack Query, React Router.
   - Backend: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions).
   - Bids, deposits and other critical writes are serialized in Postgres functions (row locks / advisory locks per auction). Bid events go out over Supabase Realtime.
   - Sprint 1 must include a load test against PRD 8.4 (bid → broadcast p95 < 300 ms, 5,000 concurrent viewers per auction). If it fails, a dedicated bid/realtime service is added in a later ADR. Supabase stays the system of record.
2. **MVP platform: responsive web / PWA.** One mobile-first, installable React app (RTL, push), plus a React admin dashboard. Native apps come later on the same backend.
3. **Providers: mocks first.** Paymob (payments), KYC/OCR + liveness, SMS/WhatsApp and e-signature each sit behind an adapter with a realistic mock: signed webhooks, delays, failures, duplicates. Real vendors replace the mocks once contracts and sandbox keys exist.

## Consequences
- PRD 8.5 is treated as a suggestion and has been superseded. Agents use the `CLAUDE.md` stack.
- Redis/BullMQ jobs (auction start/end, 48h deadlines, reminders) become `pg_cron` plus Edge Functions. The architect confirms this in ADR-002.
- Mobile-specific UX in the PRD (haptics, dynamic type) is approximated on the web: Vibration API where supported, rem-based type that respects the browser's zoom and font size.
- Provider choice is no longer a sprint 1 blocker. Going live does need the real vendors (tracked in `docs/PRD-questions.md`).
