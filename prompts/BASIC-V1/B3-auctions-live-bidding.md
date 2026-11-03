# Task prompt: Basic v1 B3 → supabase-backend + react-frontend

## 1. Role and seniority
- **Backend (principal):** a principal engineer with 15 years of experience building real-time bidding and trading systems on Postgres, and 4 years on Supabase Realtime. Known for deterministic ordering under concurrency. Principal level because this package handles bids and money.
- **Frontend (senior):** a senior React engineer for the live UI.

## 2. Context
- Basic v1 (ADR-006), **wave 2**. The auction is the product's core: the app opens on Auctions.
- B1 provides the shell and `properties`. B2 provides `join_auction`, `release_lock` and `forfeit_lock`; call them by the ST-008 contract. If B2 has not merged yet, code against the contract and add a temporary SQL stub in a migration clearly marked `-- replaced by B2` only if CI needs it. Coordinate through the PR description.

## 3. Task
1. **Auctions schema and state machine**:
   - `auctions`, `auction_participants`, `bids`, `auction_events`, `winner_obligations` (DATA_MODEL);
   - states DRAFT→SCHEDULED→LIVE→EXTENDED→ENDED→AWAITING_WINNER→COMPLETED / WINNER_DEFAULTED, plus PAUSED and CANCELLED;
   - pg_cron and a lazy end-check (ST-013).
2. **`place_bid()`** per ST-010:
   - a row lock and server timestamp;
   - the increment table, an idempotency key and named errors;
   - **the bid cap** `BID_TOO_HIGH` at 100 increments (ADR-004);
   - Realtime broadcast `auction:<id>`.
3. **Anti-sniping** (ST-014): a bid at ≤ 60 s left sets the end to bid time + 3 min; the `auction.extended` event; an optional cap.
4. **On close**: release non-winner locks through B2; create the winner's 48h obligation with a checklist; when the 48h passes, the winner defaults and the lock is forfeited. No second-chance offers.
5. **Screens**, using the design system and prototypes:
   - AU-01 home: live hero, ending soon, starting soon with Remind me (stored only), just sold;
   - AU-02 detail;
   - AU-03 live room: bid ladder, quick bids, extension toast, outbid state 3B; **no chat**;
   - AU-04 the Join to Bid sheet (1A), calling B2;
   - AU-05 confirmation (2B with skip-for-session);
   - AU-07 basic result and winner checklist;
   - AU-09 My Auctions, basic.
   Countdown always uses `serverNow()`.
6. A seed function to create demo auctions (non-prod).

## 4. Inputs
- `docs/design/contracts/ST-009.md`, `ST-010.md`, `ST-011.md`, `ST-008.md`, `DATA_MODEL.md`; ADR-002 §5–§7; ADR-004
- `docs/design/screens/AU-01…AU-05*.html`, `design-system.md`; stories ST-009–ST-011, ST-013, ST-014, ST-016, ST-017, ST-027–ST-029
- `backlog/BASIC-V1.md`, ADR-006

## 5. Constraints
- Branch `bv1-b3-auctions-live-bidding`. Migrations `<ts>_bv1_b3_*.sql`. Commits end `Refs: BV1-B3`.
- Bids **only** through `place_bid()`; there is no client insert policy.
- Out of scope: auto-bid, chat, second chance, reserve negotiation, seller dashboard, load test.

## 6. Acceptance criteria
- Two browsers bid on the same auction: the order is deterministic, both see updates live, and a same-millisecond pair rejects one with "outbid, new minimum X" (A5).
- A bid in the final 60 s extends the end by 3 min on every client.
- On end, the winner sees the 48h checklist and the others see "deposit released".
- RLS and pgTAP tests pass, including that a non-participant cannot bid. CI is green.

## 7. Deliverables
A PR titled `BV1-B3 Auctions with live bidding and anti-sniping`, with two-browser verify steps.

## 8. Self-check
- [ ] The countdown never uses the device clock.
- [ ] `security` review done (bids and money).
- [ ] Do not merge.
