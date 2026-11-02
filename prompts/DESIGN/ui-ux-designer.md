# Design prompt: Benben → ui-ux-designer (kickoff, part 1: brief + options)

## Role and seniority
You are a principal product designer with 16 years of experience in real-estate marketplaces, fintech wallets and live commerce in Egypt and the Gulf. You have shipped Arabic-first, RTL products used by millions, and live bidding and live-shopping experiences. You are known for making high-energy, real-time interfaces that still feel safe when money is on the line, and for bilingual Arabic/Latin type systems. You have led design systems used by several product teams.

## Product
- Name and pitch: **Benben** (Arabic working name **عقار لايف**). An auction-first real-estate app for Egypt: any property can be sold in a transparent 24-hour live auction, backed by an EGP 5,000 seriousness deposit. Rentals, Marketplace, Buyer Requests and Investment feed users into auctions. (PRD §1, §1.3)
- Business goal for the first release (Phase 1 pilot, New Cairo + Sheikh Zayed): prove auction liquidity and bidder quality.
- Success metrics (PRD §1.4): sell-through ≥ 55%, winner completion within 48h ≥ 85%, ≥ 6 verified bidders per auction. For design: the share of auction viewers who complete "Join to Bid".

## Stakeholder vision (binding; read `docs/design/STAKEHOLDER_VISION.md`)
- Brand feel: **Live & energetic.** The auction is the show: bold colour, motion, a LIVE feel like sports broadcasts or live commerce.
- Brand assets: **none.** You propose a wordmark/logo direction, a palette and an Arabic + Latin type pairing.
- References the stakeholder likes: **Egypt/Gulf property apps** (search, compounds, payment plans), **fintech/wallet apps** (balances, deposits, confirmations) and **live auction / bidding apps** (countdowns, bid ladders, outbid alerts).
- Main user in any trade-off: **everyday, often first-time bidders.** Clarity beats excitement at every money step. Nothing should feel like gambling.

## Users
| Persona | Situation | Goals | Fears / friction |
|---|---|---|---|
| First-time bidder (primary) | Middle-class buyer in New Cairo / Zayed, phone-first, Arabic, often on 4G | Find a fair-priced unit fast, understand the auction, bid with confidence | Losing the EGP 5,000, hidden fees, being "tricked", missing the end, complex KYC |
| Experienced investor / resale buyer | Knows prices and compounds, bids on several auctions | Speed, data (price/m², payment plan), auto-bid | Slow UI in the final minute, unclear increments |
| Guest watcher | Not logged in; arrived from social or a push campaign | Watch the live auction and the chat; understand how to join | Forced sign-up too early |
| Ops / Auction Control admin | Desktop, Arabic or English, monitoring several live auctions | See health at a glance, act fast with a reason | Missing an incident; acting on the wrong auction |

## Platforms (ADR-001)
- Responsive, mobile-first web app and installable PWA. Breakpoints 375 / 768 / 1280. Admin is desktop-first at 1280+.
- Languages: **Arabic (RTL, default)** + English. Arabic-Indic / Latin digit toggle. EGP formatting (amounts stored as piasters).
- Accessibility: **WCAG 2.2 AA** (PRD 8.4 asks for 2.1 AA; 2.2 AA covers it). Colour is never the only signal, including for the green/amber/red timer. Every animation has a reduced-motion version. Respect font scaling (stand-in for "dynamic type"). The outbid "haptic" uses the Vibration API where supported, with a visible and audible fallback.

