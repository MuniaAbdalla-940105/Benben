# Design brief: BEN-BEN (مزاد عقارات)

- Version: 0.1 (kickoff, part 1). Date: 2026-11-02. Owner: ui-ux-designer.
- Sources: `docs/PRD.md` (§1, §2, §3, §8.3, §8.4), `docs/design/STAKEHOLDER_VISION.md`, `docs/design/brand/BRAND_IDENTITY_BRIEF.md`, `docs/decisions/ADR-001-stack-platform-and-providers.md`, `backlog/BACKLOG.md`, stories ST-008, ST-009, ST-011, ST-016, `docs/PRD-questions.md`.
- Status: input to the design options in `docs/design/options/`. The design system and final screens (part 2) start after the stakeholder chooses a direction.

> Naming. The product is **BEN-BEN** with the Arabic subtitle **مزاد عقارات** (brand brief, 2026-11-02). The PRD's working name "Benben / عقار لايف" is no longer used in UI or copy. The logo, app icon and wordmark come from the brand designer in `docs/design/brand/`. Until then, every screen uses a placeholder: a small gold triangle plus "BEN-BEN" set in a geometric sans (Outfit).

## 1. Product and goal
BEN-BEN is an auction-first real-estate app for Egypt. Any property can be sold in a transparent 24-hour live auction, backed by a seriousness deposit (default EGP 5,000, configurable per auction). Rentals, Marketplace, Buyer Requests and Investment feed buyers and sellers into auctions (PRD §1.3).

- **Phase 1 pilot:** New Cairo and Sheikh Zayed. Responsive web + installable PWA, plus a desktop admin (ADR-001).
- **Business goal:** prove auction liquidity and bidder quality. Sell-through ≥ 55%, winner completion within 48h ≥ 85%, ≥ 6 verified bidders per auction (PRD §1.4).
- **Design KPI:** the share of auction viewers who finish "Join to Bid" (AU-02 view → lock created). Secondary: abandonment at each Join step, bid confirmation cancel rate (a sign of confusion), outbid → re-bid time in the final minute.

## 2. Users and jobs to be done
| Persona | Context | Jobs to be done | Fears and friction | What design must do |
|---|---|---|---|---|
| **First-time bidder (primary)** | Middle-class buyer in New Cairo / Zayed, 28–45. Phone-first, Arabic, often on 4G, sometimes on a mid-range Android. Has seen auctions on TV, never bid. | "Help me find a fair-priced unit fast." "Explain the auction to me before I commit." "Let me bid without making a mistake." | Losing the EGP 5,000. Hidden fees. Being tricked. Missing the end. Long KYC. Feeling it is gambling. | Plain language at every money step. Amount, premium, total, time left and "my status" always visible. One clear next step per screen. |
| **Experienced investor / resale buyer** | Knows compounds and price/m². Bids on several auctions. Often in the final minutes. | "Show me the data (price/m², payment plan, condition)." "Let me bid fast." "Let me set an auto-bid." | Slow UI in the last minute. Unclear increments. Surprises in the extension. | Fast quick-bid buttons with amounts on them. Auto-bid nearby. Extension status always readable. Optional skip-confirm for the session. |
| **Guest watcher** | Not logged in. Arrived from social media or a push campaign. | "Let me watch and read the chat." "Show me how to join." | Being forced to sign up too early. | Full read access (PRD §2.1). Ask for login only on "Join to Bid", "Remind me" or chat input. |
| **Ops / Auction Control admin** | Desktop 1280+, Arabic or English, monitors several LIVE auctions. | "Show me health at a glance." "Let me act fast, with a reason." | Missing an incident. Acting on the wrong auction. | Covered in part 2 (AD-SHELL, AD-15). Same tokens, denser layout, every action names the auction and asks for a reason. |

## 3. Brand, tone and references
**Brand (binding, brand brief):** "Ancient value. Modern legacy." Premium luxury-tech. Palette is fixed: **deep midnight navy or charcoal, champagne gold, warm ivory**. High contrast, elegant, timeless. No literal gavels, no house outlines, no souvenir Pharaonic imagery, no heavy gradients or 3D.

