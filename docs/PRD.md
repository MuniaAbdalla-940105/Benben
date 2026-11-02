# Benben — Product Requirements Document (PRD) v1.0

Nov 2, 2026 · @Munia Abdalla

Benben is an auction-first real estate app for Egypt: every property can be sold in a transparent 24-hour live auction, backed by an EGP 5,000 seriousness deposit. Rentals, a classic marketplace, buyer requests and investment properties exist to feed buyers and sellers into the auction engine.

## 1. Overview & Strategy

### 1.1 Document control

| Item | Value |
| --- | --- |
| Product | Benben (working AR name: عقار لايف) |
| Version | PRD v1.0 |
| Audience | Product, UX/UI (claude design), Backend, Frontend (mobile + web), Admin Dashboard, AI coding tools |
| Markets at launch | New Cairo, Sheikh Zayed / 6th of October, North Coast (Sahel), New Administrative Capital |
| Languages | Arabic (RTL, default) + English |
| Currency | EGP only (all amounts stored as integer piasters) |

### 1.2 Problem

- Egyptian buyers cannot see real price discovery: asking prices are inflated and negotiation is opaque.
- Resale (re-sale / تنازل) sellers wait months; developers and owners want fast, fair liquidity.
- Listing portals are flooded with fake or recycled ads, so trust is low.
- Brokers chase the same leads; buyers with clear requirements are not served systematically.

### 1.3 Product vision & positioning

Benben makes the auction the hero of the app. The home screen, navigation, notifications and marketing all lead to live and upcoming auctions. The other four sections act as acquisition and conversion funnels:

| Section | Role in the auction-first strategy |
| --- | --- |
| 1. Flash 24H Auctions (CORE) | Main revenue and brand driver; price discovery in 24 hours |
| 2. Rentals (Luxury / Middle Class) | Recurring revenue and user retention; tenants become future bidders |
| 3. Marketplace | Inventory funnel: every listing shows a "Send to Auction" upsell to the seller |
| 4. Buyer Requests (Reverse Marketplace) | Demand capture: matching requests trigger auction alerts and broker deals |
| 5. Investment Properties | High-ticket inventory; eligible for "Yield Auctions" |

### 1.4 Goals & KPIs (first 12 months)

| Goal | KPI | Target (proposed) |
| --- | --- | --- |
| Auction liquidity | Sell-through rate (auctions ending in a completed sale) | ≥ 55% |
| Bidder quality | Winner completion rate within 48h | ≥ 85% |
| Engagement | Avg. verified bidders per auction | ≥ 6 |
| Price discovery | Avg. hammer price vs. starting price | ≥ +12% |
| Trust | Confirmed fake listings / total listings | < 1% |
| Revenue mix | Auction revenue share of total | ≥ 60% |

Targets are planning assumptions to validate after the pilot.

### 1.5 Scope

**In scope (v1):** the 5 sections, wallet & deposits, KYC, live chat, e-contracts, notifications, admin dashboard.

**Out of scope (v1):** mortgage origination, in-app property registration at the Real Estate Publicity Department (الشهر العقاري), crypto payments, markets outside the four launch areas.

### 1.6 Revenue model (configurable in admin)

| Stream | Default (proposed) |
| --- | --- |
| Buyer's premium on auction wins | 2.5% of hammer price |
| Seller auction listing fee | Fixed fee per auction slot + featured slot upsell |
| Forfeited seriousness deposits | 100% of EGP 5,000 to Benben on winner default |
| Rent collection fee | 1–2% per collected payment |
| Broker commission split (Reverse Marketplace) | Platform share of broker commission, e.g. 25% |
| Marketplace featured listings | Paid boosts |
| Investment listing fee | Fixed + success fee |

## 2. Users, Roles, KYC & Wallet

One account can hold several roles; permissions come from role + KYC tier + wallet state.

### 2.1 Roles & permissions

| Role | Can do | Cannot do |
| --- | --- | --- |
| Guest (not logged in) | Browse all sections, watch live auctions & read chat, see bid history (masked names) | Bid, chat, contact sellers, save searches |
| Registered User | Watchlist, reminders, saved searches, post Buyer Requests, report ads | Bid or chat in auctions |
| Verified Bidder | Bid (manual + auto), write in auction live chat | Only within auctions where a deposit is locked |
| Seller / Owner | List in Marketplace, request an auction slot, list rentals and investment properties | Bid on own auctions (blocked, incl. linked accounts) |
| Broker (licensed) | Send deals to Buyer Requests, list on behalf of owners with mandate | See buyer contact before offer acceptance |
| Developer (B2B) | Bulk inventory, branded auction events | — |
| Tenant / Landlord | Rental applications, e-contracts, rent payments | — |
| Admin roles | Ops, Auction Control, KYC Reviewer, Finance, Support, Super Admin | Each limited to its module (RBAC) |

### 2.2 KYC tiers

| Tier | Requirements | Unlocks |
| --- | --- | --- |
| T0 | Phone OTP | Registered User |
| T1 | National ID (14-digit, front/back OCR) + selfie liveness match | Bidding (with deposit), Middle Class rentals, Marketplace listing |
| T2 | T1 + proof of income/employment or company docs + address proof | Luxury rentals, Investment purchases above admin threshold, Seller auction slots |
| Broker | T1 + brokerage license / commercial registry + tax card | Reverse Marketplace offers |

Foreign users: passport + residency instead of National ID.

### 2.3 Wallet & seriousness deposit model

Every user has one EGP wallet built on a double-entry ledger. Balances are never edited directly; every movement is a ledger transaction.

| Balance bucket | Meaning |
| --- | --- |
| Available | Free to use or withdraw |
| Locked (Auction Hold) | EGP 5,000 locked per auction the user joined |
| Pending | Top-ups awaiting gateway confirmation |
| Forfeited | Moved to the Benben revenue account on default |

**Rules**

1. Top-up via payment gateway (e.g., Paymob: cards, mobile wallets, Fawry reference code). Credit only after a verified server-to-server webhook, never on client redirect.
2. Joining an auction locks EGP 5,000 from Available. One lock = one auction. To bid in 2 auctions at once, the user needs EGP 10,000.
3. A user can also pay "Join & Lock" in one step: the payment goes straight into a lock for that auction.
4. Non-winners: lock is released to Available at auction close (instant). Exception: backup bidders (rank 2 and 3) stay locked until the winner completes or defaults (max 72h after close).
5. Withdrawal to the original card/wallet: 3–5 business days; KYC name must match the payout account.
6. Default by winner: EGP 5,000 lock is forfeited to Benben (see 3.6).
7. The deposit amount is configurable per auction (default EGP 5,000). Recommendation: allow higher tiers for high-value lots (e.g., EGP 25,000 above EGP 10M) because EGP 5,000 is a weak deterrent on premium units.

## 3. Section 1 — Flash 24H Auctions (Core Product)

Each property is auctioned live for exactly 24 hours (plus anti-sniping extensions). Only Verified Bidders with an EGP 5,000 lock can bid or chat; everyone else watches.

### 3.1 Auction home (the app's spotlight)

The app opens on the Auctions tab, not on search. Home modules, top to bottom:

1. **Live Now hero carousel**: full-bleed cover, current bid, bidder count, red LIVE badge, big countdown.
2. **Ending Soon** (< 1 hour): urgent cards with pulsing timer.
3. **Starting Soon**: "Remind me" bell; push 1h and 5 min before start.
4. **Auction Calendar**: week view of scheduled auctions by area.
5. **Just Sold**: hammer price vs. starting price (social proof).
6. **For you**: auctions matching the user's Buyer Requests and saved searches.

Bottom navigation (5 tabs): **Auctions** (default, center, emphasized) · Explore (Marketplace + Investment) · Rent · Requests · Profile/Wallet.

### 3.2 Auction lifecycle

Every auction follows one state machine; the server is the only authority on state and time.

&#91;embedded content: Auction lifecycle · from review to sale or relist\]

