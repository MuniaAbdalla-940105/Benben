# Task prompt: KICKOFF step 5 → solution-architect (architecture ADR + sprint 1 data contracts)

## 1. Role and seniority
You are a principal software architect with 16 years of experience designing Postgres-backed marketplaces, real-time bidding systems and double-entry wallet/ledger platforms, including 5 years on Supabase (RLS, Realtime, Edge Functions, pg_cron). You are known for simple, explicit designs that stay correct under concurrency and pass financial audits. (Principal level because this work covers bids, money and identity.)

## 2. Context
- Product: Benben, an auction-first real-estate app for Egypt (PRD §1). Money is EGP, stored as integer piasters.
- Decisions: `docs/decisions/ADR-001-stack-platform-and-providers.md`
  - React 19 + Vite + Supabase;
  - responsive web/PWA plus a React admin;
  - providers mocked behind adapters;
  - bids serialized in Postgres and broadcast via Realtime;
  - a load test in sprint 1.
- Sprint 1 (Mon 2026-11-02 → Sun 2026-11-15) is a thin slice. A guest watches a seeded LIVE auction, logs in with phone OTP (mock SMS) and passes mock KYC T1. They accept the T&Cs (logged) and lock EGP 5,000 through the mock gateway (signed webhook → ledger). Then they place serialized manual bids that broadcast live, with a server-time countdown.
- The designer is working in parallel. Your contracts define data and behaviour, not UI.

## 3. Task
1. **`docs/decisions/ADR-002-architecture.md`** (context, options considered, decision, consequences). Cover:
   - the system overview (diagram in Mermaid);
   - apps: `apps/web` (PWA) and `apps/admin`, and `supabase/` (monorepo layout);
   - environments: local, staging, prod;
   - **bid serialization**: a `place_bid()` SECURITY DEFINER function with a per-auction row lock (`SELECT … FOR UPDATE` on `auctions`) or an advisory lock. Pick one and justify it. Also cover idempotency keys, server timestamps, and the increment table;
   - **realtime**: Supabase Realtime Broadcast vs Postgres Changes for bid fan-out at 5,000 viewers. Pick one, and say how clients time-sync (server time on connect);
   - **timers and jobs**: pg_cron plus a lazy end-check vs Edge Function schedulers, for auction start/end, 48h deadlines and reminders;
   - **ledger**: double-entry accounts (user available / locked / pending, Benben revenue, gateway clearing). Balances are derived and cached; nothing ever updates a balance directly;
   - **webhooks**: Edge Function, HMAC verification, idempotency on `gateway_txn_id`, raw event storage;
   - **the RLS model**: anon, authenticated, owner, admin roles via a custom claim or table; admin RBAC from PRD 8.1.4;
   - **audit**: append-only `auction_events` and `audit_logs`;
   - PII and reserve-price encryption (pgsodium/Vault or app-level);
   - the provider adapter pattern and mocks;
   - **the load-test plan** for PRD 8.4 (p95 < 300 ms, 5,000 viewers), and the fallback if it fails;
   - **risks**: data residency (Q-06, no Egypt region), the CBE wallet licence (Q-05), and Supabase Realtime limits per plan.
2. **`docs/design/contracts/DATA_MODEL.md`**: the Phase 1 ERD (Mermaid) and the table list, with the Phase 2–4 tables noted as later.
3. **One data contract per sprint 1 story with data**, `docs/design/contracts/ST-###.md`, for **ST-004, ST-005, ST-006, ST-007, ST-008, ST-009, ST-010, ST-011**. Each contains:
   - tables and columns with types, constraints and indexes;
   - RLS policies per role, in plain words and in SQL;
   - server-side functions / Edge Functions for critical writes, with inputs, outputs and **named errors** (for example `BID_TOO_LOW`, `NOT_PARTICIPANT`, `AUCTION_NOT_LIVE`, `DUPLICATE_REQUEST`);
   - Realtime channels and payloads (for example `auction:<id>` with `bid.placed`, `auction.extended`);
   - the TypeScript types the frontend will use (as expected from `supabase gen types`, plus RPC types);
   - test cases for the backend (RLS: user A cannot read or change user B's rows; concurrency: two bids in the same millisecond, PRD A5);
   - for ST-011 (frontend), the RPCs, subscriptions and error codes the UI must handle.
4. ST-001, ST-002, ST-003 and ST-012 have no data. Add a short section to ADR-002 with what they need from the architecture (repo layout, CI checks including a migration check on a fresh database, env vars, the load-test harness).

## 4. Inputs (read first)
- `docs/PRD.md` §2.3, §3.2, §3.4–3.6, §3.9, §3.10, §8.2, §8.4, §8.6 (never edit)
- `docs/decisions/ADR-001-stack-platform-and-providers.md`, `docs/PRD-questions.md`
- `backlog/BACKLOG.md`, and `backlog/stories/ST-001.md` to `ST-012.md`
- `CLAUDE.md` (guardrails), `.claude/agents/solution-architect.md`, `.claude/agents/supabase-backend.md`

## 5. Constraints
- Guardrails: RLS on every table; the service-role key never reaches the browser; money, bids and status changes only through server-side functions; schema changes only as migrations.
- Money is `bigint` piasters, never float. Every money write is idempotent. No negative balances (enforced by a constraint or a function check).
- Design the Phase 1 model so Phase 2–4 tables can be added without rework (`properties` is the hub; PRD 8.6 key relations).
- Do not write migrations or app code; the supabase-backend agent does that per story. SQL in contracts is the specification.
- Do not run git commands.
- Out of scope: contracts for sprints 2+.

## 6. Acceptance criteria
- ADR-002 states a decision with alternatives and consequences for serialization, realtime, jobs, ledger, RLS model and encryption.
- Every sprint 1 data story has a contract with tables, RLS, functions with named errors, channels, TS types and tests.
- The contracts are consistent with each other (one ledger model, one participant model, one error vocabulary).
- PRD edge cases A1, A2, A3, A5 and A6 are handled explicitly in the contracts.

## 7. Deliverables
- `docs/decisions/ADR-002-architecture.md`, `docs/design/contracts/DATA_MODEL.md`, `docs/design/contracts/ST-004.md` … `ST-011.md`.
- Tick "Schema and RLS drafted" in the Ready checklist of each covered story.
- Report back: files created, the key decisions (one line each), and risks the orchestrator must raise with the stakeholder.

## 8. Self-check before reporting done
- [ ] There is no table without RLS, and no money column that isn't bigint piasters.
- [ ] Every critical write is a function with named errors and an idempotency key.
- [ ] Two concurrent bids resolve deterministically.
- [ ] Countdowns derive from server time.
