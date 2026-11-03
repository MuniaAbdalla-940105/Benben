# Backlog

<!-- Maintained by the product-owner agent. Story details live in backlog/stories/, bugs in backlog/bugs/. -->

Source: `docs/PRD.md` v1.0. Decisions: `docs/decisions/ADR-001-stack-platform-and-providers.md` and the stakeholder answers recorded on 2026-11-02 in `docs/PRD-questions.md` (Q-37, Q-42, Q-43, Q-52, Q-53, Q-68). Every other open question uses the proposed default and is marked `Assumption (Q-xx)` in the stories that depend on it.

Phase 1 (MVP) has story files. Phases 2–4 are listed as epics only and will be broken into stories at the refinement before each phase starts.

## Epics
| Epic | Title | Phase | PRD section | Stories |
|---|---|---|---|---|
| EP-01 | Platform foundation (repo, CI, staging, app shell, i18n/RTL, design system, realtime load test) | 1 | 1.1, 8.2, 8.4, ADR-001 | ST-001, ST-002, ST-003, ST-012 |
| EP-02 | Auth, KYC and identity trust (OTP, T1, T2, linked accounts, flags and bans) | 1 | 2.1, 2.2, 3.9 (A12, A14), 8.2 | ST-004, ST-005, ST-021, ST-046, ST-047 |
| EP-03 | Wallet, payments and deposits (ledger, gateway, Join to Bid lock, top-up, withdrawals, refunds, chargebacks) | 1 | 2.3, 3.4, 3.9 (A1–A4), 8.2, 8.6 | ST-006, ST-007, ST-008, ST-019, ST-042, ST-044 |
| EP-04 | Auction engine (state machine, manual bid, auto-bid, anti-sniping, void/cancel, auto-pause) | 1 | 3.2, 3.5, 3.6, 3.9 (A5, A7, A16), 8.4 | ST-010, ST-013, ST-014, ST-015, ST-026, ST-049 |
| EP-05 | Auction discovery and live room (home, detail, bid UI, live room, chat, "For you") | 1 | 3.1, 3.4, 3.8, 3.11 | ST-009, ST-011, ST-016, ST-017, ST-018, ST-048 |
| EP-06 | Post-auction (close, results, 48h obligations, default, second chance, seller outcomes) | 1 | 3.2, 3.7, 3.9 (A8–A11, A15) | ST-027, ST-028, ST-029, ST-030, ST-031 |
| EP-07 | Marketplace core (explore, filters, detail, save, report, anti-fake, expiry, Send to Auction) | 1 | 5.1–5.6 (core set per Q-53) | ST-035, ST-036, ST-037, ST-038, ST-039, ST-050 |
| EP-08 | Content submission and Approval Queue | 1 | 8.1.5 (A, B, E, F, G) | ST-033, ST-034 |
| EP-09 | Admin operations, minimal set (AD-01, 02/03, 05, 07, 09, 11, 14, 15, 16/17) | 1 | 8.1, 8.1.1–8.1.4 | ST-020, ST-022, ST-023, ST-024, ST-025, ST-032, ST-043, ST-045, ST-052 |
| EP-10 | Notifications and PWA push | 1 | 8.3, ADR-001 | ST-040, ST-041 |
| EP-11 | Privacy, security and pilot readiness | 1 | 8.2, 8.4, 8.7, 8.8 | ST-051, ST-053, ST-054, ST-055 |
| EP-12 | Buyer Requests and broker app (reverse marketplace, deals, commission attribution) | 2 | 6.1–6.6, 2.2 (Broker) | epic only |
| EP-13 | Investment properties and Yield Auctions | 2 | 7.1–7.6 | epic only |
| EP-14 | Seller self-service (AU-10 Request Auction, AU-11 Seller Dashboard) and North Coast seasonal auctions | 2 | 3.3, 3.11, 8.7 | epic only |
| EP-15 | Ops data entry at scale (AD-18 Create Content, AD-19/20 bulk import and rollback) | 2 | 8.1.5 C–D | epic only |
| EP-16 | Marketplace extensions (compare, boosts, map draw, masked calls, duplicate merge M1, price history alerts M2, stock-photo detection) | 2 (proposed) | 5.1–5.4 | epic only |
| EP-17 | Admin extensions (AD-04 Pipeline kanban, AD-06 Calendar, AD-08 User 360, AD-10 Listings Moderation, AD-13 CMS, Analytics, global search) | 2 (proposed) | 8.1, 8.1.1, 8.1.3 | epic only |
| EP-18 | Rentals: Middle Class track | 3 | 4.1–4.7 | epic only |
| EP-19 | Rentals: Luxury track (T2 tenants, affordability, guarantees, compound NOC) | 3 | 4.1, 4.2, 4.5 | epic only |
| EP-20 | E-contracts and e-signature (lease and sale contracts) | 3 | 4.3, 3.7 | epic only |
| EP-21 | Rent collection, escrow deposits and landlord payouts | 3 | 4.3, 4.4, 4.5 | epic only |
| EP-22 | Disputes Center (unified dispute flow, AD-12) | 3 | 8.1 (F7), 8.2, 4.5 | epic only |
| EP-23 | Developer bulk and branded auctions | 4 | 2.1, 8.7 | epic only |
| EP-24 | Live video tours in auctions | 4 | 3.8, 8.7 | epic only |
| EP-25 | Financing partners | 4 | 8.7 | epic only |
| EP-26 | New Administrative Capital expansion | 4 | 1.1, 8.7 | epic only |
| EP-27 | Native mobile apps on the same backend | 4 (proposed) | ADR-001, 8.5 | epic only |