**Experience (binding, stakeholder vision):** "Live & energetic" applies to the auction experience: LIVE badges, countdowns, bid motion, the extension moment, Just Sold. Semantic colours are allowed for state only: LIVE red, success green, warning amber.

**How the two fit:** the brand is the calm frame, the auction is the show inside it. Energy rises in live moments and drops at money moments (deposit lock, bid confirmation, payment, KYC, T&Cs, winner obligations). The three options in `docs/design/options/` all use the same palette. They differ in density, UI type pairing, imagery, motion and LIVE language, light-first vs dark-first, and how loud the countdown, bid and extension moments are.

**Tone of voice**
- Arabic first, written natively. Simplified modern standard Arabic for money, legal and status text ("سيتم حجز 5,000 ج.م من رصيدك"). Light Egyptian colloquial is allowed in energy moments and empty states ("المزاد ولّع!", "فاتك؟ فيه مزادات تانية"). Assumption (Q-82).
- Never pressure at money steps. No "Hurry!", no "Don't miss out" on a confirmation. Urgency lives on the timer, not in the copy.
- Always say what happens next and what happens to the money.
- English is a full translation (Q-48), sentence case, short.

**References the stakeholder named (patterns, not visuals)**
- Egypt/Gulf property apps: compound and area first, price/m², payment plans (down payment + instalments), delivery status, finishing.
- Fintech and wallet apps: balance buckets (Available, Locked, Pending), receipts, explicit confirmations, transaction states.
- Live auction / bidding apps: countdowns, bid ladders, outbid alerts, extension toasts, bidder pseudonyms.
- Anti-reference: sports-betting apps (dark + neon + odds). Anything that reads as betting harms trust for our primary user.

## 4. Platforms, breakpoints, languages, RTL
- **Platform:** mobile-first responsive web and installable PWA (ADR-001). Admin is desktop-first at 1280+.
- **Breakpoints:** 375 (design base), 768 (two-column detail: media + sticky bid panel), 1280 (three-column home, admin). Every prototype is checked at 375 and 1280.
- **Languages:** Arabic (RTL, default) and English (LTR). Full English at launch (Q-48).
- **Digits:** Latin digits by default in both languages, with an Arabic-Indic toggle in settings; inputs accept both (Q-48 default). Amounts use tabular figures so the price does not jump while it changes.
- **Money format:** EGP only, stored as integer piasters, shown in whole pounds for prices. Arabic: `8,450,000 ج.م`. English: `EGP 8,450,000`. Compact forms only on cards with room limits (`8.45 مليون`), never on confirmation screens.
- **Time:** all times in Africa/Cairo (Q-29). Countdown rendered from server time (PRD §3.6).
- **RTL rules:** use logical properties (start/end). Mirror back/forward chevrons, progress bars (fill from the right in Arabic), carousels, sheet swipe hints and stepper order. Do not mirror clocks, the play icon, charts' time axis (time runs right-to-left in Arabic), phone numbers, amounts or Latin brand text. Bidder aliases ("Bidder #7") stay Latin inside Arabic text, isolated with `dir="ltr"`/`<bdi>`.

## 5. Accessibility (WCAG 2.2 AA)
> Update 2026-11-03: the contrast values below were checked on the part 1 palette. The final values use the brand tokens (`brand/tokens.css`) and are listed in `design-system.md` §4 and in the `tokens.css` header.