The 48-hour window is the critical gate: a missed deadline forfeits the deposit and hands the unit to the next bidder before any relist.

| State | Entered when | Exit to |
| --- | --- | --- |
| DRAFT | Seller submits property + docs | PENDING\_REVIEW |
| PENDING\_REVIEW | Docs uploaded | APPROVED / REJECTED (with reason) |
| APPROVED | Ops verifies title, inspection, valuation; seller signs auction agreement | SCHEDULED |
| SCHEDULED | Start time set (min. 48h ahead for marketing) | LIVE / CANCELLED |
| LIVE | start\_at reached | EXTENDED / ENDED / PAUSED |
| EXTENDED | Valid bid in final 60 s | EXTENDED (again) / ENDED |
| PAUSED | Admin or system incident | LIVE (with time compensation) / CANCELLED |
| ENDED | Timer reaches 0 | AWAITING\_WINNER / RESERVE\_NOT\_MET / NO\_BIDS |
| AWAITING\_WINNER | Reserve met | COMPLETED / WINNER\_DEFAULTED |
| WINNER\_DEFAULTED | 48h passed without completion | SECOND\_CHANCE / RELISTED |
| SECOND\_CHANCE | Offer sent to next bidder | COMPLETED / WINNER\_DEFAULTED (next) / RELISTED |
| RESERVE\_NOT\_MET | Highest bid < reserve | SELLER\_DECISION (24h): accept → AWAITING\_WINNER, reject → RELISTED |
| COMPLETED | Contract signed + down payment confirmed | Terminal |

### 3.3 Pre-auction: seller & property vetting

- Seller is KYC T2 and signs an exclusive **Auction Agreement** (no parallel sale during the auction window).
- Required documents: ownership/contract chain, developer NOC or transfer approval (تنازل) for off-plan units, utilities status, latest installment statement if unpaid installments exist.
- Benben (or a partner) performs a site inspection: photos, video tour, 360° optional, condition report PDF shown to bidders.
- Seller sets: starting price, reserve price (hidden, optional), minimum bid increment band, down payment % and payment terms after win, handover date.
- Seller pays a listing fee and posts a **seller commitment** (e.g., refundable EGP 10,000 hold) forfeited if the seller withdraws after a valid win.

### 3.4 Bidder user flow

