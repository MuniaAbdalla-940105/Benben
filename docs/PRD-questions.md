# Benben: PRD analysis and open questions

Source: `docs/PRD.md` (PRD v1.0, Nov 2, 2026, @Munia Abdalla). Prepared at kickoff by the product-owner agent on 2026-11-02.
Status: **open**. Stakeholders answer inline under each question (add `**Answer:**`). Until a question is answered, the proposed default applies and is marked as an assumption in any story that depends on it.

**Update 2026-11-02:** The stakeholder answered all six BLOCKS-PLANNING questions (Q-37, Q-42, Q-43, Q-52, Q-53, Q-68) and decided "mocks behind adapters" for providers (ADR-001). That decision partly answers Q-09, Q-35 and Q-40: the vendor choice itself is still open. Each answered question carries a `Status: ANSWERED 2026-11-02` line. All other questions stay open, and the backlog uses their proposed defaults, marked `Assumption (Q-xx)`.

Tags:
- `BLOCKS-PLANNING`: the epics, MVP scope or timeline cannot be fixed without an answer.
- `BLOCKS-SPRINT-1`: needed before sprint 1 design and build start. The default is safe to start with.
- `BLOCKS-LATER`: needed before the story that uses it, or before the pilot launch.
- `NICE-TO-KNOW`: does not block. The default is fine.

---

## Needs a stakeholder answer now (BLOCKS-PLANNING)

All six were answered on 2026-11-02. The answers are recorded under each question below. Q-52 was answered differently from the default: start Mon 2026-11-02 on a 7-day week.

