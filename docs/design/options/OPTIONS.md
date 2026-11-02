# BEN-BEN design options (kickoff, part 1)

- Date: 2026-11-02 · Author: ui-ux-designer · Status: **awaiting stakeholder choice**
- Inputs: `docs/design/DESIGN_BRIEF.md`, `docs/design/STAKEHOLDER_VISION.md`, `docs/design/brand/BRAND_IDENTITY_BRIEF.md`, PRD §2.3, §3.1–3.8, §3.11, §8.3, §8.4.
- Files to open in a browser (no build step):
  - `direction-a-prime-time.html`
  - `direction-b-ivory-ledger.html`
  - `direction-c-grand-salon.html`
  - `ux-options.html`

## How to read this
- All three directions use the **fixed brand palette**: midnight navy / charcoal, champagne gold, warm ivory. Semantic colours are used only for state: LIVE red, success green, warning amber. The directions differ in how the live energy is expressed inside that brand: density, UI type pairing, imagery, motion and LIVE language, light-first or dark-first, and how loud the countdown, bid and extension moments are.
- Each direction shows the same screens at 375 px in Arabic RTL (AU-01 Auctions Home, AU-02 Auction Detail LIVE, AU-04 Join to Bid), one screen in English, a palette and type specimen, and thumbnails for every state of AU-02 and AU-04 (loading, not found, connection lost, verified, leading, seller blocked, paused, ended; loading, low balance, declined, pending, success, KYC needed, already joined or T&C unticked, suspended).
- **Logo:** the screens use a placeholder (gold triangle plus "BEN-BEN" in Outfit). The real BEN-BEN mark now exists in `docs/design/brand/logo/` (`symbol.svg`, `wordmark.svg`, horizontal / stacked / Arabic lockups in navy, gold, white and on-navy variants). **In part 2 it replaces the placeholder triangle** in the app bar, the Auctions tab icon, the splash/PWA icon and the admin shell. No logo or wordmark work is part of these options.
- The UX options in `ux-options.html` are drawn in a neutral style. Any UX option works with any direction.
- Same synthetic content everywhere: a 3-bed, 165 m² garden apartment in "Rayhana Heights", New Cairo. Starting price EGP 7,800,000, current bid 8,450,000, increment 50,000 (PRD 3.5 band 5M–10M), deposit 5,000, premium 2.5%, 20% down payment, 9 verified bidders. Compound names are synthetic (Q-75).

---

## Part A: three visual directions

### Direction A · Prime Time (البث المباشر): dark-first broadcast
The auction as a live sports broadcast. Dark midnight navy throughout, dense layout, a scorebug (LIVE · price · time) pinned on every live surface, a crawling bid ticker, Cairo (Arabic and Latin UI) with Barlow Condensed numerals, full-bleed photos with a navy fade, and a full-width "+3:00" slam-in. At money steps the "studio lights come on": sheets switch to flat ivory, with no motion and one action.

| | |
|---|---|
| **Suits** | Experienced investors and live-event watchers; evening and social-media traffic; the live room (AU-03). |
| **Pros** | Most "live & energetic" at a glance. The scorebug gives the four facts (price, time, bidders, status) in one compact block. High density fits a lot above the fold. The ivory money sheets make the contrast between show and vault very clear. |
| **Cons** | Dark, dense and fast can feel stressful for a first-time bidder. The ticker and blink compete with reading. The brand reads as "media" more than "premium property". |
| **Trust risk** | **High.** Dark + condensed numerals + ticker is the visual language of betting apps, which the stakeholder said must be avoided ("nothing should feel like gambling"). Gold instead of neon lowers the risk but does not remove it. |
| **Accessibility risk** | Medium. Contrast is fine (ivory on navy 16.5:1), but there is a lot of motion (ticker, blink, flips) that must all have reduced-motion versions. Condensed numerals get harder to read at 200% zoom. |
| **RTL risk** | Low to medium. The ticker must crawl right-to-left in Arabic; the scorebug order mirrors. |
| **4G performance** | Medium. Three font families; the ticker needs constant updates (more realtime traffic). |
| **Build effort** | **M**: scorebug, ticker and slam components plus two surface themes (dark pages and light sheets). |

### Direction B · Ivory Ledger (دفتر العاج): light-first, calm core, live edge
Private-bank calm with a live edge. Ivory and white surfaces, navy ink and CTAs, gold only as hairlines, the mark and the "Verified" seal. Medium density, IBM Plex Sans Arabic with Inter tabular numerals, natural-colour photos in rounded cards, fintech patterns (before/after balances, receipt-style deposit card, step indicator). Energy is concentrated: navy LIVE tiles, one red pulse ring, a draining time bar, rolling digits, and a header that tightens in the final 5 minutes.

