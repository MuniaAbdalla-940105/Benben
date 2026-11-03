# BEN-BEN design system v1.0

- Date: 2026-11-03 · Owner: ui-ux-designer · Status: ready for ST-003 (sprint 1)
- Decision: `docs/decisions/ADR-003-design-direction-and-ux-options.md` (direction B base + C live stage; UX 1A, 2B, 3B, 4A+4B; theme follows the phone)
- Files:
  - `docs/design/tokens.css`: product tokens (`--ds-*`); it imports the brand tokens in `docs/design/brand/tokens.css` (`--bb-*`) and never redefines them.
  - `docs/design/tailwind-theme.js`: the Tailwind mapping, used by the app config and by the prototypes.
  - `docs/design/screens/DS-components.html`: the living component sheet, every state in light and dark.
  - `docs/design/screens/_proto/components.css`: the visual reference for each component, using tokens only.
  - `docs/design/screens/index.html`: all sprint 1–2 screens.
- Inputs: `DESIGN_BRIEF.md`, `options/OPTIONS.md`, `brand/CONCEPT.md`, data contracts in `docs/design/contracts/` (error codes from `DATA_MODEL.md` §6).

## 1. Principles
1. **The auction is the show; money is the vault.** Live surfaces (AU-01 live hero, AU-02 sticky header, AU-03 live room, admin live cards) use the navy **stage** in both themes. Everything else is calm: ivory (or dark navy) surfaces, navy ink, gold only as hairlines, the mark and the "Verified" seal.
2. **Four facts, always.** On any live surface, show the current price, time left (with a label), my status and the next action.
3. **Say the money out loud.** Every commitment button repeats the amount: "احجز 5,000 ج.م", "أكّد 8,500,000 ج.م". Money sheets read like a bank receipt: tabular numbers, a dashed rule before the total, the currency always named.
4. **Calm at commitment.** Money steps (AU-04, AU-05, AU-06, PAY, KYC, top-up) have no motion except the sheet opening, no red except errors, and one primary action.
5. **Server truth is visible.** When the connection is uncertain, say so, grey out the numbers and disable bidding.
6. **Arabic is the original.** Layouts are drawn RTL first. English mirrors them.
7. **Premium, not flashy.** No tickers, no slam-in banners, no confetti, no gradients in the UI (ADR-003 exclusions; the brushed gold is for marketing only).

## 2. Theme model
| Mode | How it is chosen | Token source |
|---|---|---|
| Light | Default; `prefers-color-scheme: light` | `:root`, `[data-theme="light"]` |
| Dark | `prefers-color-scheme: dark` (ADR-003 §3) | `[data-theme="dark"]` and the media query block |
| Stage | `data-surface="stage"` on live surfaces | Re-maps the same semantic roles to navy, in both themes |

Components use **semantic roles only** (`bg`, `surface`, `ink`, `primary`, …). A component placed on the stage becomes a stage component automatically, with no variant prop. A forced `data-theme` is supported for a later in-app override (not in the MVP).

## 3. Typography
| Role | Face | Weights | Why |
|---|---|---|---|
| Arabic text (body, labels, legal) | **IBM Plex Sans Arabic** | 400, 500, 600, 700 | Approved by the stakeholder in direction B. Naskh-leaning, open counters, good at 12–16 px and in long T&C and money rows. ADR-003 excludes Kufi body text. |
| Arabic display (display, h1) | **Readex Pro** | 500, 600 | The brand designer's recommended Arabic face, already used in the logo subtitle (CONCEPT.md §5). Used only at 24 px and above, so the brand voice appears in headlines while body text stays highly legible. |
| Latin text and **all numerals** | **Inter** | 400–700 | Documented tabular figures (`tnum`), so prices and timers never jump. Clear 1/7 and 0/O distinction for amounts. |
| Brand | Outfit | — | Only inside the logo lockups, which are outlined SVG. Not loaded in the app. |

**Readex Pro for all Arabic text** was the brand designer's suggestion. I am confirming it for display only, not for body text. Its Kufi-leaning skeleton is close to the "Kufi body text" ADR-003 excludes, and B's approved look uses Plex. Q-85 asks the stakeholder to confirm.

Scale (rem; root 16 px; respects browser font size; layouts hold at 200% zoom):

