# Task prompt: Basic v1 B5 → react-frontend + supabase-backend

## 1. Role and seniority
A senior full-stack engineer with 10 years of experience in real-estate products (buyer leads, investment yield tools, rentals), React and Postgres. Known for clear calculators and simple forms. Senior level: basic features, no money movement.

## 2. Context
Basic v1 (ADR-006), **wave 2**. These three sections are funnels into auctions (PRD §1.3), and the basic versions only need the core loop. B1 provides the shell and `properties`; B4 provides `content_submissions` (approval). If B4 is not merged yet, code to its documented API from its PR, or coordinate in your PR.

## 3. Task
1. **Buyer Requests** (PRD §6.1 steps 1–3, §6.3):
   - create a request: purpose, types, up to 3 areas, budget (cash and/or down payment + monthly), bedrooms, size, finishing, delivery;
   - published for 30 days;
   - show **instant matches** from approved marketplace listings and upcoming auctions, using the match score from §6.3;
   - My Requests.
   - **No brokers or deals.**
2. **Investment** (PRD §7.1–7.3):
   - tenanted listings with rent, lease dates, increase % and annual costs;
   - **gross yield, net yield and payback** computed server-side (§7.2);
   - list sorted by net yield, with filters;
   - detail with a lease timeline and a simple income simulator (price, costs and vacancy inputs);
   - "Make offer" (stored);
   - submission through `content_submissions`.
   - The projections disclaimer is shown.
3. **Rentals** (PRD §4.1–4.2, basic):
   - rental listings with a Luxury / Middle Class track flag;
   - browse with filters (area, compound, budget, furnished, move-in);
   - detail with a "Request viewing / booking" request (stored);
   - landlord listing through `content_submissions`.
   - **No contracts, payments or reminders.**

## 4. Inputs
- PRD §4, §6, §7 (read only), `DATA_MODEL.md` (later-phase tables noted), `design-system.md`, `backlog/BASIC-V1.md`, ADR-006

## 5. Constraints
- Branch `bv1-b5-requests-investment-rentals`. Migrations `<ts>_bv1_b5_*.sql`. Commits end `Refs: BV1-B5`.
- RLS on every table: buyer requests are private to their owner, and only approved listings are public.
- Out of scope: brokers and commissions, yield auctions, e-contracts, rent collection, guarantees, affordability checks.

## 6. Acceptance criteria
- A user posts a request and immediately sees matching listings and auctions.
- An investment listing shows correct yields: unit tests against the §7.2 formulas with sample numbers.
- A rental shows on the Rent tab, and a viewing request reaches the landlord's list.
- CI is green.

## 7. Deliverables
A PR titled `BV1-B5 Buyer requests, investment and rentals (basic)`.

## 8. Self-check
- [ ] The yield maths uses integer piasters on the server; the display rounds only.
- [ ] Do not merge.