| | |
|---|---|
| **Suits** | The primary user: first-time, middle-class bidders on a phone. Also the admin (the same tokens work in dense tables). |
| **Pros** | Most trustworthy at money moments: the AU-04 sheet reads like a bank receipt (Available 12,000 → lock −5,000 → 7,000 after). Easiest to read in daylight and at 200% zoom. Lowest motion load. One type family covers Arabic and Latin with matching rhythm. Closest to the fintech references the stakeholder named. |
| **Cons** | Risk of feeling too quiet for "live & energetic" if live tiles are used sparingly. Less distinctive: closer to a well-made bank or property portal. |
| **Trust risk** | **Low.** No betting cues; money always looks like money. |
| **Accessibility risk** | Low. Gold is never used as text on light surfaces except Gold 700 (5.4:1). Timer states carry labels. |
| **RTL risk** | Low. The stepper and time bar must run right-to-left (shown). |
| **4G performance** | Best. Light pages, few effects, two font families with Arabic subsets. |
| **Build effort** | **S–M**: standard cards, sheets and lists; the pulse and roll effects are small. |

### Direction C · Grand Salon (الصالون الكبير): stage + catalogue
An international auction-house evening, set in Cairo. Hybrid: live surfaces are a dark navy stage with cinematic gold-and-navy duotone photos; everything you read is an ivory catalogue page with lot numbers and generous spacing. Low density, one lot per view. Noto Kufi Arabic with Jost echoes the brand's geometry, and a 52° "Benben slope" corner is the only heritage cue. Energy is ceremonial: a gold ring sweeps the remaining time, and in the final minute the auctioneer's call appears ("مرة · مرتين · بيع").

| | |
|---|---|
| **Suits** | Premium and high-value lots (villas, North Coast later); brand building and marketing; users who enjoy the auction ritual. |
| **Pros** | Most premium and on-brand with the new identity ("ancient value, modern legacy"). The most distinctive look of the three. The auctioneer's call explains anti-sniping in a familiar human way. A clear split between stage (live) and catalogue (calm reading). |
| **Cons** | Low density means more scrolling to compare auctions. Kufi needs bigger line heights and is less neutral for long legal text. The duotone hides real finish colours, so the gallery must switch to natural colour. "مرة · مرتين · بيع" needs a copy check: the auction ends on the server timer, not on a call. |
| **Trust risk** | Low to medium. It feels serious and premium, but "luxury" can scare middle-class first-time bidders ("this isn't for me"). |
| **Accessibility risk** | Medium. The ring alone is not enough (digits and label are always shown). Text on duotone photos needs a strong scrim (included). |
| **RTL risk** | Medium. The ring direction, the slope corner and the lot-number layout all mirror (all handled in the prototype). |
| **4G performance** | Medium. Large hero images on the stage; Kufi is a heavier font. |
| **Build effort** | **M–L**: ring timer, the call component, duotone image pipeline, two surface themes, clip-path shapes. |

### Comparison

| Criterion (weight) | A · Prime Time | B · Ivory Ledger | C · Grand Salon |
|---|---|---|---|
| Clarity for first-time bidders (30%) | 2 / 5 | **5 / 5** | 4 / 5 |
| Trust at money moments (20%) | 3 / 5 | **5 / 5** | 4 / 5 |
| "Live & energetic" auction feel (20%) | **5 / 5** | 3 / 5 | 4 / 5 |
| Fit with the premium brand (10%) | 3 / 5 | 4 / 5 | **5 / 5** |
| Accessibility (WCAG 2.2 AA, motion) (10%) | 3 / 5 | **5 / 5** | 4 / 5 |
| 4G performance and build effort (10%) | 3 / 5 | **5 / 5** | 3 / 5 |
| **Weighted score** | **3.1** | **4.5** | **4.0** |
| Light / dark | Dark-first | Light-first | Hybrid (dark stage, ivory pages) |
| Density | High | Medium | Low |
| UI type pairing | Cairo + Barlow Condensed | IBM Plex Sans Arabic + Inter | Noto Kufi Arabic + Jost |
| Loudness: countdown / bid / extension | 5 / 4 / 5 | 3 (5 under 5 min) / 3 / 3 | 4 / 3 / 4 |
| Effort | M | S–M | M–L |

---

## Part B: UX options for the risky moments

### 1 · Join to Bid (login → KYC T1 → T&C → lock)
| | 1A · Growing bottom sheet | 1B · Full-page stepper |
|---|---|---|
| **Suits** | Guests who arrive on a live auction and want to bid now | Users who join a SCHEDULED auction ahead of time; slow readers |
| **Pros** | The auction (price, timer) stays visible the whole time; the user never "leaves the room". Matches PRD 3.11 ("bottom sheets over full-page forms"). Fewer screens. | Lots of room for the T&C summary and explanations; very clear progress (1 of 4). Easier to deep-link and resume. |
| **Cons** | KYC still needs a full-screen camera, so the sheet hands over and returns. Long content in a sheet needs inner scrolling. | The user loses sight of the auction; feels longer; more drop-off in the last hour. |
| **Risks** | Focus management when returning from KYC (focus must land back in the sheet). Sheet height at 200% zoom: becomes full height. | Timer anxiety without the live context; the pinned auction strip on every step reduces it. |
| **Effort** | M | M |