| Token | Size / line height | Use |
|---|---|---|
| `display` | 36 / 1.2, Readex 600 | Stage hero headline (desktop) |
| `h1` | 24 / 1.35, Readex 600 | Page and screen titles |
| `h2` | 20 / 1.4, Plex 600 | Section titles, sheet titles |
| `h3` | 17 / 1.45, Plex 600 | Card titles, sub-sections |
| `base` | 16 / 1.7 | Body (Arabic needs ≥ 1.6) |
| `sm` | 14 / 1.6 | Secondary text, table text (admin) |
| `xs` | 12 / 1.5 | Captions, labels. **The floor: nothing smaller.** |
| `num-xl` | 40 | Deposit amount, bid amount in confirm sheets, stage price on desktop |
| `num-lg` | 28 | Sticky header price, timer |
| `num-md` | 20 | Card price |
| `num-sm` | 16 | Rows |

Numbers: class `ds-num` (Tailwind: `font-num tabular-nums`) plus `dir="ltr"` / `unicode-bidi: isolate` on amounts inside Arabic text. Digits are Latin by default. The Arabic-Indic toggle (ST-002) maps 0–9 to ٠–٩, `,` to `٬` and `.` to `٫` at render time.

## 4. Colour
Brand values come from `brand/tokens.css`. Five values are **extensions** added in `tokens.css` because the brand file has no state colours for dark surfaces: `ok-600 #13795B`, `ok-300 #3DD68C`, `warn-700 #8F5300`, `warn-300 #FFB547`, `danger-700 #B42318`, `danger-300 #FF7A70`, and `navy-line #5F6B8A` for 3:1 control borders on navy.

| Role (Tailwind) | Light | Dark | Stage | Notes |
|---|---|---|---|---|
| `bg` | ivory-50 `#FBF8F2` | navy-950 `#070E1F` | navy-900 `#0B1530` | Page |
| `surface` | white | navy-900 | navy-800 | Cards, sheets' footer, bars |
| `surface-2` / `-3` | ivory-100 / ivory-200 | navy-800 / navy-700 | navy-700 | Sunken rows, chips, skeleton, disabled |
| `line` | ivory-200 | navy-700 | navy-700 | Decorative hairlines only |
| `line-strong` | stone-500 (3.48:1 on white) | `#5F6B8A` (3.40:1) | `#5F6B8A` | Input and control borders (1.4.11) |
| `ink` | navy-900 (17.0:1) | ivory-100 (17.1:1) | ivory-100 (16.0:1) | Text |
| `ink-muted` | stone-600 (5.31–5.63:1) | stone-300 (9.2:1) | stone-300 | Secondary text |
| `primary` / `primary-on` | navy-900 / ivory-100 | gold-500 / navy-900 (7.69:1) | gold-500 / navy-900 | One primary per view |
| `accent` | gold-600 (graphics only) | gold-500 | gold-500 | Hairlines, seal, ring frame |
| `accent-text` | gold-700 (5.16–5.47:1) | gold-300 (10.3:1) | gold-300 | Lot numbers, "Verified" text |
| `live` / `live-on` | live-600 `#C9302C` / white (5.33:1) | same | same | LIVE pill only, never for errors |
| `ok`, `warn`, `danger` | `#13795B`, `#8F5300`, `#B42318` | `#3DD68C`, `#FFB547`, `#FF7A70` | same as dark | All ≥ 5:1 on their surfaces; each has a `-tint` background |
| `focus` | navy-900 | gold-300 (11.7:1) | gold-300 | 2 px ring, 2 px offset |

Rules:
- Gold text on light surfaces is only `accent-text` (gold-700). Gold-500 on ivory fails (2.08:1) and is never used for text or meaning.
- LIVE red is a brand signal, `danger` is an error. They never swap.
- Colour is never the only signal. Timers, statuses, errors and the deposit timeline always pair colour with a word and an icon.

## 5. Spacing, radius, elevation
- **Spacing:** 4 px grid (Tailwind default scale). Page padding 16 px (375–767) and 24 px (768+). Stacks inside cards: 8 / 12 / 16. Between sections: 20–24.
- **Targets:** minimum 44×44 (`min-h-target`) for any action. Quick-bid buttons 48 px (`min-h-target-bid`). Admin controls 36 px (still above the 24 px AA minimum, 2.5.8).
- **Radius:** `sm` 8 (chips) · `md` 12 (inputs, list buttons) · `lg` 16 (cards, primary buttons) · `xl` 20 (hero cards) · `sheet` 28 (sheet top corners) · `full` (pills).
- **Elevation:** `shadow-card` (hairline lift) · `shadow-raised` (hero, drawers) · `shadow-sheet` · `shadow-toast`. In dark and on the stage, elevation is a lighter surface plus a hairline; shadows stay subtle.