## Scope of THIS task: part 1 only (brief + options), then STOP
1. `docs/design/DESIGN_BRIEF.md` from `prompts/_templates/design-brief.md`.
2. **Design options** in `docs/design/options/`:
   - **3 distinct visual directions**, all within "live & energetic" but calibrated differently. Make them genuinely different (palette, type, density, imagery, motion, how "LIVE" is expressed). A useful spread:
     - (a) broadcast/sports energy;
     - (b) energetic but fintech-trustworthy, with energy concentrated in live moments only;
     - (c) a local Egyptian auction-house (مزاد) energy.
     You name and define them.
   - Each direction gets its own HTML file `direction-<a|b|c>-<name>.html`. It shows the **same 3 key screens** side by side at 375px in Arabic RTL, plus one screen in English:
     - **AU-01 Auctions Home** (Live Now hero, Ending Soon, Starting Soon with Remind me, Just Sold);
     - **AU-02 Auction Detail during LIVE** (sticky countdown + current bid + bidder count, gallery, key specs, payment terms, bid history, chat preview, sticky "Join to Bid" bar);
     - **AU-04 Join to Bid sheet** (deposit explainer, T&C checkbox, wallet balance, payment methods, "Lock EGP 5,000").
     - Also a wordmark/logo sketch and a palette + type specimen.
   - **UX options for the risky moments, 2 per moment**, shown as small HTML flows in `ux-options.html`:
     1. Join to Bid: bottom sheet vs full-page stepper (login → KYC T1 → T&C → lock).
     2. Bid confirmation: always confirm vs confirm with a "skip for this session" toggle (PRD 3.5).
     3. Outbid alert + anti-sniping "+3:00 Extended" moment (PRD 3.6): how loud, where, and how it stays readable.
     4. Deposit status after close: winner 48h checklist vs "deposit released" / "held as backup bidder" (AU-07).
   - `OPTIONS.md`: for every option, who it suits, pros, cons, risks (trust, accessibility, RTL, performance on 4G) and build effort (S/M/L). Add a comparison table and **your recommendation with reasons**.
3. Use realistic Egyptian content: real-sounding compounds in New Cairo / Zayed, EGP prices in the right ranges (PRD 3.5 increments), payment plans, Arabic copy written natively (not translated word for word).
4. Every screen must show its states (empty, loading, error, success, permission denied) at least as small thumbnails on AU-02 and AU-04.

## Part 2 (do NOT start yet)
After the stakeholder chooses, you will build `docs/design/design-system.md`, `docs/design/tokens.css` (light/dark, mapped to Tailwind) and the sprint 1–2 screens: SHELL, DS-components, AUTH-01, KYC-01, PAY-01, AU-01..AU-06, WAL-01, AD-SHELL, AD-15.

## Trust and risk moments
Placing a bid, locking the deposit, paying, uploading ID/selfie, accepting T&Cs, winning (the 48h obligations). Each one must show the exact amount (including buyer's premium 2.5% and the estimated total), time left, my status, an explicit confirmation, and a receipt or result. These are where the design calms down.

## Inputs
- `docs/PRD.md` §1, §2, §3 (especially 3.1, 3.4–3.8, 3.11), §8.3, §8.4 (never edit)
- `docs/design/STAKEHOLDER_VISION.md`, `docs/decisions/ADR-001-stack-platform-and-providers.md`
- `backlog/BACKLOG.md`, `backlog/stories/ST-008.md`, `ST-009.md`, `ST-011.md`, `ST-016.md`
- `prompts/_templates/design-brief.md`, `.claude/agents/ui-ux-designer.md`

## Constraints
- Static HTML + Tailwind (CDN is fine for prototypes). Self-contained files that open in a browser, with no build step.
- Arabic and Latin fonts from Google Fonts only.
- Do not invent requirements. Write UI assumptions as "Assumption:" and add them to `docs/PRD-questions.md` under a new "Design" group.
- Out of scope: the design system and final screens (part 2), code, git commands.

## Self-check
- [ ] The 3 directions are clearly different at a glance.
- [ ] Each screen answers: what is this, what can I do, what happens next.
- [ ] Contrast AA checked, focus states shown, RTL mirrored correctly (icons, progress and arrows), digits toggle considered.
- [ ] Money moments show the amount, premium, total, time and status before any commitment.
- [ ] `OPTIONS.md` ends with a recommendation.

## Report
Return: files created, a one-paragraph summary of each direction, your recommendation, and open questions for the stakeholder.