1. Guest opens an auction → watches countdown, gallery, condition report, bid history and live chat (read-only).
2. Taps **"Join to Bid"** → login/OTP if needed → KYC T1 if missing (ID OCR + selfie, target < 3 min).
3. Accepts auction T&Cs (deposit, 48h rule, forfeiture, buyer's premium) with an explicit checkbox; acceptance is logged with timestamp + IP + T&C version.
4. Pays or locks EGP 5,000 → badge **"Verified Bidder"** appears; chat input and bid buttons unlock instantly via websocket.
5. Bids manually or sets an auto-bid.
6. On close: winner screen with 48h countdown and checklist; others see "Deposit released" (or "Held as backup bidder").

### 3.5 Bidding engine

**Manual bid**

- Quick buttons: +1 increment, +2, +5, or custom amount (must be ≥ current + 1 increment).
- Confirmation sheet shows: amount, buyer's premium, estimated total. Optional "skip confirmation" toggle per session.
- Each bid request carries an idempotency key; double taps never create two bids.

**Auto-bid (proxy bidding)**

- User sets a hidden maximum. The system bids the minimum increment needed to stay on top, up to the max.
- If two auto-bids compete, the system resolves instantly to: the lower max + 1 increment (capped at the higher max). Equal maxima: the earlier auto-bid wins.
- A manual bid equal to an existing auto-bid max loses to the auto-bid (earlier commitment wins).
- User can raise the max anytime; lowering is allowed only above the current leading amount.
- Auto-bid placements count as bids for anti-sniping.

**Bid increment table (default, configurable)**

| Current bid (EGP) | Minimum increment (EGP) |
| --- | --- |
| < 1,000,000 | 10,000 |
| 1,000,000 – 4,999,999 | 25,000 |
| 5,000,000 – 9,999,999 | 50,000 |
| ≥ 10,000,000 | 100,000 |

**Concurrency rules**

- Bids are serialized per auction (Redis lock or single-writer queue). Server timestamp decides order.
- A bid is valid only if: auction is LIVE/EXTENDED, bidder holds an active lock for this auction, amount ≥ current + increment, bidder is not the current leader (no self-outbidding unless raising auto-bid), bidder not banned.
- No bid retraction. Admin can void a bid only for proven error/fraud; the auction recalculates the leader and logs the action.

### 3.6 Anti-sniping rule

- If a valid bid is accepted when ≤ 60 seconds remain, the end time becomes **bid time + 3 minutes**.
- Repeats without limit by default. Admin can set a hard cap (e.g., 30 extensions or 90 minutes) per auction.
- All clients receive `auction.extended` with the new `ends_at`; the UI shows a "+3:00 Extended" toast and an extension counter.
- Clients render countdowns from server time (time-sync on connect), never device time.

### 3.7 Winner obligations & 48-hour rule

Within 48 hours of the close, the winner must complete all of:

- [ ] Sign the reservation / sale contract (e-signature or scheduled signing at Benben office)
- [ ] Pay the down payment set by the seller (into escrow) + buyer's premium
- [ ] Upload any missing KYC T2 documents

Reminders: at close, +12h, +24h, +36h, +44h (push + SMS + WhatsApp). The EGP 5,000 lock is applied to the buyer's premium on completion.

**Default flow**

1. 48h expire without completion → state WINNER\_DEFAULTED; EGP 5,000 forfeited to Benben; user gets a strike.
2. **Second-chance offer** to rank-2 bidder at *their own* highest bid; they have 24h to accept (their lock is still held).
3. If accepted → they become winner with a fresh 48h window. If declined or expired → their lock is released (no forfeit) and the offer goes to rank 3.
4. If rank 2 and 3 decline or the next bid is below reserve → seller chooses: relist (new 24h auction) or move to Marketplace.
5. 2 defaults in 12 months → bidding suspended for 6 months.

### 3.8 Live chat

- Read: everyone (incl. guests). Write: Verified Bidders of this auction, the seller's agent and Benben host.
- Bidders appear as pseudonyms (e.g., "Bidder #7") to prevent collusion and off-platform deals.
- Auto-moderation: phone numbers, emails, links and WhatsApp handles are masked; profanity filter; slow mode (1 message / 10 s); admin mute/ban.
- Pinned host messages and an "Ask the Seller" Q&A thread; bids appear as system messages in the stream.
- Optional: scheduled live video tour (host-led) embedded above the chat.

### 3.9 Business rules for edge cases

| # | Scenario | Rule |
| --- | --- | --- |
| A1 | Deposit payment fails or is declined | No lock; show gateway reason; allow retry with another method. Nothing unlocks. |
| A2 | Payment succeeded but webhook delayed | Show "Payment pending"; poll gateway inquiry API every 15 s up to 10 min; unlock on confirmation. If confirmed after the auction ends, the money goes to Available, not a lock. |
| A3 | Double charge | Ledger dedup by gateway transaction ID; duplicate auto-refunded. |
| A4 | Chargeback on a deposit | Lock frozen, bidding suspended, Finance case opened. If chargeback occurs after a default, it is disputed with the forfeiture evidence (T&C log). |
| A5 | Two bids at the same millisecond | Serialized; first processed wins; second rejected with "Outbid, new minimum is X". |
| A6 | Bidder loses connection in final minute | Server state rules. Client reconnects and resyncs. Recommend auto-bid in UI. No compensation for client-side issues. |
| A7 | Platform outage / websocket failure > 30 s during LIVE | System auto-PAUSES all affected auctions; on resume, end time is extended by the outage duration + 5 min. |
| A8 | No bids | NO\_BIDS → seller offered relist with lower start price or move to Marketplace. |
| A9 | Reserve not met | Seller has 24h to accept highest bid; otherwise relist. Top bidder's lock is held during these 24h. |
| A10 | Winner defaults (48h) | Forfeit EGP 5,000 to Benben + second-chance flow (3.7). |
| A11 | Seller withdraws after a valid win | Seller commitment forfeited; winner's lock fully released; winner gets a goodwill credit; seller blocked from auctions. |
| A12 | Shill bidding (seller or linked accounts bid) | Device/ID/payment-method linkage detection; offending bids voided, auction may be cancelled, both accounts banned. |
| A13 | Property found misrepresented after win | Winner opens dispute within 48h window; timer pauses; if confirmed, winner's lock released + seller penalized. |
| A14 | Bidder's KYC flagged mid-auction | Bids remain but new bids blocked; if leading at close, winner status held pending KYC review (max 24h) else rank 2. |
| A15 | User wins two auctions at once | Each auction has its own lock and its own 48h obligation; no cross-netting. |
| A16 | Auction cancelled by admin | All locks released instantly; notification with reason. |

### 3.10 Database entities (Auctions)

| Entity | Key fields | Relations |
| --- | --- | --- |
| properties | id, owner\_id, type, compound\_id, area\_id, size\_m2, bedrooms, bathrooms, floor, finishing, delivery\_status, delivery\_date, payment\_plan\_json, verified\_status | 1–N media, documents; 1–1 active listing context |
| auctions | id, property\_id, seller\_id, status, start\_at, ends\_at, original\_ends\_at, starting\_price, reserve\_price (encrypted), current\_price, current\_leader\_id, deposit\_amount, increment\_table\_id, extensions\_count, max\_extensions, buyer\_premium\_pct, down\_payment\_pct | N–1 property; 1–N bids, participants, chat\_messages |
| auction\_participants | id, auction\_id, user\_id, alias, deposit\_lock\_id, status (active/winner/backup/released/forfeited), tc\_version, tc\_accepted\_at, ip | N–1 auction, user, wallet\_lock |
| bids | id, auction\_id, user\_id, amount, type (manual/auto), auto\_bid\_id, server\_ts, idempotency\_key, status (valid/voided), void\_reason | N–1 auction, participant |
| auto\_bids | id, auction\_id, user\_id, max\_amount, created\_at, active | 1–N bids |
| auction\_events | id, auction\_id, type (started, bid, extended, paused, ended, default…), payload\_json, ts | append-only audit log |
| winner\_obligations | id, auction\_id, user\_id, rank, deadline\_at, contract\_signed\_at, down\_payment\_tx\_id, status | N–1 auction |
| second\_chance\_offers | id, auction\_id, user\_id, rank, offer\_amount, expires\_at, status | N–1 auction |
| chat\_messages | id, auction\_id, sender\_id, alias, body, masked, type (user/system/host), deleted\_by | N–1 auction |
| watchlists / reminders | user\_id, auction\_id, remind\_at | N–N |
| wallets, wallet\_locks, ledger\_entries, payments | see 8.6 | shared |

### 3.11 Screens (Figma wireframe structure)

| # | Screen | Key components |
| --- | --- | --- |
| AU-01 | Auctions Home | Live hero carousel, Ending Soon rail, Starting Soon rail (Remind me), Calendar strip, Just Sold, area filter chips |
| AU-02 | Auction Detail (Live) | Sticky header: countdown + current bid + bidders count; media gallery; key specs; condition report; payment terms; bid history; chat preview; sticky bottom bar: "Join to Bid" (guest) or Bid/Auto-bid (verified) |
| AU-03 | Live Room (full-screen) | Video/hero image top, live chat center, bid ladder, quick bid buttons, extension toast, outbid alert (haptic) |
| AU-04 | Join to Bid sheet | Deposit explainer, T&C checkbox, wallet balance, payment methods, "Lock EGP 5,000" CTA |
| AU-05 | Bid confirmation sheet | Amount, premium, est. total, confirm |
| AU-06 | Auto-bid setup | Max amount input, how-it-works, edit/cancel |
| AU-07 | Auction Result | Winner: 48h countdown + checklist + contract CTA. Non-winner: released / backup status |
| AU-08 | Second-chance offer | Offer amount, 24h timer, Accept / Decline |
| AU-09 | My Auctions | Tabs: Watching · Bidding · Won · Lost; deposit status per auction |
| AU-10 | Seller: Request Auction | Property picker, docs upload, pricing (start/reserve), preferred dates, fee payment |
| AU-11 | Seller: Auction Dashboard | Live stats (viewers, bidders, bids), reserve status, post-close decision |

UX notes: color-coded timer (green > 1h, amber < 1h, red < 5 min), haptics on outbid, Arabic numerals toggle, bottom sheets over full-page forms.

## 4. Section 2 — Rentals (Luxury vs. Middle Class)

Rentals run on two tracks with different trust levels: Luxury (gated compounds only, strict verification) and Middle Class (standard apartments, fast and simple). Both share e-contracts, in-app rent payment and reminders.

### 4.1 Track comparison

| Attribute | Luxury | Middle Class |
| --- | --- | --- |
| Eligible properties | Units inside approved premium compounds only (admin-maintained compound list) | Standard residential apartments, any area |
| Tenant KYC | T2: ID + income proof (salary letter / 6-month bank statement / company docs) + employment check; optional credit report (I-Score) with consent | T1: ID + selfie |
| Guarantees | Security deposit 2–3 months + post-dated cheques or bank guarantee; compound security/gate approval | Security deposit 1 month |
| Affordability rule | Monthly rent ≤ 40% of verified monthly income (configurable) | Not enforced |
| Landlord verification | Ownership doc + compound management NOC + on-site photo verification | Ownership/utility bill + ID |
| Viewing | Booked slots with agent / concierge | Direct chat & call with owner after booking request |
| Target time to sign | ≤ 5 days | ≤ 24 hours |
| Contract | Premium e-contract template + furniture inventory annex | Standard unified e-contract |

### 4.2 User flow (tenant)

1. Choose track (Luxury / Middle Class) → search with rental filters (area, compound, budget, furnished, duration, move-in date).
2. Listing detail → "Request Viewing" (Luxury) or "Book / Contact" (Middle Class).
3. Application: KYC per track; Luxury adds income docs → Benben review (SLA 48h) → Approved / More info / Rejected.
4. Landlord accepts application → e-contract generated with agreed terms.
5. Both parties sign electronically (OTP-based signature; licensed e-signature provider for Luxury).
6. Tenant pays security deposit + first period via app → move-in inspection checklist with timestamped photos signed by both.
7. Recurring rent: autopay or manual pay; receipts in app.

### 4.3 E-contracts & payments

- Templates per track, versioned, Arabic primary with English translation; clauses: duration, rent, payment frequency (monthly / quarterly), annual increase %, deposit, maintenance responsibilities, early termination penalty, renewal terms.
- Contracts follow Egypt's new rent framework for new leases and e-signature rules; legal review of templates is required before launch (open question for counsel).
- Rent collection: Benben collects and pays out to landlord within T+2 business days, minus a collection fee.
- Security deposit held in a segregated escrow account until move-out settlement.

### 4.4 Reminders

| Trigger | Channel | Recipient |
| --- | --- | --- |
| 7 days, 3 days, due date | Push + SMS | Tenant |
| 3 and 7 days overdue | Push + SMS + WhatsApp | Tenant + landlord |
| 60 days before contract end | Push + email | Both (renew / move out) |
| 30 days before end, no decision | Push + call task for Ops | Both |

### 4.5 Business rules for edge cases

| # | Scenario | Rule |
| --- | --- | --- |
| R1 | Rent payment fails | Retry autopay after 24h and 72h; tenant notified; marked overdue after grace period (configurable, default 5 days). |
| R2 | Tenant 30+ days overdue | Landlord can trigger formal notice from template; Benben stops payouts of that month; Luxury: landlord may present guarantee cheque. |
| R3 | Dispute on deposit deductions | Compare move-in vs move-out inspection photos; parties have 7 days to agree in-app; else Benben mediation (14 days); else funds stay in escrow until court/settlement document is uploaded. |
| R4 | Maintenance dispute | Tenant opens ticket with photos; landlord SLA 72h (urgent 24h); unresolved → mediation. Rent cannot be withheld via app without a mediation outcome. |
| R5 | Landlord cancels before move-in | Full refund to tenant + landlord penalty fee; landlord strike. |
| R6 | Tenant cancels before move-in | Refund minus cancellation fee per contract (e.g., 1 week rent). |
| R7 | Listing is fake / unit not as described | Viewing report → listing suspended, landlord investigation (see 5.3). |
| R8 | Early termination | Penalty per contract; deposit settlement flow starts on move-out date. |
| R9 | Luxury applicant fails affordability | Rejected with generic reason; may re-apply with a guarantor (T2). |

### 4.6 Database entities (Rentals)

| Entity | Key fields | Relations |
| --- | --- | --- |
| rental\_listings | id, property\_id, landlord\_id, track (luxury/middle), monthly\_rent, furnished, min\_duration\_months, deposit\_months, available\_from, status | N–1 property |
| rental\_applications | id, listing\_id, tenant\_id, status, income\_verified, affordability\_ratio, review\_notes | N–1 listing, user |
| lease\_contracts | id, listing\_id, tenant\_id, landlord\_id, template\_version, start\_date, end\_date, rent\_amount, frequency, annual\_increase\_pct, deposit\_amount, status, signed\_at\_tenant, signed\_at\_landlord, pdf\_url | 1–N rent\_invoices |
| rent\_invoices | id, contract\_id, due\_date, amount, status (due/paid/overdue/waived), paid\_tx\_id | N–1 contract |
| guarantees | id, contract\_id, type (cheque/bank\_guarantee/deposit), amount, ref, status | N–1 contract |
| inspections | id, contract\_id, type (move\_in/move\_out), checklist\_json, media, signed\_by | N–1 contract |
| maintenance\_tickets / disputes | id, contract\_id, raised\_by, category, status, resolution | shared disputes table |

### 4.7 Screens

| # | Screen | Key components |
| --- | --- | --- |
| RE-01 | Rent Home | Track switch (Luxury / Middle Class), featured compounds, search |
| RE-02 | Rental Results | Filters, map/list toggle, verified badge |
| RE-03 | Rental Detail | Gallery, rent breakdown, deposit, terms, landlord badge, CTA per track |
| RE-04 | Application Wizard | Steps: KYC → income docs (Luxury) → guarantees → review |
| RE-05 | Contract Review & Sign | Clause summary, full PDF, OTP sign |
| RE-06 | My Lease | Next payment card, payment history, documents, maintenance, renew/move-out |
| RE-07 | Landlord Dashboard | Units, applications, payouts, overdue alerts |

## 5. Section 3 — Marketplace (Classic Listings)

The Marketplace is a fixed-price listing portal with precise filters and a strict anti-fake system. Every listing carries a "Sell faster: send to 24H Auction" upsell for the seller and an "Upcoming auctions like this" rail for buyers.

### 5.1 User flows

**Buyer:** Explore → filters / map → listing detail → save, share, compare (up to 3) → "Request call" or in-app chat (masked numbers) → book viewing → report if fake.

**Seller / Broker:** Add listing wizard (type → location pin → specs → price & payment → media → docs) → phone + KYC check → automated checks → manual review if flagged → published (30-day validity) → renew by confirming availability.

### 5.2 Filters (full list)

| Group | Filters |
| --- | --- |
| Location | Governorate, city, area, compound, map radius / draw area, near landmarks |
| Type | Apartment, duplex, penthouse, villa, townhouse, twin house, chalet, studio, office, retail, land |
| Price | Min/max total, price per m², down payment max, monthly installment max |
| Payment method | Cash, installments (developer / owner), installment years (1–10+), remaining installments (resale) |
| Size & layout | Area m², bedrooms, bathrooms, floor (ground / middle / top / roof), garden m², roof m² |
| Delivery | Ready to move, delivery year (2026, 2027, …), months to delivery |
| Finishing | Core & shell, semi-finished, fully finished, finished with kitchen & ACs, furnished |
| Features | Parking / garage, elevator, security, pool, gym, view (sea / lagoon / garden / street), corner unit |
| Sale type | Primary (developer), resale, تنازل (transfer of contract) |
| Trust | Verified listing only, owner (not broker) only, has documents uploaded |
| Listed | Last 24h / 7 days / 30 days |

### 5.3 Anti-fake listings system

**Prevention (before publish)**

- Phone OTP + KYC T1 for every lister; brokers need a broker account to post on behalf of owners.
- Duplicate detection: perceptual image hashing + address/specs similarity across all listings.
- Price outlier detection: flag if price/m² deviates > 30% from the area-type median.
- Watermark-removal and stock-photo detection; minimum 5 real photos.
- Listing limit for new accounts (e.g., 3 active listings in first 30 days).

**Verification badges**

| Badge | Meaning |
| --- | --- |
| Verified Owner | Ownership document checked by Benben |
| Verified Listing | Field visit or live video verification done |
| Price Verified | Price within area range or backed by valuation |

**Reports & enforcement**

- Report reasons: unit doesn't exist, already sold/rented, wrong price, wrong photos, broker posing as owner, scam / asked for money upfront, other.
- 3 independent reports in 7 days → listing auto-hidden pending review (SLA 24h).
- Strike policy: confirmed fake = 1 strike + listing removed; 2 strikes = 30-day posting ban; 3 strikes or any scam = permanent ban (ID and device blocked).
- Reporter gets an outcome notification; false/malicious reports reduce reporter trust score.
- Every 30 days lister must confirm "still available" or listing expires; 7 days of no response to buyer messages lowers ranking.

### 5.4 Business rules for edge cases

| # | Scenario | Rule |
| --- | --- | --- |
| M1 | Same unit listed by several brokers | Merge into one canonical property page with multiple offers; owner-verified listing ranks first. |
| M2 | Price changed after buyer inquiry | Price history shown on listing; inquirers notified of changes. |
| M3 | Listing sold outside Benben | Lister marks as sold; if not, buyer reports trigger expiry. |
| M4 | Seller wants to move listing to auction | One-tap conversion: listing data + media prefilled into Auction request (AU-10); listing is hidden while auction is SCHEDULED/LIVE. |
| M5 | Paid boost on a listing later proven fake | Boost fee not refunded; strike applied. |

### 5.5 Database entities (Marketplace)

| Entity | Key fields | Relations |
| --- | --- | --- |
| listings | id, property\_id, lister\_id, lister\_type (owner/broker/developer), sale\_type, price, price\_per\_m2, payment\_method, down\_payment, installment\_years, monthly\_installment, status, verified\_flags, expires\_at, boost\_until | N–1 property, user |
| listing\_price\_history | listing\_id, old\_price, new\_price, changed\_at | N–1 listing |
| reports | id, target\_type (listing/user/auction), target\_id, reporter\_id, reason, details, media, status, outcome | polymorphic |
| strikes | id, user\_id, reason, source\_report\_id, expires\_at | N–1 user |
| media\_hashes | media\_id, phash | duplicate detection |
| saved\_searches / favorites | user\_id, filters\_json / listing\_id, notify | N–1 user |

### 5.6 Screens

| # | Screen | Key components |
| --- | --- | --- |
| MK-01 | Explore | Search bar, quick filter chips, map/list toggle, "Upcoming auctions like this" rail |
| MK-02 | Filters sheet | Grouped filters (5.2), live result count, save search |
| MK-03 | Listing Detail | Gallery, badges, price + payment plan breakdown, specs grid, location, price history, similar, Report button, sticky contact bar |
| MK-04 | Compare | Side-by-side up to 3 units |
| MK-05 | Add Listing Wizard | 6 steps with progress bar, draft autosave |
| MK-06 | Report Ad | Reason list, details, evidence upload |
| MK-07 | My Listings | Status, views, leads, renew, boost, "Send to Auction" |

## 6. Section 4 — Buyer Requests (Reverse Marketplace)

Buyers post what they want; only licensed brokers active in that area receive the request and send matching deals. Benben keeps buyer contact masked until the buyer accepts a deal, which protects its commission share.

### 6.1 User flow

1. Buyer creates request: purpose (buy / rent / invest), type, areas (up to 3), budget (cash amount and/or max down payment + max monthly installment), bedrooms, size range, finishing, delivery timing, notes. Example: "3-bed apartment in New Cairo, EGP 2M cash down, rest in installments".
2. Request goes through a quality check (phone verified, budget realistic vs. area median) → published for 30 days.
3. System instantly matches existing listings and **upcoming auctions** and shows them to the buyer ("12 units match now, 2 auctions this week").
4. Brokers subscribed to those areas get a push with the anonymized request.
5. Broker sends a **Deal**: must link a listing (existing or new) + price + payment plan + short pitch. Max 3 deals per broker per request; max 15 deals per request in total.
6. Buyer sees a deals inbox sorted by match score → shortlists → accepts one or more → contact unlocked + viewing scheduling.
7. Deal progresses: Viewing → Negotiation → Reservation → Closed (Won) / Lost. Broker updates status; buyer confirms closing.
8. On close, the broker's commission invoice is issued by Benben and the split is settled.

### 6.2 Commission protection logic

- Brokers sign a digital **Commission Split Agreement** at onboarding (e.g., Benben takes 25% of the broker commission on deals originated from Benben requests; configurable per broker tier).
- Every accepted deal creates a `deal_lead` record with a 180-day attribution window: if the same buyer buys the same unit (or any unit from that broker in that compound) within 180 days, the deal is attributed to Benben.
- Buyer confirms closing price in app (incentive: cashback voucher or reduced auction buyer's premium); mismatch with broker report triggers audit.
- Contact details are masked in chat; calls run through a masked number with call logs.
- Circumvention (confirmed) → broker charged the commission share + penalty + suspension.

### 6.3 Match score (0–100)

Weighted on: area match (30), budget/payment fit (25), type & bedrooms (15), size (10), delivery timing (10), finishing (5), listing verification level (5). Deals below 50 are hidden by default.

### 6.4 Business rules for edge cases

| # | Scenario | Rule |
| --- | --- | --- |
| Q1 | No broker responds within 72h | Ops team gets the request; buyer notified with marketplace and auction matches. |
| Q2 | Broker spams irrelevant deals | Buyer flags "not relevant"; 5 flags in 30 days → broker loses request access for 14 days. |
| Q3 | Buyer and broker close off-platform | Attribution window + audit; broker penalty (6.2). |
| Q4 | Two brokers offer the same unit | First accepted deal holds attribution; others see "unit already offered". |
| Q5 | Commission dispute (broker vs. Benben) | Evidence: deal logs, chats, call logs, buyer confirmation; finance decision within 14 days; escalation per agreement. |
| Q6 | Buyer's request matches an auction | Buyer gets "Join to Bid" CTA; if the buyer wins, the referring broker (if any) gets a referral fee instead of a commission. |

### 6.5 Database entities (Requests)

| Entity | Key fields | Relations |
| --- | --- | --- |
| buyer\_requests | id, buyer\_id, purpose, property\_types\[\], area\_ids\[\], budget\_cash, max\_down\_payment, max\_monthly, bedrooms\_min, size\_min, size\_max, finishing\[\], delivery\_by, notes, status, expires\_at | 1–N deals |
| brokers | id, user\_id, license\_no, company, coverage\_area\_ids\[\], tier, rating, split\_agreement\_version | 1–N deals |
| deals | id, request\_id, broker\_id, listing\_id, offered\_price, payment\_plan\_json, pitch, match\_score, status | N–1 request, broker, listing |
| deal\_leads | id, deal\_id, buyer\_id, broker\_id, attribution\_expires\_at, closed\_price, commission\_amount, platform\_share, status | 1–1 deal |
| commission\_invoices | id, deal\_lead\_id, amount, due\_date, status | N–1 deal\_lead |

### 6.6 Screens

| # | Screen | Key components |
| --- | --- | --- |
| RQ-01 | Create Request | Stepper form, budget sliders, area multi-select on map |
| RQ-02 | My Requests | Status, deals count, instant matches |
| RQ-03 | Deals Inbox | Deal cards with match score, price, payment plan, broker rating; Accept / Decline |
| RQ-04 | Deal Room | Masked chat, viewing scheduler, status timeline |
| RQ-05 | Broker Feed | New requests in my areas, filters, "Send Deal" |
| RQ-06 | Broker Pipeline | Kanban: Sent → Accepted → Viewing → Negotiation → Closed |

## 7. Section 5 — Investment Properties (Already Tenanted)

Investors buy units that already have a tenant and a running lease, so income starts on day one. Every listing shows verified rent, lease expiry and computed yields; eligible units can also be sold through a "Yield Auction" in Section 1.

### 7.1 Required data per listing

| Field | Source / verification |
| --- | --- |
| Asking price | Seller |
| Current monthly rent | Lease copy + last 3 months of payment proof (bank transfer or receipts) |
| Lease start / end date | Lease copy |
| Annual rent increase % | Lease clause |
| Security deposit held & transfer terms | Lease + seller declaration |
| Tenant type | Individual / company (no personal tenant data shown) |
| Payment history | Months paid on time / late (from proof) |
| Annual costs | Maintenance/service charges, management fee, property tax estimate |
| Lease assignment | Tenant notified / consent obtained for transfer to new owner (document) |

### 7.2 ROI calculations (shown on every card)

```latex
\text{Gross Yield} = \frac{\text{Annual Rent}}{\text{Price}} \times 100
```

```latex
\text{Net Yield} = \frac{\text{Annual Rent} - \text{Annual Costs}}{\text{Price} + \text{Acquisition Costs}} \times 100
```

```latex
\text{Payback (years)} = \frac{\text{Price} + \text{Acquisition Costs}}{\text{Annual Rent} - \text{Annual Costs}}
```

- Rent projection to lease end using the annual increase %; after lease end, show "market rent estimate" (area median) clearly labeled as an estimate.
- **Income Simulator** on the detail page: investor changes price offer, costs, vacancy months after expiry → yields recalculate live.
- Disclaimer: projections are not guaranteed returns.

### 7.3 User flow (investor)

1. Invest tab → cards sorted by net yield; filters: min yield, lease months remaining, area, type, price.
2. Detail → yield breakdown, lease timeline, documents (redacted lease, payment proofs), simulator.
3. KYC T2 required above admin threshold → "Make Offer" (fixed price) or "Join Yield Auction".
4. On agreement → sale contract + lease assignment annex → Benben coordinates notification to tenant → rent redirected to new owner (optionally via Benben rent collection, Section 2).

### 7.4 Business rules for edge cases

| # | Scenario | Rule |
| --- | --- | --- |
| I1 | Rent proof does not match declared rent | Listing blocked until corrected; repeated mismatch = strike. |
| I2 | Tenant stops paying during the sale process | Seller must disclose within 48h; buyer may withdraw without penalty (auction lock released). |
| I3 | Tenant leaves before closing | Listing reclassified as non-tenanted; buyer can withdraw or renegotiate. |
| I4 | Lease ends < 6 months after purchase | Badge "Short lease"; simulator defaults to 2 vacancy months. |
| I5 | Tenant refuses new owner | Lease remains binding per contract; Benben provides notice templates; dispute goes to mediation/legal. |
| I6 | Security deposit transfer | Seller transfers held deposit to buyer at closing (escrow), shown in closing statement. |

### 7.5 Database entities (Investment)

| Entity | Key fields | Relations |
| --- | --- | --- |
| investment\_listings | id, property\_id, seller\_id, asking\_price, monthly\_rent, lease\_start, lease\_end, annual\_increase\_pct, deposit\_held, annual\_costs, gross\_yield, net\_yield, payback\_years, verification\_status, sale\_mode (fixed/auction) | N–1 property; optional 1–1 auction |
| lease\_snapshots | id, investment\_listing\_id, lease\_doc\_url (redacted), tenant\_type, payment\_history\_json | 1–1 listing |
| offers | id, listing\_id, investor\_id, amount, status, expires\_at | N–1 listing |

### 7.6 Screens

| # | Screen | Key components |
| --- | --- | --- |
| IN-01 | Invest Home | Yield leaderboard, "Yield Auctions" rail, filters |
| IN-02 | Investment Detail | Yield KPIs (gross, net, payback), lease timeline, docs, simulator, Offer / Join Auction |
| IN-03 | Income Simulator | Inputs + live recalculated outputs |
| IN-04 | My Portfolio | Owned units, monthly income, lease expiries |

## 8. Platform: Admin Dashboard, Shared Rules & Tech

### 8.1 Admin dashboard modules

| Module | Main functions |
| --- | --- |
| Auction Control Room (priority) | Live grid of all LIVE auctions: viewers, bidders, bids/min, time left, reserve status; actions: pause/resume, extend, void bid (with reason), mute/ban chat user, cancel auction; incident banner |
| Auction Pipeline | Review queue (docs, inspection, valuation), scheduling calendar, homepage spotlight slots, seller agreements |
| Post-Auction Desk | Winner 48h tracker, contract & down payment status, defaults, second-chance offers, relist decisions |
| KYC & Compliance | Review queue (T1 exceptions, T2, brokers), linked-account graph, AML flags, sanctions/PEP screening |
| Finance & Wallet | Ledger explorer, locks, releases, forfeitures, refunds, payouts, gateway reconciliation (daily), commission invoices, VAT reports |
| Listings & Trust | Moderation queue, reports, strikes, duplicates, price outliers |
| Rentals Ops | Applications, contracts, overdue rent, disputes, inspections |
| Requests & Brokers | Broker onboarding, coverage, deal pipeline, attribution audits |
| Disputes Center | One queue for all disputes with SLA timers and evidence timeline |
| CMS & Marketing | Home rails, banners, push campaigns, promo codes |
| Configuration | Deposit amount, increments, anti-sniping window/extension/cap, 48h window, fees %, strike policy, affordability ratio |
| Analytics | KPIs from 1.4, auction funnel (views → joins → bidders → wins → completions), revenue, cohort retention |
| Admin users & audit | RBAC roles, 2FA mandatory, every admin action logged (who, what, before/after) |

### 8.1.1 Admin navigation (sidebar)

Overview · **Auctions** (Control Room, Pipeline, Post-Auction Desk, Calendar) · Users & KYC · Listings & Trust · Rentals · Requests & Brokers · Investment · Finance · Disputes · CMS & Marketing · Analytics · Settings · Admin Users & Audit. A global search bar finds any user, property, auction, payment or dispute by ID, phone or name.

### 8.1.2 Admin user flows

**F1 — Auction approval (Ops)**

1. Seller submits auction request → appears in Pipeline › New with SLA timer (48h).
2. Ops checks seller KYC T2 → if missing, sends "Request info" (status: Waiting seller).
3. Ops reviews documents one by one (Approve / Reject with reason per document).
4. Ops assigns inspection + valuation partner and a visit date → partner uploads report, photos, video.
5. Ops reviews pricing: starting price, reserve vs. valuation (warning if reserve > valuation +15%), deposit tier, increment table.
6. Seller signs Auction Agreement + pays listing fee and seller commitment → status APPROVED.
7. Ops picks a slot in the Auction Calendar (system blocks overlap of > N auctions ending in the same 30 min) → SCHEDULED.
8. Marketing optionally assigns a Home spotlight slot and schedules push campaign.

**F2 — Live monitoring & incidents (Auction Control)**

1. Control Room shows all LIVE auctions with health indicators (green / amber / red).
2. Alerts fire on: bid spike from linked accounts, websocket error rate > 2%, chat abuse, gateway down.
3. Operator opens the auction → live bid stream, chat, participants, event log.
4. Actions: mute/ban chatter · freeze a bidder · void a bid · pause/resume · manual extend · cancel.
5. Sensitive actions require a reason and a second approver (maker-checker, see 8.1.4).
6. On resume, system adds the paused duration + 5 min automatically and notifies all participants.

**F3 — Post-auction desk (48h)**

1. Each ended auction appears with the winner, hammer price and a 48h countdown.
2. Agent calls the winner, schedules signing, tracks checklist (contract / down payment / KYC T2).
3. Down payment is confirmed automatically by webhook; contract marked signed by e-signature callback or manually with uploaded scan.
4. All done → COMPLETED, deposit applied to buyer's premium, seller payout scheduled.
5. Deadline passes → system auto-defaults; agent reviews and can grant **one** extension of up to 24h with reason + supervisor approval (e.g., bank transfer in progress).
6. Second-chance offers are sent automatically; agent sees accept/decline status live.
7. All offers fail → agent records seller decision (relist / move to Marketplace).

**F4 — KYC review**

Queue sorted by SLA → open case → side-by-side ID images, OCR data, selfie, liveness score, linked accounts → Approve / Reject (reason) / Request re-upload → user notified.

**F5 — Reports & moderation**

Report queue → open listing with all reports, duplicate matches and price check → Dismiss / Hide / Remove + strike / Ban user → reporter and lister notified.

**F6 — Finance**

Daily reconciliation screen (gateway vs. ledger, mismatches highlighted) → withdrawals queue (name match check, approve batch) → refunds → forfeiture log → commission invoices → exports for accounting.

**F7 — Disputes**

Dispute queue → case page (timeline, evidence from both parties, related money in escrow) → request evidence → propose resolution → both parties accept in app → funds released per decision, or escalated to legal.

### 8.1.3 Admin screens (wireframe structure)

| # | Screen | Key components |
| --- | --- | --- |
| AD-01 | Overview | KPI cards (live auctions, bidders now, today's GMV, deposits locked, pending KYC, open disputes), alerts feed, today's auction timeline |
| AD-02 | Auction Control Room | Grid of live auctions (time left, current bid vs reserve, bidders, bids/min, health), alerts panel, filters by area/status |
| AD-03 | Live Auction Detail (admin) | Bid stream, chat with moderation tools, participants table (alias ↔ real user), event log, action bar (pause, extend, void, cancel) |
| AD-04 | Auction Pipeline | Kanban: New → Docs review → Inspection → Pricing → Agreement → Scheduled; SLA badges |
| AD-05 | Auction Request Review | Property data, document checklist with per-doc decision, inspection report, valuation vs pricing, approve/reject |
| AD-06 | Auction Calendar | Week/day view, drag to reschedule, overlap warnings, spotlight slots |
| AD-07 | Post-Auction Desk | Table of ended auctions: winner, 48h countdown, checklist progress, call log, extend/default actions, second-chance status |
| AD-08 | User 360 | Profile, KYC, roles, wallet & locks, auctions, listings, leases, reports, strikes, linked accounts, notes |
| AD-09 | KYC Review | Document viewer, OCR fields, selfie match, decision panel |
| AD-10 | Listings Moderation | Queue, duplicate comparison view, price outlier chart, actions |
| AD-11 | Finance: Ledger & Reconciliation | Ledger explorer, mismatch list, withdrawals & refunds queues, forfeitures, exports |
| AD-12 | Disputes Center | Queue with SLA, case timeline, evidence, resolution form |
| AD-13 | CMS | Home rails order, banners, push campaign builder |
| AD-14 | Settings | All configurable rules (deposit, increments, anti-sniping, windows, fees, strike policy) with version history |
| AD-15 | Admin Users & Audit | Roles, permissions, 2FA status, audit log search |

### 8.1.4 Admin roles & approval rules

| Action | Allowed roles | Second approver required |
| --- | --- | --- |
| Approve / schedule auction | Ops | No |
| Pause / resume / extend live auction | Auction Control | No (logged) |
| Void a bid | Auction Control | Yes — Ops Supervisor |
| Cancel a live auction | Ops Supervisor | Yes — Super Admin |
| Grant 24h winner extension | Post-Auction agent | Yes — Ops Supervisor |
| Reverse a deposit forfeiture | Finance | Yes — Super Admin |
| Approve withdrawals batch | Finance | Yes above daily threshold |
| Ban user permanently | Trust & Safety | Yes — Ops Supervisor |
| Change settings (fees, deposit, rules) | Super Admin | Yes — second Super Admin; takes effect for new auctions only |

All admin actions are written to `audit_logs` with before/after values and the reason text.

### 8.1.5 Content submission, approval & operations data entry

Any customer can submit content to any of the 5 sections from the app; nothing goes public until it passes the approval queue in the dashboard. Operations can also add content themselves, one item at a time or in bulk from Excel/CSV.

**A. Customer submission from the app**

A single **"+ Add"** button (in the Profile tab, as a floating button on each section's home, and as a "Sell / List your property" banner) opens a chooser:

| Submission type | Section | Minimum KYC | Extra requirements |
| --- | --- | --- | --- |
| Auction request | 1. Auctions | T2 | Ownership docs, agreement, listing fee (see 3.3) |
| Property for sale | 3. Marketplace | T1 | Min. 5 photos, price, payment plan |
| Rental — Middle Class | 2. Rentals | T1 | Ownership/utility bill |
| Rental — Luxury | 2. Rentals | T2 | Compound NOC, on-site verification |
| Tenanted investment property | 5. Investment | T2 | Lease copy + 3 months rent proof |
| Buyer request | 4. Requests | T0 (phone OTP) | — |

Flow:

1. Choose type → shared **Property wizard** (type, location pin, compound, specs, finishing, delivery, media) → section-specific step (price & payment / rent terms / lease data / auction pricing).
2. Documents step (only where required) → preview exactly as buyers will see it.
3. Submit → status **Submitted**; user sees expected review time (SLA) and can track it in **My Submissions**.
4. Reviewer decision arrives by push: Approved & published, Changes requested (with field-level comments), or Rejected (with reason).
5. Changes requested → user edits only flagged fields → resubmits (keeps place in queue with priority).
6. Drafts autosave; a draft older than 30 days is deleted after a reminder.

**Submission statuses**

| Status | Meaning | Visible to public |
| --- | --- | --- |
| Draft | Saved, not submitted | No |
| Submitted | Waiting in queue | No |
| In review | Assigned to a reviewer | No |
| Changes requested | Waiting for the customer | No |
| Approved | Passed review; published immediately or at scheduled time (auctions: SCHEDULED) | Yes / at start time |
| Rejected | Final; reason shown; may submit a new version | No |
| Withdrawn | Cancelled by the customer before publishing | No |
| Expired / Archived | Validity ended or sold/rented | No (owner sees history) |

**Editing published content:** cosmetic fields (description, extra photos order) update instantly; sensitive fields (price, main photos, documents, location, lease data, auction terms) create a new version that goes to review while the current approved version stays live. Auction terms cannot be edited once SCHEDULED except by Ops.

**B. Approval queue in the dashboard**

1. One **Approval Queue** for all sections with tabs per type and filters (area, submitter type: owner/broker/developer, SLA, risk score).
2. Each item shows automatic checks before a human opens it: KYC status, duplicate match, price outlier, image quality / stock photo, banned words or phone numbers in text, submitter trust score and strikes.
3. Reviewer opens the item → side-by-side view (submitted data | app preview | documents) → comments on specific fields.
4. Decision: **Approve**, **Request changes** (field comments), **Reject** (reason code + note), or **Escalate** (to supervisor / legal).
5. Bulk approve is allowed only for low-risk items where every automatic check is green.
6. Every decision is logged and the customer is notified automatically.

**Review SLAs (default, configurable):** Buyer request 2h · Marketplace 24h · Middle Class rental 24h · Luxury rental 48h · Investment 48h · Auction request 48h (plus inspection).

**Auto-approve rules (configurable, off by default except buyer requests):** buyer requests from verified phones with no strikes; Marketplace listings from Verified Owners or Gold brokers with trust score ≥ 80 and all checks green (sampled 10% for post-review). Auctions, Luxury rentals and Investment properties are **never** auto-approved.

**Rejection reason codes:** incomplete data · poor/fake photos · duplicate listing · unrealistic price · missing/invalid documents · ownership not proven · contact info in text · prohibited content · other.

**C. Operations data entry — single item**

- Same forms as the app inside the dashboard (**Create content**), with extra admin-only fields: owner/lister account, source, internal notes, verified badges.
- Two modes: **On behalf of a customer** (search or create the owner account; upload signed mandate/authorization; owner gets an SMS to confirm within 72h) or **Benben inventory** (developer or company-owned stock).
- Content created by Ops goes to the Approval Queue and must be approved by a different person (maker-checker). Users with the **Publisher** permission can publish Marketplace and Buyer Request content directly; auctions always need approval.

**D. Operations data entry — bulk import**

1. Ops chooses import type (Marketplace sale, Rentals, Investment, Auction drafts, Compounds/areas lookup, Developer inventory, Brokers).
2. Downloads the Excel/CSV template for that type (Arabic + English headers, dropdown lists, example row, required fields marked).
3. Uploads the file (max 5,000 rows) + optional ZIP of images (one folder per `row_ref`) or image URLs in the sheet.
4. System validates in the background and shows a **preview**: valid rows, rows with errors (cell-level messages), possible duplicates of existing properties.
5. Ops fixes in the file and re-uploads, or chooses: import valid rows only / skip duplicates / merge duplicates.
6. Import target: **as Drafts**, **to Approval Queue**, or **Publish directly** (Publisher permission only; never for auctions).
7. Job runs asynchronously with a progress bar; a downloadable report lists created IDs and failed rows.
8. An import job can be **rolled back** within 24h if nothing from it has received leads or bids.

Bulk actions on existing content: bulk update price/status/badges from a sheet keyed by listing ID, bulk archive, bulk assign to reviewer.

**E. Business rules for edge cases**

| # | Scenario | Rule |
| --- | --- | --- |
| C1 | Customer edits while item is In review | Edit is blocked; customer can withdraw and resubmit. |
| C2 | Rejected 3 times for the same property | Further submissions of that property need Ops contact; account flagged. |
| C3 | Owner denies a listing created on their behalf | Listing removed immediately; the creating staff and mandate are reviewed. |
| C4 | Bulk file uses wrong or old template version | Whole file rejected before processing with a link to the current template. |
| C5 | Import partially fails (e.g., image download errors) | Rows without required media are imported as Drafts and listed in the report. |
| C6 | Imported row duplicates a customer's live listing | Not created; shown as conflict for manual merge. |
| C7 | Reviewer approves own submission or import | Blocked by system (maker-checker). |
| C8 | SLA breached | Item escalates to supervisor and moves to top of queue; customer gets a "taking longer" notice. |

**F. Database additions**

| Entity | Key fields | Relations |
| --- | --- | --- |
| content\_submissions | id, entity\_type (auction/listing/rental/investment/request), entity\_id, version\_no, data\_snapshot\_json, status, source (app/admin/bulk), submitted\_by, on\_behalf\_of, mandate\_doc\_id, risk\_score, auto\_checks\_json, sla\_due\_at, assigned\_to, decided\_by, decision, reason\_code, decided\_at | N–1 user; polymorphic to content entity |
| submission\_comments | id, submission\_id, field\_key, comment, author\_id, resolved | N–1 submission |
| import\_jobs | id, import\_type, template\_version, file\_url, media\_zip\_url, uploaded\_by, target (draft/queue/publish), total\_rows, valid\_rows, failed\_rows, status, report\_url, rolled\_back\_at | 1–N import\_rows |
| import\_rows | id, job\_id, row\_ref, payload\_json, errors\_json, result (created/skipped/failed/duplicate), created\_entity\_id | N–1 import\_job |

All content tables (`listings`, `rental_listings`, `investment_listings`, `auctions`, `buyer_requests`) gain: `source`, `created_by`, `on_behalf_of`, `current_version`, `approved_version`.

**G. Screens**

| # | Screen | Key components |
| --- | --- | --- |
| AP-01 (app) | "+ Add" chooser | 6 type cards with requirement hints and KYC lock badges |
| AP-02 (app) | Submission wizard | Stepper, autosave, document upload, live preview |
| AP-03 (app) | My Submissions | Tabs by status, SLA countdown, reviewer comments, edit / withdraw / resubmit |
| AD-16 | Approval Queue | Type tabs, filters, SLA and risk badges, bulk select (green only), assign |
| AD-17 | Review Detail | Data / preview / documents panes, auto-check results, field comments, decision bar |
| AD-18 | Create Content | Mode switch (on behalf / Benben inventory), owner search, mandate upload, same section forms |
| AD-19 | Bulk Import Wizard | Type → template download → upload → validation preview → options → run |
| AD-20 | Import Jobs | History, progress, reports, rollback |

**H. Role additions**

| Action | Allowed roles | Second approver required |
| --- | --- | --- |
| Review & approve customer submissions | Content Reviewer | No (cannot review own items) |
| Create content single / bulk | Data Entry, Ops | Yes — approval by another reviewer |
| Publish directly (Marketplace, Requests) | Publisher | No |
| Roll back an import job | Ops Supervisor | No (logged) |

### 8.2 Cross-cutting business rules

- **Server authority:** time, auction state, balances and prices come only from the server.
- **Money:** integer piasters, double-entry ledger, every write idempotent, daily reconciliation with the gateway; no negative balances.
- **Payment webhooks:** signed (HMAC) and verified; state changes only from webhooks or inquiry API.
- **Audit:** append-only event logs for auctions, wallet, KYC, admin actions; retained ≥ 5 years.
- **Disputes:** unified flow Open → Evidence (72h) → Mediation (≤ 14 days) → Resolved / Escalated (legal). Money involved stays in escrow until resolved.
- **Strikes & bans:** shared across all sections (a scammer in Marketplace cannot bid in Auctions).
- **Consent:** T&C versions per feature; acceptance stored with timestamp, IP, device.

### 8.3 Notifications matrix (key events)

| Event | Push | SMS | WhatsApp | Email |
| --- | --- | --- | --- | --- |
| Auction starting (1h / 5 min) | Yes | — | — | — |
| Outbid | Yes (instant, haptic in app) | Last 10 min only | — | — |
| Auction extended | In-app only | — | — | — |
| You won / 48h reminders | Yes | Yes | Yes | Yes |
| Deposit locked / released / forfeited | Yes | Yes | — | Yes |
| Second-chance offer | Yes | Yes | Yes | Yes |
| Rent due / overdue | Yes | Yes | Overdue only | — |
| New deal on your request | Yes | — | — | Digest |
| Listing reported / removed | Yes | — | — | Yes |

### 8.4 Non-functional requirements

| Area | Requirement |
| --- | --- |
| Real-time | WebSockets; bid accepted → broadcast to all viewers p95 < 300 ms; 5,000 concurrent viewers per auction |
| Availability | 99.9% monthly; auto-pause on incident (A7) |
| Security | OWASP ASVS L2, TLS 1.2+, encrypted PII and reserve prices at rest, rate limiting on bids/chat, device fingerprinting |
| Privacy | Compliance with Egypt Personal Data Protection Law No. 151/2020; consent for credit checks; data export/delete on request |
| Localization | Arabic RTL first, English; Arabic-Indic / Latin digits toggle; EGP formatting |
| Accessibility | WCAG 2.1 AA on web; dynamic type on mobile |
| Performance | Home first paint < 2 s on 4G; images via CDN with WebP/AVIF |

### 8.5 Suggested tech stack (for AI coding tools)

- **Mobile:** Flutter (single codebase iOS/Android, strong RTL).
- **Web + Admin:** Next.js (React) + TypeScript; admin with a component library (e.g., Ant Design / shadcn).
- **Backend:** NestJS (Node/TypeScript), modular monolith: auth, kyc, wallet, auctions, chat, listings, rentals, requests, investment, notifications, admin.
- **Data:** PostgreSQL (primary), Redis (bid locks, timers, pub/sub, leaderboards), BullMQ (scheduled jobs: auction start/end, 48h deadlines, reminders), S3-compatible storage for media/docs.
- **Realtime:** Socket.IO with Redis adapter; rooms per auction.
- **Integrations:** Payment gateway (e.g., Paymob), SMS/WhatsApp provider, KYC/OCR + liveness vendor, licensed e-signature provider, maps (Google Maps), push (FCM/APNs).

### 8.6 Shared core entities

| Entity | Key fields | Relations |
| --- | --- | --- |
| users | id, phone, email, name\_ar, name\_en, kyc\_tier, roles\[\], trust\_score, status, banned\_until | 1–1 wallet, 1–N kyc\_documents |
| kyc\_documents | id, user\_id, type, file\_url, ocr\_json, liveness\_score, status, reviewer\_id | N–1 user |
| wallets | id, user\_id, available, locked, pending (derived from ledger, cached) | 1–N wallet\_locks, ledger\_entries |
| wallet\_locks | id, wallet\_id, purpose (auction/rental\_deposit), ref\_type, ref\_id, amount, status (active/released/forfeited/applied) | N–1 wallet |
| ledger\_entries | id, txn\_id, account\_id, debit, credit, currency, created\_at | double-entry pairs |
| payments | id, user\_id, gateway, gateway\_txn\_id (unique), amount, status, raw\_webhook, idempotency\_key | 1–N ledger\_entries |
| areas / compounds / developers | id, names, geo polygon, tier (luxury flag on compounds) | lookup |
| media / documents | id, owner\_type, owner\_id, url, type, phash, visibility | polymorphic |
| disputes | id, type, ref\_type, ref\_id, opened\_by, against, status, sla\_due\_at, resolution, amount\_in\_escrow | polymorphic |
| notifications | id, user\_id, event, channel, payload, sent\_at, read\_at | N–1 user |
| audit\_logs | id, actor\_id, actor\_type, action, entity, entity\_id, before\_json, after\_json, ts | append-only |

**Key relations:** a `property` is the hub — it can have one active `auction` OR one active `listing` / `rental_listing` / `investment_listing` at a time (enforced by a partial unique index on active status). `users` connect to everything through roles; all money flows through `payments` → `ledger_entries` → `wallet_locks`.

### 8.7 Release roadmap (auction-first)

1. **Phase 1 — MVP (months 0–4):** Auth + KYC T1, wallet & deposits, Flash 24H Auctions (manual + auto-bid, anti-sniping, chat, 48h rule, second chance), basic Marketplace with filters & reports, Admin Control Room + Finance. Pilot: New Cairo + Zayed.
2. **Phase 2 (months 5–7):** Buyer Requests + broker app, Investment Properties + Yield Auctions, seller dashboard, North Coast seasonal auctions.
3. **Phase 3 (months 8–10):** Rentals (Middle Class first, then Luxury), e-contracts, rent collection, disputes center.
4. **Phase 4:** Developer bulk auctions, live video tours, financing partners, New Capital expansion.

### 8.8 Open questions (to resolve before build)

- Legal review: auction T&Cs, deposit forfeiture enforceability, e-signature validity for sale contracts vs. leases, and whether any license is needed to run real estate auctions online in Egypt.
- Escrow: which bank/payment partner holds escrow funds and deposits.
- Final fee percentages and deposit tiers for high-value lots.
- Inspection/valuation partner and cost model (who pays: seller or Benben).