## 6. Motion
| Name | Token / class | Default | Reduced motion |
|---|---|---|---|
| LIVE pulse | `ds-anim-live-pulse` | Red ring, 1.6 s, under 1 flash per second | Static 3 px ring |
| Price roll | `ds-anim-price-roll` | New value slides up, 320 ms | Instant swap |
| Sheet open | `ds-anim-sheet-in` | Slide up 240 ms, standard easing | Fade 120 ms |
| Toast | `ds-anim-toast-in` | Drop 8 px + fade, 200 ms | Fade 120 ms |
| Skeleton | `ds-anim-shimmer` | 1.4 s sweep | Flat `surface-2` |
| Status flip (outbid) | `ds-anim-status-flash` | Danger tint fades in once, 200 ms, no blinking | Tint applied, no animation |
| Ring | SVG arc | Updates once per second, linear | Same (no animation; content change only) |
| Button loading | spinner | 0.8 s rotation | 2.4 s rotation |

Durations: `fast` 120 · `base` 200 · `slow` 320 ms. Easing: `standard` `cubic-bezier(.2,0,0,1)`, `exit` `cubic-bezier(.3,0,1,1)`. Carousels never auto-advance while focused, hovered or touched, and never under reduced motion (2.2.2). Excluded by ADR-003: crawling tickers, slam-in banners, digit flip boards.

## 7. Tailwind usage
`tailwind-theme.js` replaces the default colour palette, so off-system colours cannot be used. Examples:

| Need | Classes |
|---|---|
| Page | `bg-bg text-ink` |
| Card | `bg-surface border border-line rounded-lg shadow-card` |
| Muted text | `text-ink-muted text-sm` |
| Primary button | `bg-primary text-primary-on rounded-lg min-h-target font-semibold hover:bg-primary-hover` |
| Input | `bg-surface border-[1.5px] border-line-strong rounded-md min-h-12 focus-visible:outline-focus` |
| Success badge | `bg-ok-tint text-ok rounded-full text-xs font-semibold` |
| Live stage | `data-surface="stage"` on the container, then the same classes |
| Amount | `font-num tabular-nums` + `dir="ltr"` |
| Gold lot number | `text-accent-text tracking-[.28em] text-xs font-latin` |

Semantic colours have no opacity channel; use the `*-tint` tokens instead of `bg-ok/10`.

## 8. Components
Every component below is shown in all its states, light and dark, in `screens/DS-components.html`. The `data-component` names in the prototypes match the planned React components.