Phases marked "(proposed)" are product-owner proposals: the PRD lists these features but does not place them in a phase (Q-53, Q-68 moved them out of the MVP).

### Traceability (Phase 1)
| Phase 1 capability | PRD section | Epic | Stories |
|---|---|---|---|
| Phone OTP login (T0) | 2.1, 2.2 | EP-02 | ST-004 |
| KYC T1 (ID OCR + liveness, mocked) | 2.2, 3.4 | EP-02 | ST-005 |
| KYC T2 manual upload and review (decision Q-37) | 2.2, 3.3, 3.7 | EP-02, EP-09 | ST-021, ST-022 |
| Wallet on a double-entry ledger | 2.3, 8.2, 8.6 | EP-03 | ST-006, ST-019 |
| Payment gateway with signed webhooks (mocked) | 2.3, 3.9 A1–A3, 8.2 | EP-03 | ST-007 |
| Seriousness deposit lock, Join & Lock, T&C log | 2.3, 3.4 | EP-03 | ST-008 |
| Withdrawals, refunds, chargebacks | 2.3, 3.9 A3–A4 | EP-03 | ST-042, ST-044 |
| Auction state machine and scheduling | 3.2 | EP-04 | ST-013, ST-024 |
| Manual bid, serialization, realtime broadcast | 3.5, 8.4 | EP-04, EP-05 | ST-010, ST-011, ST-012 |
| Auto-bid | 3.5 | EP-04 | ST-015 |
| Anti-sniping | 3.6 | EP-04 | ST-014 |
| Auctions home, detail, live room | 3.1, 3.11 | EP-05 | ST-009, ST-016, ST-017, ST-048 |
| Live chat with moderation | 3.8 | EP-05 | ST-018 |
| Close, 48h rule, completion | 3.7 | EP-06 | ST-027, ST-028, ST-029 |
| Default, forfeiture, second chance | 3.7, A10 | EP-06 | ST-030 |
| Reserve not met, no bids, seller withdrawal, relist | A8, A9, A11 | EP-06 | ST-031 |
| Edge cases A5, A6, A7, A12, A13, A14, A15, A16 | 3.9 | EP-04, EP-02, EP-06, EP-09 | ST-010, ST-017, ST-049, ST-046, ST-032, ST-047, ST-027, ST-026 |
| Marketplace: browse and core filters (Q-53) | 5.1, 5.2 | EP-07 | ST-036 |
| Marketplace: listing detail and save (Q-53) | 5.1, 5.6 | EP-07 | ST-037 |
| Marketplace: add-listing wizard with manual review (Q-53) | 5.1, 8.1.5 | EP-08 | ST-033, ST-034 |
| Marketplace: report ad, strikes (Q-53) | 5.3, 5.4 | EP-07 | ST-038 |
| Marketplace: anti-fake prevention | 5.3 | EP-07 | ST-033, ST-039 |
| Marketplace: 30-day expiry, renew, My Listings (Q-53) | 5.3, 5.6 | EP-07 | ST-035 |
| Marketplace: "Send to Auction" as a request to Ops (Q-53, M4) | 5.4 | EP-07 | ST-035, ST-050 |
| Content submission statuses, edits, C1–C8 | 8.1.5 | EP-08 | ST-033, ST-034, ST-035, ST-023 |
| AD-01 Overview (Q-68) | 8.1.3 | EP-09 | ST-052 |
| AD-02/03 Control Room (Q-68) | 8.1, F2 | EP-09 | ST-025, ST-026, ST-049 |
| AD-05 Auction Request Review, Ops on behalf of seller (Q-68) | 3.3, F1, 8.1.5 C | EP-09 | ST-023, ST-024 |
| AD-07 Post-Auction Desk (Q-68) | F3 | EP-09 | ST-032 |
| AD-09 KYC Review (Q-68) | F4 | EP-09 | ST-022 |
| AD-11 Finance (Q-68) | F6 | EP-09, EP-03 | ST-043, ST-042, ST-044 |
| AD-14 Settings (Q-68) | 8.1, 8.1.4 | EP-09 | ST-045 |
| AD-15 Admin Users & Audit, RBAC, 2FA (Q-68) | 8.1, 8.1.4 | EP-09 | ST-020 |
| AD-16/17 Approval Queue (Q-68) | 8.1.5 B | EP-08 | ST-034 |
| Notifications matrix (MVP events) | 8.3 | EP-10 | ST-040, ST-041 |
| Responsive web + PWA (Q-43) | ADR-001 | EP-01, EP-10 | ST-002, ST-040 |
| Non-functional: realtime, security, privacy, localization, accessibility, performance | 8.4 | EP-01, EP-11 | ST-002, ST-003, ST-012, ST-051, ST-053, ST-054 |
| Pilot New Cairo + Zayed | 1.1, 8.7 | EP-11 | ST-055 |