### 2 · Bid confirmation (AU-05)
| | 2A · Always confirm | 2B · Confirm, with "skip for this session" |
|---|---|---|
| **Suits** | First-time bidders | Experienced bidders in the final minutes |
| **Pros** | Every bid shows amount, premium, estimated total and down payment. Lowest mis-tap risk. Simple to build and test. | Implements PRD 3.5's optional toggle. One-tap re-bids when speed matters. The total is printed on each quick button, so the facts stay visible. |
| **Cons** | One extra tap per bid, which can cost a bid in the last seconds. | More states to design and test; risk of habitual tapping. |
| **Risks** | Users may set auto-bid to avoid the friction (that is fine). | A mis-tap on a large amount, since bids cannot be withdrawn. Guardrails: off by default, session only, a visible chip with "turn off", +5 and custom amounts always confirm (Assumption Q-80), idempotency key on every tap. |
| **Effort** | S | M |

### 3 · Outbid alert + "+3:00 Extended"
| | 3A · Loud: banner + full-width extension bar | 3B · Contained: header and bid bar change state |
|---|---|---|
| **Suits** | Experienced bidders in the live room | Everyone, especially first-time bidders and screen-reader users |
| **Pros** | Impossible to miss; re-bid button is inside the banner; strongest "live" moment. | Nothing covers the numbers; status is always in the same place ("حالتك: تم تجاوزك"); readable at 200% zoom; one alert per event for screen readers. |
| **Cons** | Pushes content down; can stack with an extension bar in busy final minutes; feels like pressure. | Less dramatic; relies on vibration and the status row to get attention. |
| **Risks** | Panic bidding (the "gambling" feel); motion load; banner and extension bar colliding. | Missed outbid if the user is scrolled far down: the sticky header carries the status, so it is still visible. |
| **Effort** | M | S–M |

### 4 · Deposit status after close (AU-07)
| | 4A · Outcome first, checklist for winners | 4B · Deposit-first timeline |
|---|---|---|
| **Suits** | Winners (the completion KPI) | Non-winners and backup bidders (trust in the money) |
| **Pros** | The winner sees the 48h countdown, the 3 tasks and the exact amount due (2,008,750 = 1,790,000 down payment + 223,750 premium − 5,000 deposit) on one screen. Clear celebration for winners. | Every step of the 5,000 is visible with times; it answers "where is my money?" at once; the same pattern as the wallet history. |
| **Cons** | The deposit story is spread over cards; backup bidders get less detail about timing. | Less celebratory; the winner checklist sits inside a timeline node, which is less prominent. |
| **Risks** | Winners may miss the forfeiture line: keep it next to the deadline. | Long timelines for backup bidders if the second-chance chain moves on (Q-27, Q-84). |
| **Effort** | M | M |

---

## Recommendation

**Visual direction: B · Ivory Ledger as the base, with C's navy "stage" for live surfaces.**

Reasons:
1. The stakeholder's tie-breaker is binding: when energy and clarity conflict, clarity wins for everyday, first-time bidders. B scores highest on clarity, trust at money moments, accessibility and 4G performance, which are exactly the pilot KPIs (Join to Bid completion, 48h completion).
2. B's weak spot is energy. Borrowing C's dark navy stage for the live hero on AU-01, the sticky header on AU-02 and the live room (AU-03), with the gold countdown ring, gives the auction a real "show" without bringing the betting cues of A. The money sheets, KYC, wallet and results stay in B's ivory receipt style. This also matches the brand (premium navy + gold) better than a pure light app.
3. Keep from C: lot numbers on cards, and "Just Sold" as "sold for" results. Do **not** take the duotone on the gallery, Kufi body text or the auctioneer's call in the MVP (copy and legal check needed first). Keep from A: the compact four-facts block (price, time, bidders, my status) for the AU-03 live room header.
4. Effort stays S–M for sprint 1–2. The stage surface is one extra theme on a few components.
5. Type: IBM Plex Sans Arabic + Inter (B). The real BEN-BEN wordmark and symbol from `docs/design/brand/logo/` replace the placeholder triangle in part 2.

**UX options:**
- **Join to Bid: 1A (growing bottom sheet)**, with the stepper labels from 1B inside the sheet ("Step 2 of 3"). It keeps the user in the room and follows PRD 3.11.
- **Bid confirmation: 2B (confirm, with "skip for this session")** but off by default and with the guardrails above. The first bid of every session always shows the full AU-05.
- **Outbid + extension: 3B (contained)** as the default, plus one vibration and an optional sound (Q-79). The live room (AU-03) may add 3A's short banner for outbid only, under the header, never over the price.
- **After close: 4A for winners** (outcome, countdown, checklist, amount due) **with 4B's deposit timeline** as the "Your deposit" card for all three outcomes.

## Decisions needed from the stakeholder
1. Pick a direction (A, B, C, or the recommended B + C stage mix).
2. Pick one option per risky moment (or accept the recommendation).
3. Answer the design questions added to `docs/PRD-questions.md` group I, most urgently **Q-78** (light / dark default) and **Q-80** (skip-confirm guardrails). The others have safe defaults: Q-75, Q-76, Q-77, Q-79, Q-81, Q-82, Q-83, Q-84.

After the choice, part 2 builds `docs/design/design-system.md`, `docs/design/tokens.css` (light and dark, mapped to Tailwind) and the sprint 1–2 screens.
