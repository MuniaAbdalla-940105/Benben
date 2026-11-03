# ADR-006: Basic v1, the whole product in a basic form in 2 days

- Status: **accepted** (stakeholder decision) · Date: 2026-11-03 · Decided by: Munia Abdalla
- Replaces the 8-sprint Phase 1 timeline in `backlog/BACKLOG.md` as the active plan. Phase 1 stories stay as the source of detail; Basic v1 takes the simple core of each.

## Context
The stakeholder found the 21 Feb 2027 pilot date too far and asked for "the whole project in 2 days. Cut off any advanced development. I need the basic."

## Decision
1. **Scope: Basic v1** covers all five sections plus admin in a simple form. The work packages are in `backlog/BASIC-V1.md`.
2. **Cut until after Basic v1:**
   - Bidding and live: auto-bid, live chat, second-chance offers, reserve-not-met negotiation, the seller dashboard.
   - Brokers and contracts: broker deals and commission attribution, e-contracts and e-signature, rent collection and reminders.
   - Trust: automated anti-fake checks, linked-account detection.
   - Admin and channels: push, SMS and WhatsApp (in-app notices only); bulk import; maker-checker; analytics; the disputes center; withdrawals (manual by Finance).
   - Testing: the load test (ST-012).
3. **Not cut (guardrails):**
   - RLS on every table.
   - Bids, deposits and money only through server-side functions.
   - No service-role key in the browser.
   - Synthetic data only.
4. **Delivery:**
   - Two waves of work packages. Each package runs in its own session, branch and PR.
   - Agents review and test each package, and **the orchestrator merges when CI, review and QA are green**.
   - **The stakeholder verifies the whole app once on staging at the end** (stakeholder decision, 2026-11-03; this replaces per-story acceptance for Basic v1 only).
5. **Mocks stay:** payments, KYC and SMS. ID check is a manual upload approved by staff.

## Consequences
- Lighter reviews, so more defects are likely; the final stakeholder check is the main gate.
- Parallel sessions use a lot of quota. The account is near its weekly limit, so delays are possible.
- **Real-money launch is still blocked** by legal (Q-01 to Q-10), escrow, and real vendors, whatever the build speed.