## Timeline

**Sprint 1 goal:** On staging, a guest can watch a seeded LIVE auction with a server-time countdown, log in with phone OTP (mock SMS), pass KYC T1 (mock), accept the auction T&Cs (logged), and lock EGP 5,000 through the mock gateway (signed webhook → ledger). They can then place serialized manual bids that other viewers see live. The realtime load test reports whether p95 < 300 ms at 5,000 viewers holds.

**Definition of Ready (reminder):** story and Given/When/Then written; HTML design attached; schema and RLS drafted in the data contract when data is involved; dependencies named; fits one sprint; test approach noted.
**Definition of Done (reminder):** acceptance criteria met; code and security review passed; RLS tests and unit/API tests green in CI; QA evidence linked in the story; deployed to staging; release-note line written; status `awaiting-validation` and stakeholder notified with the staging link.

Cadence: 7-day week, 14-calendar-day sprints, starting Mon 2026-11-02 (decision Q-52). Each sprint runs Monday to the Sunday 13 days later.

| Sprint | Dates | Goal | Status |
|---|---|---|---|
| 1 | 2026-11-02 – 2026-11-15 | Thin end-to-end slice: watch → OTP → KYC T1 → T&C + lock → serialized bid broadcast live; foundation and load test | planned |
| 2 | 2026-11-16 – 2026-11-29 | Complete auction engine and live experience: state machine, anti-sniping, auto-bid, Auctions Home, Live Room, chat, wallet, admin shell | planned |
| 3 | 2026-11-30 – 2026-12-13 | Ops can run auctions: KYC T2 and review, create on behalf, pricing/approval/scheduling, Control Room, void and cancel | planned |
| 4 | 2026-12-14 – 2026-12-27 | Post-auction: close and lock settlement, results, 48h obligations, default and second chance, seller outcomes, Post-Auction Desk | planned |
| 5 | 2026-12-28 – 2027-01-10 | Core Marketplace and Approval Queue | planned |
| 6 | 2027-01-11 – 2027-01-24 | Anti-fake checks, notifications and PWA push, withdrawals, Finance ledger and reconciliation, refunds and chargebacks | planned |
| 7 | 2027-01-25 – 2027-02-07 | Settings, trust and safety (linked accounts, flags, bans), auto-pause, "For you", Send to Auction conversion, privacy requests. Feature freeze at sprint end | planned |
| 8 | 2027-02-08 – 2027-02-21 | Hardening: Overview KPIs, security audit, end-to-end regression and pilot load test, pilot readiness | planned |
| Phase 2 (S9–S14) | 2027-02-22 – 2027-05-16 (indicative) | EP-12 Requests & brokers, EP-13 Investment & Yield Auctions, EP-14 seller self-service + North Coast, EP-15 bulk import, EP-16/17 proposed extensions | later |
| Phase 3 (S15–S20) | 2027-05-17 – 2027-08-08 (indicative) | EP-18 Middle Class rentals, EP-19 Luxury rentals, EP-20 e-contracts, EP-21 rent collection, EP-22 Disputes Center | later |
| Phase 4 (S21+) | from 2027-08-09 (indicative) | EP-23 developer auctions, EP-24 video tours, EP-25 financing, EP-26 New Capital, EP-27 native apps | later |