- **Contrast:** text ≥ 4.5:1, large text and UI parts ≥ 3:1. Checked palette pairs (shared by all options): ivory `#F7F2E7` on navy `#0B1426` 16.5:1; gold `#C9A961` on navy 8.2:1; navy on gold 8.2:1; gold text on ivory needs the deep gold `#7A5F22` (5.4:1), never `#C9A961` (fails); white on LIVE red `#D7263D` 4.96:1; red text on navy `#FF6B6B` 6.6:1; muted `#9BA7BD` on navy 7.6:1; muted `#5B6475` on ivory 5.3:1.
- **Colour is never the only signal.** The green / amber / red timer (PRD §3.11) also changes its label and icon: "متبقي" (> 1h), "ينتهي قريبًا" + clock icon (< 1h), "الدقائق الأخيرة" + bold weight + border (< 5 min). LIVE always has the word, not just a red dot. Outbid is a word and an icon, not just a red frame.
- **Motion:** every animation has a `prefers-reduced-motion` version: pulses become a static ring, tickers become a static "last bid" line, digit flips become instant swaps, slide-ins become fades. No flashing more than 3 times per second.
- **Live regions:** price and leader changes use `aria-live="polite"`, at most one announcement per 5 s (the latest wins). Outbid and "auction extended" use `role="alert"` once per event. The countdown is not announced every second; it announces at 1h, 5 min, 1 min and on extension.
- **Target size:** ≥ 44×44 px for bid, confirm and checkbox targets (above the 24 px AA minimum, 2.5.8). Quick-bid buttons ≥ 48 px high.
- **Focus:** 2 px gold `#E2C98A` ring with 2 px offset on dark, navy ring on light. Focus is never hidden by sticky headers or bars (2.4.11). Sheets trap focus and return it to the trigger.
- **Text scaling:** rem-based type, layouts hold at 200% zoom; the sticky header wraps instead of truncating the price. Arabic body ≥ 16 px, line height ≥ 1.6.
- **Haptic:** the outbid vibration (Vibration API) always comes with a visible alert and an optional sound (off by default, Assumption Q-79). iOS Safari has no vibration, so the visual alert must stand alone.
- **Forms:** labels above inputs, errors in text next to the field and in a summary, no time limits on the money sheets except the auction itself (2.2.1: the auction timer is an essential real-time event).
- **Consistent help (3.2.6):** "How auctions work" link in the same place on AU-02, AU-04 and AU-05.

## 6. Information architecture (sitemap)
Bottom navigation (PRD §3.1), Arabic order right to left: **Auctions** (default, centre, emphasised) · Explore · Rent · Requests · Profile/Wallet. In Phase 1, Rent and Requests show a "coming soon" state (Phase 2–3, PRD §8.7). Assumption (Q-83).

```
Auctions (AU-01 home)
├─ Live Now hero ─ Auction Detail (AU-02) ─ Live Room (AU-03)
│                                         ├─ Join to Bid (AU-04) ─ Login/OTP (AUTH-01) ─ KYC T1 (KYC-01) ─ Payment (PAY-01)
│                                         ├─ Bid confirmation (AU-05)
│                                         └─ Auto-bid setup (AU-06)
├─ Ending Soon · Starting Soon (Remind me) · Calendar · Just Sold
└─ Result (AU-07) · Second chance (AU-08) · My Auctions (AU-09)
Explore (Marketplace + Investment)
Rent (Phase 3) · Requests (Phase 2)
Profile / Wallet (WAL-01): balances, locks, top-up, withdraw, receipts, settings (language, digits, sound)
```

## 7. Key flows
1. **Guest watches → joins → bids (primary).** Push/social link → AU-02 (read-only: countdown, gallery, condition report, bid history, chat) → "Join to Bid" → OTP (if guest) → KYC T1 (ID front/back + selfie, target < 3 min) → back to AU-04 → read deposit explainer → tick T&C → choose wallet or pay → "Lock EGP 5,000" → receipt + "Verified Bidder" badge → bid controls unlock live → quick bid → AU-05 confirm (amount, premium 2.5%, estimated total) → "You are leading".
2. **Outbid in the final minute.** Alert (visual + vibration + optional sound) → header shows new minimum → one tap re-bid → confirm (unless skipped for the session) → if ≤ 60 s left, "+3:00 Extended" with extension count.
3. **Join & Lock with not enough balance.** AU-04 shows the shortfall → pay the missing amount by card or mobile wallet → "Payment pending" (webhook) → lock created → badge. Failure: reason + retry another method, nothing unlocks (A1). Late confirmation after close: money goes to Available (A2).
4. **After close.** Winner: 48h countdown + checklist (sign contract, pay down payment + premium, upload T2 docs) and the note that the EGP 5,000 is applied to the premium. Rank 2–3: "held as backup bidder" with what that means and until when. Others: "Deposit released" receipt.
5. **Remind me.** Starting Soon card → bell → login if guest → reminder 1h and 5 min before → appears under Watching.

