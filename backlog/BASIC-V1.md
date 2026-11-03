# Basic v1: two-day plan (ADR-006)

Goal: by **Thu 5 Nov 2026**, all five sections and the admin work in a basic form on staging, using mock payments, KYC and SMS. The stakeholder checks everything once at the end.

## Waves and packages
Each package is one session, one branch and one PR. Packages own separate folders and migrations, to avoid conflicts. Migration file names start with the package ID, for example `<timestamp>_bv1_b3_auctions.sql`.

| Wave | Package | Branch | Owns | Built from (story detail) | Depends on |
|---|---|---|---|---|---|
| 0 | **ST-001** Foundation: repo, CI, staging | `st-001-repo-ci-staging` | monorepo, CI, deploy | ST-001 | — |
| 1 | **B1** Core: app shell, auth, profiles, roles, areas, properties, media, ID upload | `bv1-b1-shell-auth-core-schema` | `packages/ui`, `packages/shared`, app shells, auth and KYC pages, core tables | ST-002, ST-003, ST-004, ST-005 (manual ID review), ST-021 (simplified) | ST-001 |
| 2 | **B2** Wallet and deposits | `bv1-b2-wallet-mock-payments-deposit-lock` | ledger, wallet, mock gateway, lock and release, wallet screen | ST-006, ST-007, ST-008, ST-019 (no withdrawals) | B1 |
| 2 | **B3** Auctions | `bv1-b3-auctions-live-bidding` | auctions, bids, state jobs, anti-sniping, home, detail, live room, winner checklist | ST-009, ST-010, ST-011, ST-013, ST-014, ST-016, ST-017 (no chat), ST-027, ST-028, ST-029 (basic) | B1; calls B2's lock functions by contract |
| 2 | **B4** Marketplace and approvals | `bv1-b4-marketplace-listings-approval` | listings, filters, detail, save, report, submission and approval | ST-033, ST-034, ST-035, ST-036, ST-037, ST-038 (basic) | B1 |
| 2 | **B5** Requests, investment, rentals (basic) | `bv1-b5-requests-investment-rentals` | buyer_requests with matches; investment_listings with yields and offers; rental_listings with requests | EP-12, EP-13, EP-18 (PRD §6.1, §6.3, §7.1–7.3, §4.2 steps 1–2, basic) | B1 |
| 3 | **B6** Admin (basic) | `bv1-b6-admin-ops-basic` | admin shell, users and roles, approval queues (IDs, listings, auctions), create and schedule auction, live auctions list with pause and cancel, payments log | ST-020, ST-022, ST-023, ST-024, ST-025 (basic), ST-043 (log only) | B2, B3, B4, B5 merged |

**Packages run one at a time** (token saving): B1 → B2 → B3 → B4 → B5 → B6. Each starts from the latest `main`, and only after the stakeholder says go.

## Definition of Done (Basic v1)
- The package works end to end on its preview or staging, with synthetic data.
- CI is green (all ST-001 checks). RLS is on for every new table, and pgTAP tests cover each owner/other-user case.
- **Reviews and models (token rules in `CLAUDE.md`, 2026-11-03):** no sub-agents. The package session writes the code itself on Sonnet. One `security` review for B1, B2, B3 and B6 only, run with model Opus for B2 and B3. A short QA smoke test by the session itself.
- Arabic RTL and English, light and dark, using the design system.
- Then the orchestrator merges.

## Stakeholder check (end)
One walkthrough on staging:
1. Sign up.
2. Upload ID → admin approves.
3. Top up (mock) → join an auction → bid from two browsers → anti-sniping → winner checklist.
4. List a property → admin approves → it appears in the marketplace.
5. Post a buyer request → see matches.
6. Browse investment yields and make an offer.
7. Browse rentals and send a request.
8. Admin pauses and cancels an auction.