### Sprint scope
- **Sprint 1:** ST-001, ST-002, ST-003, ST-004, ST-005, ST-006, ST-007, ST-008, ST-009, ST-010, ST-011, ST-012. Capacity note: this is a full sprint. If it slips, ST-003 is cut down to the components the slice uses, and the tail of ST-012 (pilot-sizing figures) moves to sprint 2. The slice itself (ST-004 to ST-011) is protected.
- **Sprint 2:** ST-013, ST-014, ST-015, ST-016, ST-017, ST-018, ST-019, ST-020
- **Sprint 3:** ST-021, ST-022, ST-023, ST-024, ST-025, ST-026
- **Sprint 4:** ST-027, ST-028, ST-029, ST-030, ST-031, ST-032
- **Sprint 5:** ST-033, ST-034, ST-035, ST-036, ST-037, ST-038
- **Sprint 6:** ST-039, ST-040, ST-041, ST-042, ST-043, ST-044
- **Sprint 7:** ST-045, ST-046, ST-047, ST-048, ST-049, ST-050, ST-051
- **Sprint 8:** ST-052, ST-053, ST-054, ST-055

Configuration values (deposit, increments, premium, windows) are seeded in a config store from sprint 1. ST-045 adds the Settings screen on top of the same store in sprint 7.

## Milestones
- 2026-11-15: Sprint 1 demo on staging: thin end-to-end auction slice, plus the realtime load-test result (go/no-go on a dedicated realtime service, ADR-001).
- 2026-11-29: Auction engine and live experience complete (auto-bid, anti-sniping, Live Room, chat).
- 2026-12-13: Ops can vet, schedule, monitor and control auctions in the admin.
- 2026-12-27: Full auction lifecycle on staging, including 48h obligations, default and second chance.
- 2027-01-10: Core Marketplace and Approval Queue on staging. Target date for vendor sandbox keys and legal answers (Q-01–Q-10), so real adapters can replace mocks in sprints 7–8.
- 2027-01-24: Finance, withdrawals and notifications complete.
- 2027-02-07: Phase 1 feature freeze.
- **2027-02-21: Phase 1 MVP pilot-ready** (New Cairo + Sheikh Zayed). The go-live decision remains with the stakeholder, subject to the legal gates and real vendors in ST-055.
- 2027-02-22: Phase 2 starts (indicative).
- 2027-05-17: Phase 3 starts (indicative).
- 2027-08-09: Phase 4 starts (indicative).