## 8. Screens and their states
Part 1 shows AU-01, AU-02 and AU-04 in three directions. Part 2 covers SHELL, DS-components, AUTH-01, KYC-01, PAY-01, AU-01..AU-06, WAL-01, AD-SHELL, AD-15.

| Screen | Empty | Loading | Error | Success | Permission denied / blocked |
|---|---|---|---|---|---|
| AU-01 Auctions Home | Per rail: "No live auctions right now. Next one starts Thu 8 PM" + calendar link; whole page empty for an area filter | Skeleton hero + rail cards, no shimmer under reduced motion | Offline banner, cached cards marked "may be out of date" | Live data, prices update in place | Guest taps Remind me → login sheet |
| AU-02 Auction Detail (Live) | Auction not found / removed | Skeleton with sticky header placeholder | Realtime lost: "Reconnecting…", price marked stale, bid disabled; resync on reconnect (A6) | Verified Bidder: bid bar unlocked; leading state | Seller viewing own auction; banned/suspended user; KYC flagged (A14); auction PAUSED; ENDED |
| AU-04 Join to Bid | No payment method saved | Balance and methods loading | Payment declined with gateway reason (A1); payment pending (A2) | Lock created, receipt, alias assigned | Not logged in → OTP; no KYC T1 → KYC; seller of this auction; banned; already joined |
| AU-05 Bid confirmation | — | Sending (button busy, idempotent) | Rejected: "Outbid, new minimum is X" | "Bid placed, you are leading" | Not a participant; auction ended |

## 9. Trust and risk moments
At each one the UI calms down (no motion, no red unless an error, one primary action) and shows: **exact amount**, **buyer's premium (2.5%) and estimated total** where a purchase is implied, **time left**, **my status**, an **explicit confirmation**, and a **receipt or result**.

| Moment | Must show | Risk |
|---|---|---|
| Lock deposit (AU-04) | Deposit amount for this auction, Available before and after, "one lock = one auction", what happens to the money in each outcome (released at close / held if backup / applied to premium if you win / forfeited if you win and do not complete in 48h), time left, T&C checkbox, receipt | Fear of losing money; disputes and chargebacks (A4) |
| Place bid (AU-05) | Bid amount, premium 2.5%, estimated total, down payment due in 48h if you win, time left, "bids cannot be withdrawn" | Mis-tap on large amounts; no retraction (PRD §3.5) |
| Pay (PAY-01) | Amount, method, pending state, gateway reason on failure | Double charge, pending confusion (A2, A3) |
| KYC upload (KYC-01) | Why we need it, who sees it, how long it takes | Privacy (PDPL 151/2020) |
| Accept T&Cs | Version, plain-language summary, full text link | Enforceability (Q-01, Q-03) |
| Win (AU-07) | 48h countdown, checklist, amounts due, what happens on default | Completion KPI; forfeiture complaints |

## 10. Design principles for this product
1. **The auction is the show; money is the vault.** Energy (motion, red, big numerals) on live surfaces; stillness (ivory or flat navy, no motion, one gold CTA) at money steps.
2. **Four facts, always.** On any live surface: current price, time left, my status, the next action.
3. **Say the money out loud.** Every commitment repeats the exact amount in the button label ("Lock EGP 5,000", "Bid EGP 8,500,000").
4. **No surprises after the hammer.** Show the 48h rule and premium before the user joins, not after they win.
5. **Server truth is visible.** When the connection is unsure, say so and disable bidding instead of showing stale numbers as live.
6. **Arabic is the original.** Copy and layout are designed in Arabic first, then English.
7. **Premium, not flashy.** Gold is for the brand and the single main action, never for decoration on every element.

## 11. Open questions
Added to `docs/PRD-questions.md` under "I. Design" (Q-75 to Q-84). The most important for the stakeholder:
- Q-76: Show an approximate viewer count ("1.2K watching") to guests as social proof?
- Q-79: Outbid sound on or off by default?
- Q-80: When "skip confirmation" is on, should large jumps (+5 increments or a custom amount) still ask to confirm?
- Q-78: Theme: dark-first, light-first, or follow the system? (Decided with the direction choice.)
- Q-81: Should AU-04 show an estimated total at the next minimum bid, as an example, before the user has bid?