| # | Question | Proposed default |
|---|---|---|
| [Q-42](#q-42) | PRD 8.5 suggests Flutter + Next.js + NestJS + Redis + BullMQ + Socket.IO. `CLAUDE.md` fixes React + Supabase. Which stack do we build on? | Keep React 19 + Vite + Supabase. Record the decision in ADR-001 and prove real-time p95 < 300 ms at 5,000 viewers with a load-test spike in sprint 1–2. |
| [Q-43](#q-43) | Is the MVP a native mobile app, or responsive web/PWA first? | Mobile-first responsive web + installable PWA for consumers, plus a web admin. Decide on native apps after the pilot. |
| [Q-52](#q-52) | When does sprint 1 start, and which working week do we use? | Sprint 1 runs Sun 2026-11-08 to Thu 2026-11-19 (Egyptian Sun–Thu week). Two-week sprints. MVP is about 8 sprints (PRD 8.7, months 0–4). |
| [Q-37](#q-37) | Phase 1 lists only "KYC T1", but sellers need T2 for auction slots and winners must upload T2 documents within 48h. Is T2 in the MVP? | Yes. T2 is in the MVP as a manual document upload reviewed by a KYC Reviewer, with no vendor. |
| [Q-68](#q-68) | Phase 1 lists only "Admin Control Room + Finance", but auctions cannot run without the Pipeline (F1), the Post-Auction Desk (F3), KYC review (F4) and moderation. The seller dashboard is Phase 2. Which admin modules are in the MVP, and how do sellers get auctions in? | Minimal versions of AD-01, 02, 03, 05, 07, 09, 11, 14, 15, 16/17. Ops creates auctions on behalf of sellers (8.1.5 C). Seller self-service (AU-10/AU-11) moves to Phase 2. |
| [Q-53](#q-53) | What does "basic Marketplace with filters & reports" include? | Browse, core filters, listing detail, save, report ad, and an add-listing wizard with manual review. Compare, boosts, map draw and masked calls are left out. |

**Must be answered before the pilot goes live (legal):** Q-01, Q-02, Q-04, Q-05, Q-06, Q-07, Q-08, Q-10. These do not block building, but they do block launch.

---

## 1. Summary of the PRD

### 1.1 Goals and KPIs (PRD 1.4; these are planning targets to check after the pilot)
- Sell-through rate of 55% or more.
- 85% or more of winners complete within 48h.
- 6 or more verified bidders per auction on average.
- Hammer price at least 12% above the starting price on average.
- Confirmed fake listings below 1% of all listings.
- Auction revenue at least 60% of total revenue.

### 1.2 User roles (PRD 2.1, 8.1.4, 8.1.5 H)
- **Consumer side:** Guest, Registered User (T0), Verified Bidder (T1 plus a deposit lock per auction), Seller/Owner, licensed Broker, Developer (B2B), Tenant/Landlord, and Investor (implied in section 7). One account can hold several roles. What a user can do comes from role + KYC tier + wallet state.
- **Admin side:** Ops, Auction Control, KYC Reviewer, Finance, Support and Super Admin. Sections 8.1.4 and 8.1.5 add more: Ops Supervisor, Trust & Safety, Post-Auction agent, Content Reviewer, Data Entry, Publisher and Marketing (see Q-69).

### 1.3 The five sections (PRD 1.3)
1. **Flash 24H Auctions (core):** 24h live auction, EGP 5,000 deposit lock, manual bids and auto-bids, anti-sniping, live chat, 48h winner obligations, second-chance offers.
2. **Rentals:** Luxury and Middle Class tracks, e-contracts, rent collection, disputes. This is Phase 3.
3. **Marketplace:** fixed-price listings, a full filter set, an anti-fake system and a "Send to Auction" upsell. The basic version is in Phase 1.
4. **Buyer Requests:** a reverse marketplace for licensed brokers, with commission attribution. This is Phase 2.
5. **Investment Properties:** tenanted units, yield calculations and Yield Auctions. This is Phase 2.

### 1.4 Constraints
- Arabic RTL first, plus English, with a toggle between Arabic-Indic and Latin digits (1.1, 8.4).
- EGP only. Amounts are integer piasters on a double-entry ledger. Balances are never edited directly, and every write is idempotent (2.3, 8.2).
- The server is the only authority on time, auction state, balances and prices (3.2, 8.2).
- Bids are serialized per auction. A bid broadcast reaches viewers at p95 < 300 ms, with up to 5,000 concurrent viewers per auction (3.5, 8.4).
- Payment state changes only through signed webhooks or the gateway's inquiry API (8.2).
- Availability 99.9%. OWASP ASVS L2. PII and reserve prices encrypted at rest. Egypt PDPL 151/2020 (8.4).
- Append-only audit logs kept for at least 5 years. Maker-checker on sensitive admin actions (8.1.4, 8.2).
- Launch markets are New Cairo, Zayed/October, North Coast and the New Capital. The pilot is New Cairo + Zayed (1.1, 8.7).
- Framework constraints (`CLAUDE.md`): React 19 + Vite + Supabase, RLS on every table, money writes only through server-side functions, no production data in agent environments.

### 1.5 Key risks
- **Legal:** it is not yet confirmed that Benben may legally run online real-estate auctions, that deposit forfeiture is enforceable, that e-signatures are valid for sale contracts, or that Benben may hold user funds (wallet/escrow) or move personal data across borders (PDPL). Any of these could change the operating model.
- **Money:** chargebacks on deposits, delayed webhooks, duplicate charges, and down payments too large for card or wallet rails. There is no escrow partner yet.
- **Real-time:** missing p95 < 300 ms at 5,000 viewers, unfair bid ordering, clock drift, and outages during the final minute (A5–A7). These directly hurt trust and could lead to legal disputes.
- **Trust:** shill bidding and linked accounts (A12), fake listings, broker circumvention, and seller withdrawal after a win (A11).
- **Scope:** the PRD is wide (5 sections plus 20 admin screens). The Phase 1 list in 8.7 underestimates the admin and KYC work the auction flow needs (Q-37, Q-68).

---

## 2. Open questions

### A. Legal & compliance

#### Q-01
- **PRD:** 8.8, 1.5
- **Question:** Does running online real-estate auctions in Egypt need a licence or a licensed auctioneer? For example, does Law 100 of 1957 on commercial sales and public auctions apply? Do real-estate brokerage registration rules apply? Counsel to confirm.
- **Why it matters:** The answer could require a licensed partner to run the auctions, and it would change the T&Cs, the branding ("auction" wording) and the launch date.
- **Proposed default:** Build as specified. Get counsel's written opinion before the pilot goes live.
- **Tag:** `BLOCKS-LATER`

#### Q-02
- **PRD:** 8.8, 2.3 rule 6, 3.7, A4
- **Question:** Is forfeiting 100% of the EGP 5,000 deposit to Benben enforceable? Should part of it go to the seller as compensation?
- **Why it matters:** It decides the ledger accounts for forfeiture, the T&C wording, and the evidence we use in chargeback disputes (A4).
- **Proposed default:** 100% goes to the Benben revenue account, as the PRD says. Keep the split configurable in the ledger design.
- **Tag:** `BLOCKS-LATER`

#### Q-03
- **PRD:** 3.4 step 3, 8.2 (Consent)
- **Question:** Who writes the auction T&Cs (deposit, 48h rule, forfeiture, buyer's premium) in Arabic and English, and when will they be ready?
- **Why it matters:** The "Join to Bid" flow logs acceptance of a specific T&C version. We cannot launch without the final text.
- **Proposed default:** Staging uses a placeholder "T&C v0 – draft, not for production". Versioning and acceptance logging are built now.
- **Tag:** `BLOCKS-LATER`

#### Q-04
- **PRD:** 8.8, 3.7, 4.2 step 5, 4.3, F3 step 3
- **Question:** Is an OTP-based e-signature legally valid for reservation and sale contracts, or only for leases? Do we need an ITIDA-licensed e-signature provider under Law 15/2004? In the MVP, do winners sign electronically or at the Benben office?
- **Why it matters:** It decides whether we need an e-signature integration in the MVP, and it shapes the 48h checklist UI.
- **Proposed default:** In the MVP, sale contracts are signed at the Benben office. The agent uploads the signed scan and marks the contract signed (F3 step 3 already allows this). E-signature comes in Phase 3 with Rentals.
- **Tag:** `BLOCKS-LATER`

#### Q-05
- **PRD:** 2.3, 4.3 (rent collection), 1.6
- **Question:** Does holding user balances (the "Available" bucket and withdrawals) or collecting rent need a Central Bank of Egypt licence? Or must all funds sit with a licensed payment or escrow partner?
- **Why it matters:** If Benben cannot hold stored value, the "Available" balance may not be allowed. Every deposit might then have to be a card pre-authorization or a refund.
- **Proposed default:** Funds sit with a licensed partner. The Benben ledger is a record of those funds. There are no peer-to-peer transfers, and withdrawals go only to the original source or a bank account in the KYC name.
- **Tag:** `BLOCKS-LATER`

#### Q-06
- **PRD:** 8.4 (Privacy), 2.2
- **Question:** Under PDPL 151/2020, may personal data, National ID images and biometric selfies be stored outside Egypt? Supabase has no Egypt region. Do we need a licence or registration with the Personal Data Protection Center, or a DPO?
- **Why it matters:** It decides the hosting region for the production Supabase project and the choice of KYC vendor, and possibly self-hosting. The region is hard to change after launch.
- **Proposed default:** Staging runs in the nearest available Supabase region with synthetic data only. The production region is decided with counsel before the pilot.
- **Tag:** `BLOCKS-LATER`

#### Q-07
- **PRD:** 8.1 (KYC & Compliance: AML flags, sanctions/PEP), A14
- **Question:** Which AML obligations apply (Law 80/2002 and real-estate sector rules)? Who is the compliance officer, and which sanctions/PEP lists or screening vendor do we use?
- **Why it matters:** It affects the KYC queue design, A14 (KYC flagged mid-auction) and reporting.
- **Proposed default:** In the MVP, a KYC Reviewer can flag a user manually and does a manual sanctions check on auction winners. A screening vendor comes later.
- **Tag:** `BLOCKS-LATER`

#### Q-08
- **PRD:** 1.6, 3.5 (confirmation sheet), 8.1 (VAT reports)
- **Question:** Is VAT charged on the buyer's premium, listing fees and commissions? Is the 2.5% premium shown with or without VAT? Do we need Egyptian Tax Authority e-invoices or e-receipts?
- **Why it matters:** It changes the "estimated total" on AU-05, receipts and Finance exports.
- **Proposed default:** Build a configurable VAT line, switched off until Finance confirms. Premiums and fees are shown as configured.
- **Tag:** `BLOCKS-LATER`

### B. Money & payments

#### Q-09
- **Status:** ANSWERED 2026-11-02 (partly): Paymob sits behind an adapter with a realistic mock (ADR-001). The real merchant account and methods are still open.
- **PRD:** 2.3 rule 1, 8.5, A1–A3
- **Question:** Is Paymob the confirmed gateway, and is a merchant or sandbox account available? Which methods are in the MVP: cards, mobile wallets, Fawry?
- **Why it matters:** Sprint 1 needs a deposit lock that works. Fawry is asynchronous by design and drives the "Payment pending" flow (A2).
- **Proposed default:** Paymob. Sprints 1–2 use a mock gateway with signed (HMAC) webhooks and an inquiry API simulator. The real sandbox follows once the account exists. Cards and wallets come first, Fawry next.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-10
- **PRD:** 8.8, 3.7, 4.3, 7.4 I6
- **Question:** Which bank or payment partner holds escrow funds and seriousness deposits?
- **Why it matters:** It affects ledger account mapping, reconciliation (F6), and how down payments are confirmed.
- **Proposed default:** Deposits stay in the gateway settlement account. Escrow for down payments uses a partner chosen before the pilot. The ledger is designed so the partner can change.
- **Tag:** `BLOCKS-LATER`

#### Q-11
- **PRD:** 3.7, F3 step 3
- **Question:** Down payments and buyer's premiums are often hundreds of thousands to millions of EGP, which is beyond card and wallet limits. How does the winner pay (bank transfer to escrow, cheque, at the office)? Who confirms it? F3 says "confirmed automatically by webhook".
- **Why it matters:** It shapes the 48h checklist, the Post-Auction Desk and the integration scope.
- **Proposed default:** In the MVP, the winner pays by bank transfer to the escrow account and uploads proof. Finance confirms it manually in the Post-Auction Desk. Automation comes later.
- **Tag:** `BLOCKS-LATER`

#### Q-12
- **PRD:** 8.8, 1.6, 2.3 rule 7
- **Question:** What are the final buyer's premium %, seller listing fee, featured slot price and deposit tiers? Is the deposit tier based on the starting price, the valuation or the reserve? Is it fixed at scheduling?
- **Why it matters:** These are Settings defaults and the copy on AU-04 and AU-05.
- **Proposed default:** Premium 2.5% and deposit EGP 5,000, set per auction from a configurable tier table based on the starting price and fixed at SCHEDULED. Fee amounts are left blank for Finance to fill.
- **Tag:** `BLOCKS-LATER`

#### Q-13
- **PRD:** 3.3, F1 step 6, A11, 8.6 (`wallet_locks.purpose`)
- **Question:** How does the seller pay the listing fee and post the seller commitment (for example, EGP 10,000)? When is the commitment released? `wallet_locks.purpose` only lists auction and rental_deposit.
- **Why it matters:** It affects the data contract and the approval flow (F1).
- **Proposed default:** The commitment is a wallet lock with purpose `seller_commitment`, released at COMPLETED, NO_BIDS or relist, and forfeited under A11. The listing fee is a non-refundable gateway payment. Amounts are configured by admins.
- **Tag:** `BLOCKS-LATER`

#### Q-14
- **PRD:** 2.3 rules 1 and 5
- **Question:** What are the minimum and maximum top-up and withdrawal amounts, and are there fees? Where do Fawry (cash) top-ups get withdrawn to, since there is no "original card"?
- **Why it matters:** It affects the wallet UI, Finance's withdrawals queue and AML exposure.
- **Proposed default:** No fees. Minimum top-up is EGP 5,000 (one deposit); the maximum is configurable (assumption). Card and wallet funds are refunded to the source. Fawry funds go to a bank account in the KYC name after Finance approves.
- **Tag:** `BLOCKS-LATER`

#### Q-15
- **PRD:** 3.7 ("lock applied to the buyer's premium")
- **Question:** When the premium is larger than the deposit, is the rest collected together with the down payment? If a deposit tier is ever larger than the premium, is the excess released?
- **Why it matters:** It changes ledger entries at COMPLETED.
- **Proposed default:** The rest is collected with the down payment. Any excess is released to Available.
- **Tag:** `BLOCKS-LATER`

#### Q-16
- **PRD:** A11
- **Question:** How much is the winner's "goodwill credit" when a seller withdraws? Can it be withdrawn, or is it only usable inside the app?
- **Why it matters:** A non-withdrawable credit needs its own ledger bucket.
- **Proposed default:** A configurable fixed amount, credited to Available as a normal ledger entry.
- **Tag:** `NICE-TO-KNOW`

#### Q-17
- **PRD:** F3 step 4 ("seller payout scheduled")
- **Question:** What does Benben pay out to the auction seller, and when? For example, is the down payment released from escrow at contract signing or at handover?
- **Why it matters:** It decides whether the MVP needs seller payouts.
- **Proposed default:** No seller payout through Benben in the MVP. The escrow release is recorded but done outside the app.
- **Tag:** `BLOCKS-LATER`

### C. Auctions engine

#### Q-18
- **PRD:** 3.2
- **Question:** The lifecycle diagram ("[embedded content: Auction lifecycle]") did not export into the PRD. Is the state table the source of truth?
- **Why it matters:** It avoids conflicts between the diagram and the table.
- **Proposed default:** Yes, the table in 3.2 plus the edge-case rules in 3.9 are the source of truth.
- **Tag:** `NICE-TO-KNOW`

#### Q-19
- **PRD:** 3.2, 3.9 (A12, A16), 8.1.4
- **Question:** The state table has gaps:
  - REJECTED, CANCELLED, RELISTED, NO_BIDS and SELLER_DECISION have no rows of their own.
  - LIVE, EXTENDED and PAUSED do not list CANCELLED as an exit, yet admins can cancel a live auction (8.1.4, A12, A16).
  - EXTENDED does not list PAUSED as an exit.
  - ENDED → AWAITING_WINNER says "reserve met", but some auctions have no reserve.
  - "Move to Marketplace" is not a state.
  - Is a relist a new auction record?
- **Why it matters:** The state enum and allowed transitions are part of the sprint 1 data contract.
- **Proposed default:**
  - Add LIVE/EXTENDED/PAUSED → CANCELLED and EXTENDED → PAUSED.
  - REJECTED, CANCELLED, RELISTED, MOVED_TO_MARKETPLACE and COMPLETED are terminal.
  - No reserve counts as reserve met.
  - A relist creates a new auction that links to its parent.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-20
- **PRD:** 3.3, 3.5
- **Question:** Can the first bid equal the starting price, or must it be the starting price plus one increment?
- **Why it matters:** It changes bid validation and the AU-02 CTA amount.
- **Proposed default:** The first valid bid is at least the starting price.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-21
- **PRD:** 3.3 (the seller sets a "minimum bid increment band"), 3.5 (default table, admin-configurable), F1 step 5
- **Question:** Who sets the increment: the seller or the admin table? Is the band chosen from the current price before the bid? Must custom amounts be multiples of the increment?
- **Why it matters:** It is core bid validation in sprint 1.
- **Proposed default:**
  - Each auction uses one admin-approved increment table, which Ops may change at pricing review.
  - The band is chosen from the current price.
  - A custom amount can be any whole EGP amount ≥ current + increment.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-22
- **PRD:** 3.3, AU-02, AU-11, AD-02
- **Question:** Do bidders and guests see a "reserve met / not met" indicator? The PRD only shows reserve status to the seller and admins.
- **Why it matters:** It changes AU-02 and AU-03 design and bidder behaviour.
- **Proposed default:** No indicator for bidders or guests. The reserve amount and status are visible only to the seller and admins.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-23
- **PRD:** 2.3 rules 2 and 4, 3.4
- **Question:** Can a user join (lock the deposit) while the auction is SCHEDULED? Can they leave and release the lock before it starts, or during LIVE if they never bid?
- **Why it matters:** It affects the Join to Bid flow (sprint 1) and lock release rules.
- **Proposed default:** Joining is allowed from SCHEDULED. Leaving is allowed only before LIVE. Once the auction is LIVE, the lock holds until close.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-24
- **PRD:** 3.5 (auto-bid)
- **Question:**
  - (a) Does a new auto-bid place a bid straight away if the user is not leading?
  - (b) In "lower max + 1 increment", which band's increment is used?
  - (c) Is the user told when a manual bid beats their auto-bid max?
  - (d) Is "lower only above the current leading amount" strictly above?
  - (e) Is there one active auto-bid per user per auction?
  - (f) Do auto-bids stop while PAUSED?
- **Why it matters:** These are the proxy-bidding rules. A wrong rule is a fairness and legal risk.
- **Proposed default:** (a) yes, at the minimum needed; (b) the band of the amount being placed; (c) yes, with an outbid alert; (d) the new max must be > the current price; (e) yes; (f) yes, no bids are placed while paused.
- **Tag:** `BLOCKS-LATER`

#### Q-25
- **PRD:** 3.6
- **Question:** For a cap such as "30 extensions or 90 minutes", is it whichever comes first, and is the 90 minutes counted from `original_ends_at`? After the cap, are bids in the last 60 s still accepted, just without an extension? If a manual bid and the instant auto-bid reply both land in the last 60 s, is that one extension or two? How long is an admin "manual extend"?
- **Why it matters:** It affects the anti-sniping logic and the extension counter in the UI.
- **Proposed default:**
  - The cap is whichever comes first, counted from `original_ends_at`.
  - After the cap, bids are still accepted but no extension is added.
  - One extension is anchored to the last bid in the same transaction.
  - For a manual extend, the admin enters the minutes and a reason.
- **Tag:** `BLOCKS-LATER`

#### Q-26
- **PRD:** 3.2 (PAUSED), A7, F2 step 6
- **Question:** Does a manual admin pause use the same compensation as an outage (paused duration + 5 min)? Who detects a "websocket failure > 30 s" and how? Which auctions count as "affected"? Are bids and chat blocked while paused?
- **Why it matters:** It needs a server-side health monitor and a pause/resume function.
- **Proposed default:** The same rule applies to every pause. A server heartbeat monitor detects failures, and a platform-wide failure pauses all LIVE auctions. Bids and chat are blocked while paused.
- **Tag:** `BLOCKS-LATER`

#### Q-27
- **PRD:** 2.3 rule 4 vs 3.7, A9, A13, A14, F3 step 5
- **Question:** Backup bidder locks are held "max 72h after close". But the winner has 48h (plus an optional 24h extension), then rank 2 gets 24h, then rank 3 gets 24h. That can add up to 120h, and more if the reserve was not met (+24h) or a dispute pauses the timer. Which rule wins?
- **Why it matters:** It decides lock release jobs, T&C wording and user trust.
- **Proposed default:** Rank-2 and rank-3 locks are held until their place in the second-chance chain is resolved. The T&Cs state this instead of "72h".
- **Tag:** `BLOCKS-LATER`

#### Q-28
- **PRD:** 3.7 (default flow), A9, 3.2 (RESERVE_NOT_MET, SECOND_CHANCE)
- **Question:**
  - Is the second-chance offer at rank 2's highest placed bid, or at their hidden auto-bid max?
  - Are ranks counted by distinct users?
  - If rank 2 accepts and then misses their 48h, do they forfeit and get a strike like the winner?
  - If the seller accepted a below-reserve bid, does the 48h start at the seller's acceptance?
  - Does a below-reserve rank-2 offer need the seller's approval first?
- **Why it matters:** These are money and fairness rules in the post-auction flow.
- **Proposed default:**
  - The offer is at their highest placed valid bid, with ranks counted by distinct users.
  - A rank-2 user who accepts and then defaults is treated as a winner default.
  - The 48h starts at the seller's acceptance.
  - A below-reserve offer goes to the seller's decision first.
- **Tag:** `BLOCKS-LATER`

#### Q-29
- **PRD:** 3.7, F3, 1.1
- **Question:** Is the 48h window in calendar hours, even over the Egyptian weekend (Fri/Sat), public holidays and bank closures? Are times shown in Cairo time? What hours is the Post-Auction Desk staffed, given that auctions can close at any hour?
- **Why it matters:** It affects deadline jobs, reminder times, scheduling rules and the completion KPI.
- **Proposed default:** Calendar hours, with all times shown in Africa/Cairo (including DST). The scheduling calendar warns when a close puts the deadline into a weekend or holiday. Ops schedules closes within staffed hours.
- **Tag:** `BLOCKS-LATER`

#### Q-30
- **PRD:** 3.7 rule 5, 5.3 (strikes), 8.2 (shared strikes)
- **Question:** Does an auction default strike count toward the Marketplace strike ladder (2 strikes = 30-day posting ban), or is it a separate counter?
- **Why it matters:** It affects the strikes data model and the cross-section bans.
- **Proposed default:** Separate counters per policy (auction defaults vs. listing strikes). Permanent bans are shared across all sections.
- **Tag:** `BLOCKS-LATER`

#### Q-31
- **PRD:** 3.8, 2.1
- **Question:** Who is the "seller's agent" and who is the "Benben host" in chat? Neither appears in the role lists. Does slow mode apply to the host? Who answers "Ask the Seller"?
- **Why it matters:** It affects chat permissions (RLS) and the admin role list.
- **Proposed default:** The host is a new admin permission, "Auction Host". The seller's agent is the seller account or a broker with a mandate. Hosts are exempt from slow mode. The host and the seller answer Q&A.
- **Tag:** `BLOCKS-LATER`

#### Q-32
- **PRD:** 3.1, AU-02, AD-02
- **Question:** Does "bidder count" mean users who joined (locked a deposit) or users who placed a bid? Must the viewer count be exact?
- **Why it matters:** It affects the AU-01 and AU-02 headers and the cost of real-time presence at 5,000 viewers.
- **Proposed default:** The bidder count is participants with an active lock. The viewer count is approximate (rounded).
- **Tag:** `NICE-TO-KNOW`

#### Q-33
- **PRD:** 3 intro, 8.1 Configuration
- **Question:** Is the auction always exactly 24h, or can it be configured (for example, for seasonal North Coast auctions)?
- **Why it matters:** It affects the data model and scheduling.
- **Proposed default:** Fixed at 24h, but stored per auction so it can change later.
- **Tag:** `NICE-TO-KNOW`

#### Q-34
- **PRD:** A13, 8.7 (Disputes Center is Phase 3)
- **Question:** A misrepresentation dispute opened during the 48h window must pause the timer, but the Disputes Center comes in Phase 3. How is A13 handled in the MVP?
- **Why it matters:** It affects MVP scope for the post-auction flow.
- **Proposed default:** A manual dispute case in the Post-Auction Desk with a timer pause and a supervisor decision.
- **Tag:** `BLOCKS-LATER`

### D. KYC & identity

#### Q-35
- **Status:** ANSWERED 2026-11-02 (partly): KYC/OCR and liveness use a mock behind an adapter (ADR-001). The vendor choice is still open and blocks go-live.
- **PRD:** 2.2, 3.4 step 2, 8.5
- **Question:** Which KYC/OCR and liveness vendor do we use? It must support the Egyptian 14-digit National ID front/back and finish in under 3 minutes.
- **Why it matters:** Sprint 1's "Join to Bid" needs T1.
- **Proposed default:** A mock KYC adapter with deterministic pass, fail and review fixtures in the MVP sprints. The stakeholder picks the real vendor before the pilot.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-36
- **PRD:** 2.2, F4 ("T1 exceptions")
- **Question:** Is T1 approved automatically when OCR and liveness pass, with only exceptions sent to a person?
- **Why it matters:** It affects the KYC queue volume and the < 3 min target.
- **Proposed default:** Auto-approve above a configurable vendor score, with a check that the National ID's date of birth and checksum are consistent. Anything else goes to manual review.
- **Tag:** `BLOCKS-LATER`

#### Q-37
- **Status:** ANSWERED 2026-11-02: KYC T2 is in the MVP as a manual upload plus KYC Reviewer approval in the admin. No vendor.
- **PRD:** 2.2, 3.3, 3.7, 8.7
- **Question:** Phase 1 says "Auth + KYC T1". But auction sellers must be T2, winners must upload missing T2 documents within 48h, and some investment purchases need T2. Is T2 in the MVP?
- **Why it matters:** Without T2, the MVP cannot list auctions or complete wins.
- **Proposed default:** T2 is in the MVP as a manual document upload reviewed by a KYC Reviewer. No vendor.
- **Tag:** `BLOCKS-PLANNING`

#### Q-38
- **PRD:** 2.2 ("Foreign users: passport + residency")
- **Question:** Are foreign users in the MVP?
- **Why it matters:** It adds a second KYC path.
- **Proposed default:** Not in the MVP. National ID only, with the passport path later.
- **Tag:** `BLOCKS-LATER`

#### Q-39
- **PRD:** 2.1 (no bidding on own auctions, including linked accounts), A12, 8.4 (device fingerprinting)
- **Question:** Which signals define "linked accounts" in the MVP? Do we use a device-fingerprint vendor, and how do we get user consent for it?
- **Why it matters:** It decides shill-bid prevention, and fingerprinting is personal data.
- **Proposed default:** Block the seller's account and any account sharing the same National ID, phone, payment card fingerprint or device ID. Shared signals are flagged for review. No third-party fingerprint vendor in the MVP.
- **Tag:** `BLOCKS-LATER`

#### Q-40
- **Status:** ANSWERED 2026-11-02 (partly): SMS/WhatsApp use mocks behind adapters (ADR-001). The login methods, the email provider and the real SMS/WhatsApp vendors are still open.
- **PRD:** 2.2 (T0 phone OTP), 3.7 reminders, 8.3, 8.5
- **Question:** Is phone OTP the only login method, or do we also offer email, Google or Apple? Which SMS provider do we use (and which NTRA-registered sender ID), which WhatsApp Business provider, and which email provider? Note that email is not listed in 8.5.
- **Why it matters:** Auth is in sprint 1. Notifications and their costs appear in every money flow.
- **Proposed default:** Phone OTP only, through Supabase Auth, with fixed test numbers on staging. SMS, WhatsApp and email go through a mocked notification adapter until providers are chosen.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-41
- **PRD:** 8.4 (data export/delete on request) vs 8.2 (audit kept ≥ 5 years), AML
- **Question:** How do we honour a deletion request when KYC, ledger and audit records must be kept?
- **Why it matters:** It affects the privacy policy and the data model (anonymization).
- **Proposed default:** Anonymize the profile and keep KYC, financial and audit records for the legal retention period. Document this in the privacy policy.
- **Tag:** `BLOCKS-LATER`

### E. Tech & platform

#### Q-42
- **Status:** ANSWERED 2026-11-02: React 19 + Vite + Supabase (ADR-001). Bids are serialized in Postgres functions and broadcast via Supabase Realtime. The load test against PRD 8.4 runs in sprint 1 (ST-012).
- **PRD:** 8.5, 8.4, 3.5, 3.6, 3.2
- **Question:** PRD 8.5 suggests Flutter + Next.js + NestJS + PostgreSQL + Redis + BullMQ + Socket.IO. `CLAUDE.md` fixes React 19 + Vite + Supabase. Changing the stack needs a stakeholder decision in `docs/decisions/`. Which do we use?
- **What each requirement needs, and how Supabase would meet it:**

  | PRD requirement | What it needs | Supabase answer | Risk |
  |---|---|---|---|
  | Serialized bids, server timestamp decides (3.5, A5) | One writer per auction, atomic validate + insert + update leader, idempotency key | Postgres function (called through an edge function or RPC) that row-locks the auction (`SELECT … FOR UPDATE`), with a unique idempotency key and `now()` as the server timestamp | Low. Postgres is strong at this. Needs a contention test. |
  | Bid broadcast p95 < 300 ms, 5,000 viewers per auction (8.4) | Fan-out to many subscribers, mostly guests | Realtime Broadcast channel per auction, sent from the bid function. Not Postgres Changes, which scales worse. | **High.** Concurrent connection quotas and latency depend on the plan. Must be load-tested early. Fallback: a dedicated websocket fan-out service (needs an ADR). |
  | Timers: start, end, extensions, 48h deadlines, reminders (BullMQ in the PRD) | Reliable scheduled jobs with near-second precision at close | `pg_cron` + Supabase Queues (pgmq) + edge functions. Close is checked lazily at every bid (`now() > ends_at` rejects), and a sweeper job finalizes the close. | Medium. Close precision and a slow sweeper. Bids stay correct because of the lazy check. |
  | Server time authority, time sync on connect (3.6) | Server clock offset for the client | RPC that returns the server time, and `ends_at` in every event | Low |
  | Auto-pause on websocket failure > 30 s (A7) | Health monitoring of the real-time layer | Heartbeat probe job plus an admin alert. No built-in feature. | Medium |
  | Rooms per auction (Socket.IO) | Per-auction channels with read-only guests | Public read channels for guests. Chat writes go through a server function that checks the lock. | Low |
  | Redis leaderboards and locks | Fast leader and ranking | Leader stored on the `auctions` row; ranks computed in SQL | Low |
  | S3 storage for media and documents | Public media and private documents | Supabase Storage with public and private buckets plus RLS | Low |
  | Encrypted reserve and PII (8.4) | Column encryption and restricted reads | Restricted table + RLS deny + Vault-managed key (see Q-47) | Medium |
  | Native mobile (Flutter) | iOS and Android apps | Not covered by React + Vite (see Q-43) | Depends on Q-43 |
  | 99.9% availability (8.4) | Platform SLA | Depends on the Supabase plan (see Q-44) | Medium |

- **Why it matters:** Every story, the ADR and the data contract depend on it.
- **Proposed default:** Keep the `CLAUDE.md` stack and record it in ADR-001. Run a load-test spike for 5,000 viewers and a p95 < 300 ms bid broadcast as a sprint 1–2 story. If the spike fails, raise a new ADR for a dedicated fan-out service.
- **Tag:** `BLOCKS-PLANNING`

#### Q-43
- **Status:** ANSWERED 2026-11-02: a responsive, mobile-first web app and installable PWA, plus a React admin. Native apps come later (ADR-001).
- **PRD:** 1.1 (audience: "Frontend (mobile + web)"), 3.1 (bottom nav), 3.11 (haptics), 8.3 (push), 8.4 (dynamic type on mobile), 8.5 (Flutter)
- **Question:** Is the MVP a native app (App Store and Play Store), or responsive web/PWA first?
- **Why it matters:** It decides the build effort, push notifications and haptics. iOS web push works only for home-screen-installed web apps (iOS 16.4+), and iOS Safari has no vibration API, so the "outbid haptic" cannot work there. Store presence matters for marketing.
- **Proposed default:** A mobile-first responsive web app plus an installable PWA for consumers, and a web admin, all on the same React stack. SMS remains the fallback for critical alerts. Decide on native apps (wrapper or React Native) after the pilot, with an ADR.
- **Tag:** `BLOCKS-PLANNING`

#### Q-44
- **PRD:** 8.4 (availability, real-time scale)
- **Question:** Which Supabase plan and budget do we use for staging and production? Who owns the Supabase organization? Is "99.9% monthly" a contractual SLA or a target?
- **Why it matters:** DevOps needs to create the staging project in sprint 1. Realtime quotas and SLAs depend on the plan.
- **Proposed default:** Staging on a paid plan in the nearest available region, with synthetic data. Production is sized after the load test. 99.9% is treated as an engineering target.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-45
- **PRD:** 8.4, F1 step 7
- **Question:** How many LIVE auctions will run at the same time in the pilot, and what is the peak total of concurrent viewers?
- **Why it matters:** It sizes Realtime and the load test (5,000 viewers is per auction).
- **Proposed default:** Assume up to 10 LIVE auctions at once and up to 10,000 total connections in the pilot. Load-test one auction at 5,000.
- **Tag:** `BLOCKS-LATER`

#### Q-46
- **PRD:** 8.4 (WCAG 2.1 AA on web)
- **Question:** The PRD says WCAG 2.1 AA. The framework standard is WCAG 2.2 AA. Which applies?
- **Why it matters:** It sets the design system and the QA checks from sprint 1.
- **Proposed default:** WCAG 2.2 AA (a superset of 2.1 AA) for both the consumer app and the admin app.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-47
- **PRD:** 8.4 (encrypted PII and reserve prices), 3.10 (`reserve_price` encrypted)
- **Question:** Which fields count as PII to encrypt (National ID number, KYC images, income documents, phone)? Who may decrypt the reserve: the seller, Ops, Auction Control?
- **Why it matters:** It affects the data contract, RLS and the security review.
- **Proposed default:** The reserve lives in a separate table that clients cannot read, available only through server functions to the seller and Ops. The National ID number is encrypted with a Vault-managed key. KYC files go in a private bucket. The architect confirms.
- **Tag:** `BLOCKS-LATER`

#### Q-48
- **PRD:** 8.4 (localization), 3.11 (Arabic numerals toggle)
- **Question:** In the Arabic UI, are digits shown as Arabic-Indic or Latin by default? Must amount inputs accept both? Is English a full translation at launch?
- **Why it matters:** It affects the design system typography and number formatting in sprint 1.
- **Proposed default:** Latin digits by default with an Arabic-Indic toggle. Inputs accept both. Full English translation at launch.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-49
- **PRD:** 1.1 (working AR name "عقار لايف"), 3.11 (UX notes)
- **Question:** Are there brand assets (logo, colours, fonts) and a final Arabic name? Which reference products should the design follow? The PRD names none.
- **Why it matters:** The design brief and design system are made in kickoff step 4.
- **Proposed default:** The designer proposes a brand direction from scratch under the working names "Benben" and "عقار لايف", for stakeholder review. No reference products are assumed.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-50
- **PRD:** 8.5 (Google Maps), 5.2 (map radius / draw area), 6.6 (area multi-select on map)
- **Question:** Is Google Maps confirmed, and who holds the API key and budget? Is "draw area" needed in the MVP?
- **Why it matters:** It affects cost and MK-01 and MK-02 scope.
- **Proposed default:** Google Maps. The MVP has pin placement and a map/list toggle. Draw-area comes later.
- **Tag:** `BLOCKS-LATER`

#### Q-51
- **PRD:** 1.4, 8.1 (Analytics)
- **Question:** Do we use a product analytics tool for funnels and cohorts, and with what consent? Analytics is not in the Phase 1 list.
- **Why it matters:** The KPIs in 1.4 must be measurable from the pilot.
- **Proposed default:** KPIs come from database views shown on the admin Overview (AD-01). A product analytics tool comes later, with consent.
- **Tag:** `BLOCKS-LATER`

#### Q-52
- **Status:** ANSWERED 2026-11-02: start today, Mon 2026-11-02, on a full 7-day week, with sprints of 14 consecutive calendar days. Sprint 1 runs 2026-11-02 to 2026-11-15, sprint 2 runs 2026-11-16 to 2026-11-29, and so on. This replaces the proposed default below.
- **PRD:** 8.7 (Phase 1 = months 0–4)
- **Question:** What is the start date for sprint 1, the working week, and how available are stakeholders for staging validation?
- **Why it matters:** The timeline and milestones in `BACKLOG.md` need fixed dates.
- **Proposed default:** Sprint 1 runs Sun 2026-11-08 to Thu 2026-11-19, then a two-week cadence on the Sun–Thu week. The MVP is about 8 sprints. Stakeholders validate within 2 working days.
- **Tag:** `BLOCKS-PLANNING`

### F. Marketplace & trust

#### Q-53
- **Status:** ANSWERED 2026-11-02: the core Marketplace set, as proposed. In: browse with core filters, listing detail, save, report ad, an add-listing wizard with manual review, 30-day expiry, and "Send to Auction" as a request to Ops. Out: compare, boosts, map draw, masked calls, duplicate merge, price-change alerts.
- **PRD:** 8.7 ("basic Marketplace with filters & reports"), 5.1–5.6
- **Question:** Which parts of section 5 are in the MVP?
- **Why it matters:** It defines the Marketplace epic and the MVP size.
- **Proposed default:**
  - **In:** Explore with core filters (area/compound, type, price, bedrooms, size, sale type, finishing, delivery), listing detail, save, report ad, an add-listing wizard with manual review, 30-day expiry and renewal, and "Send to Auction" as a request to Ops.
  - **Out:** compare, boosts, map draw, masked calls, M1 merge, and price-change notifications.
- **Tag:** `BLOCKS-PLANNING`

#### Q-54
- **PRD:** 5.3 (prevention), 6.1 step 2, 7.2 (area medians)
- **Question:** Which automated anti-fake checks are in the MVP? Where do the area-type medians come from at launch, before we have any data?
- **Why it matters:** Perceptual hashing and stock-photo detection are AI/ML work. Price-outlier checks need reference data.
- **Proposed default:**
  - The MVP has OTP + T1, at least 5 photos, a limit of 3 listings for new accounts, a simple duplicate image hash, and manual review of every listing in the pilot.
  - Price-outlier checks run only once enough comparable listings exist.
  - Stock-photo detection comes later.
- **Tag:** `BLOCKS-LATER`

#### Q-55
- **PRD:** 5.3 ("brokers need a broker account"), 2.2 (Broker tier), 8.7 (broker app is Phase 2)
- **Question:** Can brokers post Marketplace listings in the MVP? If yes, how is the licence checked?
- **Why it matters:** It affects KYC scope and listing roles.
- **Proposed default:** Yes. A KYC Reviewer checks the broker licence and documents manually. The Reverse Marketplace stays in Phase 2.
- **Tag:** `BLOCKS-LATER`

#### Q-56
- **PRD:** 5.1 ("Request call" or in-app chat with masked numbers), 6.2 (masked calls)
- **Question:** Does the MVP need masked phone calls (a telephony vendor), or is in-app chat enough?
- **Why it matters:** It brings in a vendor and its cost.
- **Proposed default:** In-app chat with auto-masking plus a "Request call" lead form. No telephony vendor in the MVP.
- **Tag:** `BLOCKS-LATER`

#### Q-57
- **PRD:** 8.6 (one active context per property), M4, 7.5 (`sale_mode` auction)
- **Question:** M4 keeps a listing "hidden" while its auction is SCHEDULED or LIVE, and a Yield Auction links an active investment listing to an auction. Both seem to break "one active context per property".
- **Why it matters:** It affects the partial unique index in the data contract.
- **Proposed default:** "Hidden for auction" does not count as active. An investment listing may link to its own auction.
- **Tag:** `BLOCKS-LATER`

#### Q-58
- **PRD:** 5.3 (reporter trust score), 8.1.5 B (trust score ≥ 80, "Gold brokers")
- **Question:** How are user and broker trust scores and broker tiers ("Gold") calculated?
- **Why it matters:** Auto-approval and report weighting depend on them.
- **Proposed default:** No trust score in the MVP. Auto-approval is off for the Marketplace and on only for buyer requests (Phase 2).
- **Tag:** `BLOCKS-LATER`

### G. Later phases (Rentals, Requests, Investment)

#### Q-59
- **PRD:** 4.3, 8.8
- **Question:** Which law is the "new rent framework" for new leases? Who reviews the lease templates, and when?
- **Why it matters:** Rentals cannot launch without legal templates.
- **Proposed default:** Counsel reviews the templates before Phase 3 starts.
- **Tag:** `BLOCKS-LATER`

#### Q-60
- **PRD:** 4.2 step 7, 4.3, R1
- **Question:** Rent collection with payout at T+2, autopay (tokenized cards) and a segregated escrow for security deposits: which partner do we use, and is it licensed (see Q-05)?
- **Why it matters:** It shapes the Phase 3 payments architecture.
- **Proposed default:** The same gateway and escrow partner as auctions. Autopay uses the gateway's card tokenization.
- **Tag:** `BLOCKS-LATER`

#### Q-61
- **PRD:** 4.1 (I-Score, employment check, approved compound list)
- **Question:** Which vendor do we use for I-Score credit reports and for employment checks? Who maintains the luxury compound list?
- **Why it matters:** These are Luxury track integrations.
- **Proposed default:** Manual checks by a KYC Reviewer. Ops maintains the compound list in admin.
- **Tag:** `BLOCKS-LATER`

#### Q-62
- **PRD:** 6.2, 6.4 Q6, 2.2 (Broker tier)
- **Question:**
  - How is a broker licence verified?
  - How are commission shares invoiced and collected?
  - What is the buyer's closing incentive (cashback or a premium discount), and how much?
  - How large is the Q6 referral fee?
- **Why it matters:** It defines Phase 2 money flows.
- **Proposed default:** Manual licence review. Commission invoices are settled by bank transfer and confirmed by Finance. Incentive and fee amounts are configurable and left blank.
- **Tag:** `BLOCKS-LATER`

#### Q-63
- **PRD:** 6.3
- **Question:** Match score weights are given, but not how partial matches score (for example, a budget 10% over, or a neighbouring area). Is this rule-based or AI?
- **Why it matters:** It decides whether `ai-engineer` is involved and how deals are ranked.
- **Proposed default:** Rule-based linear scoring, specified by the product owner and the architect in Phase 2.
- **Tag:** `BLOCKS-LATER`

#### Q-64
- **PRD:** 7.2, 7.3, 7.1
- **Question:** What counts as "Acquisition Costs"? Where do the property tax estimate and "market rent estimate" come from? What is the admin threshold for T2 on investment purchases?
- **Why it matters:** The yield maths shown on every card depends on them.
- **Proposed default:** Acquisition costs are a configurable % of price per area and are labelled as an estimate. The threshold is configured by admins.
- **Tag:** `BLOCKS-LATER`

#### Q-65
- **PRD:** 7 intro, 7.3, I2, 8.7
- **Question:** Do Yield Auctions differ from Flash auctions (deposit tier, lease assignment documents, the I2 right to withdraw without penalty)?
- **Why it matters:** It decides whether the engine needs variants.
- **Proposed default:** Same engine, plus an investment data panel and the I2 rule.
- **Tag:** `BLOCKS-LATER`

#### Q-66
- **PRD:** 8.7 (Phase 2 "North Coast seasonal auctions")
- **Question:** What makes North Coast auctions "seasonal"? For example, only a scheduling window, or different rules?
- **Why it matters:** It affects Phase 2 scope.
- **Proposed default:** Scheduling and marketing only. Same rules.
- **Tag:** `NICE-TO-KNOW`

#### Q-67
- **PRD:** 2.1 (Developer), 8.7 (Phase 4 developer bulk auctions), 8.1.5 D
- **Question:** Can developers self-serve in the MVP?
- **Why it matters:** It affects role scope.
- **Proposed default:** No. Ops enters developer inventory on their behalf.
- **Tag:** `BLOCKS-LATER`

### H. Admin & ops

#### Q-68
- **Status:** ANSWERED 2026-11-02: the minimal ops admin set, as proposed (AD-01, AD-02/03, AD-05, AD-07, AD-09, AD-11, AD-14, AD-15, AD-16/17). Ops creates auctions on behalf of sellers with a mandate. AU-10/AU-11 move to Phase 2.
- **PRD:** 8.7, 8.1, 8.1.3, 8.1.5, 3.11 (AU-10, AU-11)
- **Question:** Phase 1 lists "Admin Control Room + Finance". Running auctions also needs the Pipeline (F1), the Post-Auction Desk (F3), KYC review (F4), listing moderation (F5) and the Approval Queue (8.1.5). The seller dashboard is Phase 2. Which admin modules are in the MVP, and how do sellers get auctions in?
- **Why it matters:** It is the largest driver of MVP size and the timeline.
- **Proposed default:**
  - The MVP has minimal versions of AD-01 Overview, AD-02/03 Control Room, AD-05 Request Review (simplified pipeline), AD-07 Post-Auction Desk, AD-09 KYC Review, AD-11 Finance, AD-14 Settings, AD-15 Admin Users & Audit, and AD-16/17 Approval Queue.
  - Ops creates auctions on behalf of sellers with a mandate (8.1.5 C).
  - AU-10 and AU-11 seller self-service move to Phase 2.
- **Tag:** `BLOCKS-PLANNING`

#### Q-69
- **PRD:** 2.1, 8.1.4, 8.1.5 H, 3.8
- **Question:** What is the final list of admin roles? Section 2.1 lists 6. Sections 8.1.4 and 8.1.5 add Ops Supervisor, Trust & Safety, Post-Auction agent, Content Reviewer, Data Entry, Publisher and Marketing, and chat needs a host.
- **Why it matters:** It defines the RBAC seed and the RLS policies.
- **Proposed default:** Roles are bundles of permissions and one person can hold several. Seed all the roles named anywhere in the PRD, plus "Auction Host".
- **Tag:** `BLOCKS-LATER`

#### Q-70
- **PRD:** 8.1.4, 8.1.5 C, C7
- **Question:** How many staff will the pilot have? Maker-checker needs, for example, two Super Admins to change settings and an Ops Supervisor to void bids.
- **Why it matters:** A small team could block itself.
- **Proposed default:** Enforce maker-checker as written, with no bypass. Seed at least two Super Admins.
- **Tag:** `BLOCKS-LATER`

#### Q-71
- **PRD:** 8.8, 3.3, F1 step 4
- **Question:** Who is the inspection and valuation partner, and who pays (the seller or Benben)? Does the partner upload directly or through Ops?
- **Why it matters:** It decides whether we need a partner portal and a fee line.
- **Proposed default:** Ops uploads the partner's report, photos and video. No partner portal in the MVP. The cost is not charged in the app.
- **Tag:** `BLOCKS-LATER`

#### Q-72
- **PRD:** F1 step 7, 3.2 (SCHEDULED at least 48h ahead)
- **Question:** What is N, the maximum number of auctions that may end in the same 30-minute window?
- **Why it matters:** It is a scheduling setting.
- **Proposed default:** N = 3, configurable.
- **Tag:** `NICE-TO-KNOW`

#### Q-73
- **PRD:** 8.1.5 C and D
- **Question:** Are single-item "Create content on behalf" and bulk Excel/CSV import in the MVP?
- **Why it matters:** Bulk import with rollback is a large epic.
- **Proposed default:** Single-item creation on behalf is in the MVP (it is needed for Q-68). Bulk import is Phase 2, except a simple areas/compounds lookup import.
- **Tag:** `BLOCKS-LATER`

#### Q-74
- **PRD:** 8.6 (areas / compounds / developers lookup), 1.1
- **Question:** Who provides the area, compound and developer lists (with geo polygons) for New Cairo and Zayed?
- **Why it matters:** Filters, auction area chips and the calendar all depend on this data.
- **Proposed default:** Ops provides a CSV before the pilot. Staging uses synthetic data based on public area names.
- **Tag:** `BLOCKS-LATER`

---

### I. Design (added by ui-ux-designer, 2026-11-02)

#### Q-75
- **PRD:** 3.11, 8.6 (areas / compounds)
- **Question:** May prototypes and the staging seed use real compound and developer names, or only synthetic ones?
- **Why it matters:** Real names in marketing-like screens can imply a partnership the company does not have.
- **Proposed default:** Assumption: synthetic names that sound local (Rayhana Heights, Zayed Dunes, Al Nakheel Residence, West Orchid, Silver Square) until Ops supplies the real lookup (Q-74).
- **Tag:** `NICE-TO-KNOW`

#### Q-76
- **PRD:** 3.1, 3.11, Q-32
- **Question:** Do guests see an approximate viewer count ("1.2K watching") as social proof, next to the verified-bidder count?
- **Why it matters:** It adds energy on AU-01/AU-02 but costs realtime presence at scale (PRD 8.4).
- **Proposed default:** Assumption: yes, rounded (Q-32), shown on AU-01 hero and AU-02 header.
- **Tag:** `NICE-TO-KNOW`

#### Q-77
- **PRD:** 3.3 (seller sets down payment % and payment terms), 3.11 (AU-02 payment terms)
- **Question:** How are seller payment terms structured: down payment % + number and frequency of instalments, or free text? Are remaining developer instalments (resale of off-plan) shown separately?
- **Why it matters:** AU-02 shows computed amounts (down payment, per-instalment) that change with the current bid.
- **Proposed default:** Assumption: structured fields (down payment %, instalment count, frequency), amounts computed from the current bid and labelled "approximate". Developer instalments as a separate line when present.
- **Tag:** `BLOCKS-LATER`

#### Q-78
- **PRD:** 8.4, brand brief (navy / gold / ivory)
- **Question:** Is the consumer app dark-first, light-first, or does it follow the system theme?
- **Why it matters:** It is the main difference between design directions A, B and C, and it sets the token set built in part 2.
- **Proposed default:** Decided with the direction choice. Designer recommendation: light-first with dark live surfaces (see `docs/design/options/OPTIONS.md`); a full dark theme later.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-79
- **PRD:** 3.11 (haptics on outbid), 8.3, ADR-001
- **Question:** Is the outbid sound on or off by default?
- **Why it matters:** Sound helps in the final minute but surprises users in public places; iOS web has no vibration, so the visual alert must stand alone.
- **Proposed default:** Assumption: vibration on where supported, sound off by default with a toggle in the live room and settings.
- **Tag:** `NICE-TO-KNOW`

#### Q-80
- **PRD:** 3.5 ("optional skip confirmation toggle per session")
- **Question:** When "skip confirmation" is on, should large jumps (+5 increments) and custom amounts still ask to confirm?
- **Why it matters:** Bids cannot be withdrawn. A mis-tap on a large amount is a money and dispute risk for first-time bidders.
- **Proposed default:** Assumption: skip applies only to +1 and +2 quick bids; +5 and custom amounts always confirm. The setting ends with the session and a chip shows it is on.
- **Tag:** `BLOCKS-SPRINT-1`

#### Q-81
- **PRD:** 3.4, 3.11 (AU-04), 3.5
- **Question:** Should AU-04 (Join to Bid) show an example cost "if you win at the next minimum bid" (bid + 2.5% premium + estimated total + down payment due in 48h) before the user has bid?
- **Why it matters:** It removes surprises after winning (design principle 4) but adds content to the sheet.
- **Proposed default:** Assumption: yes, as a short, collapsible example.
- **Tag:** `NICE-TO-KNOW`

#### Q-82
- **PRD:** 1.1 (Arabic default), 8.4
- **Question:** Which Arabic register do we use: Egyptian colloquial, modern standard, or a mix?
- **Why it matters:** It shapes every string and the legal tone of T&C and money screens.
- **Proposed default:** Assumption: simplified modern standard Arabic for money, legal and status text; light Egyptian colloquial allowed in energy moments and empty states. Final copy reviewed by a native copywriter.
- **Tag:** `BLOCKS-LATER`

#### Q-83
- **PRD:** 3.1 (5-tab bottom navigation), 8.7 (Rentals Phase 3, Requests Phase 2)
- **Question:** In Phase 1, do the Rent and Requests tabs show "coming soon", or are they hidden until their phase?
- **Why it matters:** Empty tabs look unfinished; hiding them changes the 5-tab layout and the centred Auctions tab.
- **Proposed default:** Assumption: keep 5 tabs; Rent and Requests show a "coming soon" page with a "notify me" option.
- **Tag:** `NICE-TO-KNOW`

#### Q-84
- **PRD:** 3.4 step 6, 3.7, 2.3 rule 4, Q-27
- **Question:** What exact date and time do we show a backup bidder for "held until"? The winner's 48h deadline, or the end of the whole second-chance chain?
- **Why it matters:** AU-07 for rank 2 and 3 must state a clear date; an unclear hold harms trust.
- **Proposed default:** Assumption: show the winner's deadline as "at least until", and update it when the chain moves on (Q-27 default).
- **Tag:** `BLOCKS-LATER`

---

## 3. Question count by tag

| Tag | Count | Questions |
|---|---|---|
| `BLOCKS-PLANNING` | 6 | Q-37, Q-42, Q-43, Q-52, Q-53, Q-68 |
| `BLOCKS-SPRINT-1` | 12 | Q-09, Q-19, Q-20, Q-21, Q-22, Q-23, Q-35, Q-40, Q-44, Q-46, Q-48, Q-49 |
| `BLOCKS-LATER` | 50 | All others not listed here |
| `NICE-TO-KNOW` | 6 | Q-16, Q-18, Q-32, Q-33, Q-66, Q-72 |
| **Total** | **74** | |

Design group (I) adds Q-75 to Q-84: `BLOCKS-SPRINT-1` Q-78, Q-80 · `BLOCKS-LATER` Q-77, Q-82, Q-84 · `NICE-TO-KNOW` Q-75, Q-76, Q-79, Q-81, Q-83. New total: 84.