| Component | Variants | States | Accessibility notes |
|---|---|---|---|
| **Button** | primary, secondary, quiet, ghost, danger; sizes sm, md, lg; block | default, hover, focus, loading (`aria-busy`, keeps width, ignores repeat taps), disabled | Label states the action and the amount. Icon-only buttons need `aria-label`. |
| **IconButton** | — | default, hover, focus | 44×44. Directional icons mirror in RTL (`c-flip`); clock, play and check icons do not. |
| **TextField / PhoneField / AmountField** | affix (+20, ج.م) | default, focus, error (2 px border + text + icon), disabled (dashed) | Label above, help below, `aria-describedby` to help and error. Phone and amount fields are LTR inside RTL. Both digit sets are accepted and normalised. |
| **Select** | native | default, focus, disabled | Native `<select>`; the chevron sits on the inline-end side. |
| **OtpInput** | 6 cells | empty, active cell, filled, error, disabled (rate limited) | One real `<input autocomplete="one-time-code" inputmode="numeric">` behind the cells. Paste fills all cells; auto-submits on the 6th digit. Always LTR. |
| **Checkbox** | — | unchecked, checked, error, disabled, focus | 24 px box inside a 44 px row. The T&C checkbox links the full text. |
| **RadioCard** | with icon, badge | default, selected (2 px ink border), disabled ("قريبًا") | `role="radiogroup"`; arrow keys move. |
| **Switch** | — | off, on, focus | `role="switch"` + `aria-checked`. The knob moves along the inline axis. |
| **Card / ListRow** | card, sunken, selected | default, hover (links), disabled | Rows ≥ 52 px. Chevrons mirror. |
| **AuctionCard** | live, ending (< 1 h), final (< 5 min), upcoming (Remind me), sold | loading (skeleton), live update (price roll) | Always shows price, time with label, status and the next action. |
| **Badge / LivePill / LotNumber** | neutral, verified, ok, warn, danger; LIVE, paused, ended | — | LIVE always has the word. Lot numbers are Latin, letter-spaced, `accent-text`. |
| **CountdownText** | ok (> 1 h, "متبقي"), warn (< 1 h, "ينتهي قريبًا" + clock), danger (< 5 min, "الأخيرة" + alert, bold, boxed), neutral (upcoming) | live, extended ("+3:00"), paused (frozen + label) | `role="timer"`. Announced at 1 h, 5 min, 1 min and on extension only. Rendered from server time. |
| **CountdownRing** | ok, warn, danger | as above | Stage only. Gold hairline frame (C), arc in the state colour (PRD 3.11 rule). The arc shows the share of the current window: 24 h above 1 h, the last hour under 1 h, the last 5 min under 5 min. It drains counter-clockwise in Arabic. Digits and label always inside. |
| **BidLadder** | lead, me, auto, event (extension) | loading, empty ("no bids yet"), new row (slide in) | Bidders appear only as aliases (مزايد #7 / Bidder #7). Times are server times. |
| **Tabs / FilterChips** | — | selected, focus | Selected tab has a 3 px gold underline plus weight; selected chip is filled. |
| **Stepper** | 3 steps (Join), 3 steps (KYC capture), 3 steps (2FA) | done, current, upcoming | Runs right-to-left in Arabic. `aria-current="step"`. |
| **BottomSheet** | with footer, without | open (slide), loading body | `role="dialog" aria-modal`; focus trapped and returned; close button always present (the grip is decorative); up to 92% height at 375 px, side drawer 440 px at 768+. |
| **Modal** | alertdialog | — | For short confirmations only (leave auction, cancel auto-bid). |
| **Toast** | neutral, ok, danger | — | Inverted colours. `role="status"`; outbid and extension use `role="alert"` once per event. 4 s, or until dismissed for errors. |
| **InlineAlert** | info, ok, warn, danger | — | 4 px start border + icon + bold title + plain sentence. |
| **EmptyState** | with action | — | Says what is missing and what to do next. |
| **Skeleton** | blocks | shimmer, static (reduced motion) | Container gets `aria-busy="true"` and a text label. |
| **MoneySummary** | lock, shortfall, bid, autobid-max, top-up | — | `<dl>`; amounts LTR-isolated, tabular; total row bold with a dashed rule. |
| **DepositTimelineCard** | released, backup, winner, active, upcoming | done, now (gold tint), risk (red text + icon), ok | Every state has text; the dot colour is never the only signal. |
| **BrandMark** | symbol, lockup | on light, on dark/stage | See §12. |

## 9. Patterns (ADR-003 UX decisions)
- **Live stage (B + C):** navy container, lot number, LIVE pill, CountdownRing, LivePrice, MyStatusBar. Same in light and dark. In AU-03 the header is A's compact four-facts block: price · time · bidders · my status.
- **Join to Bid (1A):** a growing bottom sheet over AU-02 with a 3-step stepper: login (in the sheet) → KYC (KYC-01, the only full-screen step; it returns on `kyc.updated`) → terms + lock (in the sheet). Low balance → pay only the shortfall (`join_lock` intent). The lock happens after the webhook, never on redirect.
- **Bid confirmation (2B):** AU-05 shows the amount, premium, estimated total, the amount due in 48 h if you win, time left and "cannot be withdrawn". The "one-tap for this session" switch is off by default and offered only for +1 and +2. A chip in the bid bar shows it is on, with "Turn off". +5 and custom amounts always confirm (Q-80). If someone outbids while the sheet is open, the amounts refresh and nothing is sent.
- **Outbid and extension (3B):** the MyStatusBar flips to "تم تجاوزك" (danger border, icon, tint), the primary button becomes the new minimum, and the device vibrates once. Sound is off by default (Q-79). Extension: "+3:00" on the timer, the extension counter increments, and one toast appears. Nothing ever covers the price.
- **After close (4A + 4B):** the result screen leads with the outcome; winners get the 48 h countdown, the checklist and the amount due. Every outcome shows the DepositTimelineCard. The result screens themselves (AU-07) are sprint 4; the card is built now and already used in WAL-01.
- **Errors:** inline, next to the cause, with the next step. Never a dead end; "nothing was charged / nothing changed" is stated whenever money is involved.

## 10. Error codes → UI copy (contracts, DATA_MODEL §6)
| Code | Where | Arabic copy | English copy |
|---|---|---|---|
| `NOT_AUTHENTICATED`, `ANONYMOUS_NOT_ALLOWED` | any write | سجّل دخولك للمتابعة. | Please log in to continue. |
| `INVALID_PHONE` | AUTH-01 | أدخل رقم موبايل مصري صحيح (10 أرقام بعد +20). | Enter a valid Egyptian mobile number. |
| `OTP_INVALID` / `OTP_EXPIRED` / `OTP_RATE_LIMITED` | AUTH-01 | الكود غير صحيح. / انتهت صلاحية الكود. اطلب كودًا جديدًا. / طلبات كثيرة. حاول بعد {m} دقيقة. | The code is not correct. / The code has expired. / Too many codes requested. |
| `USER_BANNED` / `USER_SUSPENDED` | login, join, bid | تم حظر الحساب: {reason}. / حسابك موقوف حتى {date}. | Your account is blocked: {reason}. / Suspended until {date}. |
| `KYC_REQUIRED` / `KYC_IN_PROGRESS` | AU-04 | تأكيد الهوية مطلوب للمزايدة. / هويتك قيد المراجعة. | Verify your ID to continue. / Your verification is under review. |
| `INVALID_NATIONAL_ID`, `KYC_DOCUMENTS_MISSING`, `KYC_VENDOR_ERROR`, `KYC_ATTEMPTS_EXCEEDED`, `KYC_ALREADY_VERIFIED` | KYC-01 | see KYC-01 states | see KYC-01 states |
| `INSUFFICIENT_BALANCE` | AU-04 | رصيدك لا يكفي للحجز. ادفع الفرق فقط. | Not enough balance. Pay only the difference. |
| `TC_NOT_ACCEPTED` / `TC_VERSION_OUTDATED` | AU-04 | يجب الموافقة على الشروط. / تم تحديث الشروط، راجعها مرة أخرى. | Please accept the terms. / The terms were updated. |
| `ALREADY_JOINED`, `SELLER_CANNOT_JOIN`, `AUCTION_NOT_JOINABLE`, `CANNOT_LEAVE_LIVE` | AU-04 | see AU-04 states | see AU-04 states |
| `PAYMENT_PENDING` / `PAYMENT_DECLINED` / `GATEWAY_UNAVAILABLE` | AU-04, WAL-01 | بانتظار تأكيد البنك… / تم رفض الدفع: {reason}. لم يُحجز أي مبلغ. / خدمة الدفع مشغولة. | Payment pending… / Payment declined: {reason}. / Payment service is busy. |
| `WALLET_FROZEN` | AU-04, WAL-01 | محفظتك موقوفة مؤقتًا. تواصل مع الدعم. | Your wallet is on hold. Contact support. |
| `NOT_PARTICIPANT` | AU-02, AU-05, AU-03 chat | انضم للمزايدة على هذا المزاد أولًا. | Join to bid in this auction. |
| `AUCTION_NOT_LIVE` / `AUCTION_PAUSED` / `AUCTION_ENDED` | bid | المزايدة لم تبدأ. / المزايدة متوقفة مؤقتًا. / انتهى المزاد. | Bidding has not started. / Bidding is paused. / The auction has ended. |
| `ALREADY_LEADING` | bid bar | أنت صاحب أعلى مزايدة. | You are leading. |
| `OUTBID` / `BID_TOO_LOW` / `BID_TOO_HIGH` / `INVALID_AMOUNT` | AU-05, AU-02 | سبقك مزايد آخر. أقل مزايدة الآن {min}. / أقل مزايدة {min} ج.م. / المبلغ أعلى بكثير من الحد الأدنى، راجع الرقم. / أدخل مبلغًا صحيحًا بالجنيه. | Outbid, new minimum is {min}. / Minimum bid is {min}. / Much higher than the minimum. Check the amount. / Enter a whole EGP amount. |
| `BUSY_RETRY` / `RATE_LIMITED` / `DUPLICATE_REQUEST` / `INTERNAL_ERROR` | all | الخادم مشغول، نعيد المحاولة… / محاولات كثيرة، حاول بعد {s} ثانية. / هذا الطلب استُخدم من قبل، حاول مرة أخرى. / حدث خطأ غير متوقع. | Busy, retrying… / Too many attempts. Try again in {s}s. / This request was already used. / Something went wrong. |
| `AUCTION_NOT_FOUND` | AU-02 | هذا المزاد غير متاح. | Auction not found. |
| `FORBIDDEN` | admin | هذه الوحدة غير متاحة لدورك. | You do not have access. |
| `NOT_ALLOWED_IN_ENV` | PAY-01 | هذه الصفحة للاختبار فقط. | Test-only page. |

The codes never appear in the UI. In the prototypes they are shown in dotted "annotation" boxes for developers only.

## 11. RTL, digits and formatting
- Use logical properties only (`ms/me/ps/pe/start/end`, `border-inline-start`). Mirror back/next chevrons, the send icon, steppers, progress bars and the ring direction. Do not mirror clocks, the check, the alert, the play icon, phone numbers, amounts or Latin brand text.
- Bidder aliases: "مزايد #7" in Arabic and "Bidder #7" in English (contract ST-008 `alias_number`, localised on the client); the number is in `ds-num`.
- Money: piasters → whole EGP, no floats; Arabic `8,450,000 ج.م`, English `EGP 8,450,000`; compact forms (`8.45 مليون`) only on space-limited cards, never in money sheets.
- Dates: Africa/Cairo; Arabic month names ("3 نوفمبر · 1:12 م"); 12-hour clock with م/ص in Arabic and AM/PM in English.

## 12. Brand mark
The logo is **not final** (ADR-003 §4). Reference it only through files:

```html
<img class="ds-brand-on-light" data-brand="symbol" src="/brand/logo/symbol.svg" alt="BEN-BEN">
<img class="ds-brand-on-dark"  data-brand="symbol" src="/brand/logo/symbol-on-navy.svg" alt="BEN-BEN">
```

`tokens.css` shows the right one per theme and on the stage. Lockups: `lockup-horizontal(.svg|-on-navy.svg)`. A new mark is a file replacement with the same names. Never redraw the mark in CSS or SVG inside components.

## 13. Accessibility checklist (WCAG 2.2 AA)
- Text contrast ≥ 4.5:1 and UI ≥ 3:1 in light, dark and stage (values in §4 and in the `tokens.css` header).
- Focus is visible on every control (2 px ring), and never hidden under sticky headers or bars (2.4.11): sticky regions add `scroll-padding`.
- Targets ≥ 44 px (≥ 24 px absolute minimum, 2.5.8).
- Reduced motion is covered for every animation (§6). Nothing flashes more than 3 times per second.
- Live regions: price is polite, max one announcement per 5 s; outbid and extension are one alert each; the countdown is announced only at thresholds.
- Colour is never the only signal (timers, statuses, timeline, errors).
- Text scales to 200%: sticky headers wrap rather than truncate the price.
- Consistent help: "كيف يعمل المزاد؟" sits in the same place on AU-02, AU-04 and AU-05.
- No time limit on forms except the auction itself (an essential real-time event).

## 14. Deviations from ADR-003 and open items
- **Ring colour:** ADR-003 names C's "gold countdown ring". PRD 3.11 and ST-017 require green / amber / red timers. The ring keeps a gold frame (brand), and the arc and label carry the state colour. Gold alone would break the PRD rule and lose meaning for colour-blind users.
- **Arabic body face:** Plex Arabic, not Readex Pro (see §3). Readex Pro is used for display and h1. Q-85.
- **AU-06 error codes:** there is no ST-015 contract yet. The screen reuses `BID_TOO_LOW`, `INVALID_AMOUNT`, `NOT_PARTICIPANT` and `AUCTION_PAUSED`. The architect may add specific codes.
- **Realtime disconnect:** there is no shared error code for it (it is a client channel state, `CHANNEL_ERROR`). The UI treats it as the "reconnecting" state.
- **Withdraw** on WAL-01 is shown disabled ("قريبًا") until ST-042 (sprint 6).
- New questions Q-85 to Q-87 are in `docs/PRD-questions.md` group I.