## Status board
| Story | Title | Owner | Sprint | Status | Loops |
|---|---|---|---|---|---|
| ST-001 | Repo, CI pipeline and Supabase staging project | devops | 1 | in-review | 0 |
| ST-002 | App shell with i18n, RTL, digit toggle and EGP formatting | react-frontend | 1 | backlog | 0 |
| ST-003 | Design system implementation (sprint 1 components) | react-frontend | 1 | backlog | 0 |
| ST-004 | Phone OTP sign-up and login (mock SMS), T0 account | supabase-backend | 1 | backlog | 0 |
| ST-005 | KYC T1 with mock ID OCR and selfie liveness | integration | 1 | backlog | 0 |
| ST-006 | Wallet on a double-entry ledger | supabase-backend | 1 | backlog | 0 |
| ST-007 | Mock payment gateway with signed webhooks to the ledger | integration | 1 | backlog | 0 |
| ST-008 | Join to Bid: accept T&Cs and lock EGP 5,000 | supabase-backend | 1 | backlog | 0 |
| ST-009 | Auction detail for guests, seeded LIVE auction, server-time countdown | react-frontend | 1 | backlog | 0 |
| ST-010 | Manual bid: serialized server function and realtime broadcast | supabase-backend | 1 | backlog | 0 |
| ST-011 | Bid controls, confirmation sheet and live updates | react-frontend | 1 | backlog | 0 |
| ST-012 | Realtime load-test spike (5,000 viewers, p95 < 300 ms) | devops | 1 | backlog | 0 |
| ST-013 | Auction state machine and scheduler | supabase-backend | 2 | backlog | 0 |
| ST-014 | Anti-sniping extensions with optional cap | supabase-backend | 2 | backlog | 0 |
| ST-015 | Auto-bid (proxy bidding) with setup screen | supabase-backend | 2 | backlog | 0 |
| ST-016 | Auctions Home rails and reminders | react-frontend | 2 | backlog | 0 |
| ST-017 | Live Room with bid ladder, reconnect and resync | react-frontend | 2 | backlog | 0 |
| ST-018 | Auction live chat with pseudonyms and auto-moderation | supabase-backend | 2 | backlog | 0 |
| ST-019 | Wallet screen: balances, top-up, pending, history | react-frontend | 2 | backlog | 0 |
| ST-020 | Admin shell, 2FA, RBAC and audit log (AD-15) | supabase-backend | 2 | backlog | 0 |
| ST-021 | KYC T2 document upload | supabase-backend | 3 | backlog | 0 |
| ST-022 | KYC Review queue (AD-09) | react-frontend | 3 | backlog | 0 |
| ST-023 | Ops creates auction on behalf of seller (AD-05 part 1) | react-frontend | 3 | backlog | 0 |
| ST-024 | Auction pricing, approval and scheduling (AD-05 part 2) | supabase-backend | 3 | backlog | 0 |
| ST-025 | Auction Control Room (AD-02/03) | react-frontend | 3 | backlog | 0 |
| ST-026 | Void a bid and cancel an auction (maker-checker) | supabase-backend | 3 | backlog | 0 |
| ST-027 | Auction close: rank, release, hold backups | supabase-backend | 4 | backlog | 0 |
| ST-028 | Auction Result screen and My Auctions | react-frontend | 4 | backlog | 0 |
| ST-029 | 48-hour winner obligations and completion | supabase-backend | 4 | backlog | 0 |
| ST-030 | Winner default, forfeiture and second-chance offers | supabase-backend | 4 | backlog | 0 |
| ST-031 | Seller-side outcomes: reserve not met, no bids, relist, withdrawal | supabase-backend | 4 | backlog | 0 |
| ST-032 | Post-Auction Desk (AD-07) | react-frontend | 4 | backlog | 0 |
| ST-033 | "+ Add" chooser and Add Listing wizard | react-frontend | 5 | backlog | 0 |
| ST-034 | Approval Queue and Review Detail (AD-16/17) | react-frontend | 5 | backlog | 0 |
| ST-035 | My Submissions and My Listings, expiry, Send to Auction | react-frontend | 5 | backlog | 0 |
| ST-036 | Explore and core filters with saved searches | react-frontend | 5 | backlog | 0 |
| ST-037 | Listing detail with save and contact request | react-frontend | 5 | backlog | 0 |
| ST-038 | Report ad, auto-hide and strikes | supabase-backend | 5 | backlog | 0 |
| ST-039 | Automated anti-fake checks for listings | supabase-backend | 6 | backlog | 0 |
| ST-040 | Notification service, web push, PWA install, mock channels | integration | 6 | backlog | 0 |
| ST-041 | Auction and wallet notification events | supabase-backend | 6 | backlog | 0 |
| ST-042 | Withdrawals: user request and Finance approval | supabase-backend | 6 | backlog | 0 |
| ST-043 | Finance ledger explorer and reconciliation (AD-11) | react-frontend | 6 | backlog | 0 |
| ST-044 | Refunds, chargebacks and forfeiture reversal | supabase-backend | 6 | backlog | 0 |
| ST-045 | Settings with version history and approval (AD-14) | supabase-backend | 7 | backlog | 0 |
| ST-046 | Linked-account detection and shill-bid prevention | supabase-backend | 7 | backlog | 0 |
| ST-047 | KYC flag mid-auction, shared bans and strikes | supabase-backend | 7 | backlog | 0 |
| ST-048 | "For you" and "Upcoming auctions like this" rails | react-frontend | 7 | backlog | 0 |
| ST-049 | Realtime health monitor and auto-pause (A7) | supabase-backend | 7 | backlog | 0 |
| ST-050 | Ops converts Send to Auction requests (M4) | supabase-backend | 7 | backlog | 0 |
| ST-051 | Personal data export and deletion requests | supabase-backend | 7 | backlog | 0 |
| ST-052 | Admin Overview with KPIs (AD-01) | react-frontend | 8 | backlog | 0 |
| ST-053 | MVP security audit | security | 8 | backlog | 0 |
| ST-054 | End-to-end regression and pilot-size load test | qa-engineer | 8 | backlog | 0 |
| ST-055 | Pilot readiness and go-live checklist | devops | 8 | backlog | 0 |

## Open bugs
| Bug | Story | Severity | Owner | Status |
|---|---|---|---|---|

## Metrics
| Sprint | Goal delivered | Cycle time | First-pass QA | Reopen rate | Escaped defects | Escalations | AI cost |
|---|---|---|---|---|---|---|---|

## Retrospective notes
