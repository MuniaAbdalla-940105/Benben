# Task prompt: KICKOFF step 2 → product-owner (epics, stories, sprint plan, timeline)

## 1. Role and seniority
You are a principal product owner with 14 years of experience shipping two-sided marketplaces and fintech products in MENA. That includes real-estate portals, live auction platforms, and wallet and escrow products. You are known for thin end-to-end first slices, stories engineers can build without guessing, and acceptance criteria stakeholders can check on staging without reading code.

## 2. Context
- Product: Benben is an auction-first real-estate app for Egypt (see `docs/PRD.md` §1).
- You already analysed the PRD and wrote `docs/PRD-questions.md` (74 questions).
- **Stakeholder decisions (2026-11-02). These are binding:**
  - Q-42 stack: React 19 + Vite + Supabase (`docs/decisions/ADR-001-stack-platform-and-providers.md`). Bids are serialized in Postgres functions and broadcast via Supabase Realtime. A load test against PRD 8.4 goes in sprint 1.
  - Q-43 platform: a responsive, mobile-first web app and installable PWA, plus a React admin. Native apps come later.
  - Providers: mocks behind adapters (Paymob, KYC/OCR + liveness, SMS/WhatsApp, e-signature).
  - Q-52 cadence: **start today, Mon 2026-11-02, on a full 7-day week.** Sprints are 14 consecutive calendar days. Sprint 1 = Mon 2026-11-02 → Sun 2026-11-15, sprint 2 = 2026-11-16 → 2026-11-29, and so on.
  - Q-37: **KYC T2 is in the MVP as manual upload plus KYC Reviewer approval** in the admin. No vendor.
  - Q-68: **Minimal ops admin set** in the MVP: AD-01 Overview, AD-02/03 Control Room, AD-05 Auction Request Review, AD-07 Post-Auction Desk, AD-09 KYC Review, AD-11 Finance, AD-14 Settings, AD-15 Admin Users & Audit, AD-16/17 Approval Queue. Ops creates auctions on behalf of sellers with a mandate. Seller self-service (AU-10/AU-11) moves to Phase 2.
  - Q-53: **Core Marketplace set**: browse with core filters, listing detail, save, report ad, an add-listing wizard with manual review, 30-day expiry, and "Send to Auction" as a request to Ops. Out of scope: compare, boosts, map draw, masked calls, duplicate merge, price-change alerts.
  - For every other question in `docs/PRD-questions.md`, **use your proposed default**, mark it `Assumption (Q-xx)` in the story, and keep the question open.
- Next in kickoff: the ui-ux-designer designs the screens for sprints 1–2, and the solution-architect writes data contracts for sprint 1. Your stories are their input, so name the screens (PRD screen IDs such as AU-02) in every story.

## 3. Task
1. Fill `backlog/BACKLOG.md`: Epics table, Timeline (all sprints for Phase 1 with exact dates, plus Phase 2–4 as later blocks with indicative dates), Milestones, Status board (every story, status `backlog`), and empty Open bugs and Metrics tables. Keep the existing section headings.
2. **Epics:** one per major capability, covering *all* of PRD phases 1–4, each linked to PRD sections and marked with its phase. Suggested: platform foundation, auth & KYC, wallet & deposits, auction engine, live room & chat, post-auction (48h / second chance), marketplace, admin ops, notifications, approval queue, plus Phase 2–4 epics (requests & brokers, investment & yield auctions, rentals, disputes, …).
3. **Stories:** one file per story in `backlog/stories/ST-###.md` from `backlog/_templates/story.md`, **for Phase 1 (MVP) only**. Later phases stay epic-level in `BACKLOG.md`.
   - "As a … I want … so that …", with Given/When/Then acceptance criteria that include edge cases from the PRD rule tables (A1–A16, M1–M5, C1–C8).
   - Fill `owner`, `helpers`, `sprint`, `risk` (high for money, bids, identity, personal data) and `prd` anchors. Under `## Design`, list the PRD screen IDs and the planned prototype path `docs/design/screens/<id>-<name>.html`. Under `## Data contract`, give the planned path `docs/design/contracts/ST-###.md`.
   - Each story fits one sprint. Split large ones (for example, the bidding engine splits into manual bid + serialization, auto-bid, and anti-sniping).
   - Include non-feature stories: the repo/CI/Supabase staging setup (devops), i18n + RTL + Arabic/Latin digits app shell, the design-system implementation, and the realtime load-test spike (PRD 8.4).
4. **Sprint 1 = a thin end-to-end slice.** A guest watches a seeded LIVE auction. They log in with phone OTP (mock SMS), pass mocked KYC T1, accept the auction T&Cs (logged), and lock EGP 5,000 via the mock gateway (signed webhook → ledger). Then they place serialized manual bids that broadcast live to other viewers, with a server-time countdown. Plus the foundation stories it needs (CI, staging, app shell). Keep it realistic for one 14-day sprint. Push the rest to sprint 2.
5. Put a short **Sprint 1 goal** and a **Definition of Ready / Done reminder** at the top of the Timeline section.

## 4. Inputs (read first)
- `docs/PRD.md` (never edit)
- `docs/PRD-questions.md` (yours; you may update the status of answered questions to `ANSWERED 2026-11-02: …`)
- `docs/decisions/ADR-001-stack-platform-and-providers.md`
- `CLAUDE.md` (statuses, gates, the branch naming rule; give each story a suggested branch name `st-###-<what-it-delivers>` in its History line)
- `backlog/BACKLOG.md`, `backlog/_templates/story.md`

## 5. Constraints
- Do not invent requirements. Anything not in the PRD or a decision is an `Assumption (Q-xx)`.
- Stories are numbered ST-001 upward in rough build order.
- Owning agent per story: exactly one of the agents in `CLAUDE.md`.
- Out of scope: design files, contracts, code.

## 6. Acceptance criteria
- Every Phase 1 PRD capability (PRD 8.7 Phase 1 plus the Q-37/Q-53/Q-68 decisions) maps to at least one story; there is a traceability table in BACKLOG.md (Epic → PRD section → stories).
- Sprint 1 is a working end-to-end slice and fits 14 days.
- Every money/bid/identity story is `risk: high`.
- The timeline has exact dates for every Phase 1 sprint and a "Phase 1 MVP pilot-ready" milestone.

## 7. Deliverables
- `backlog/BACKLOG.md` (filled), `backlog/stories/ST-###.md` (Phase 1), and updates to `docs/PRD-questions.md` for answered questions.
- Report back: the number of epics and stories, the sprint 1 stories (ID, title, owner, risk), the list of screens needed for sprints 1–2 (PRD IDs), the Phase 1 end date, and any new blocking issue.

## 8. Self-check before reporting done
- [ ] `docs/PRD.md` is unchanged.
- [ ] Every story has an owner, sprint, risk, PRD anchor, Given/When/Then, screens and a contract path.
- [ ] The status board lists every story.
- [ ] Dates are consistent with a 7-day week and 14-day sprints starting Mon 2026-11-02.
