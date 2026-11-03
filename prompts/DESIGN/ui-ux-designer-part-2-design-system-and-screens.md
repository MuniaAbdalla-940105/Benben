# Design prompt: BEN-BEN → ui-ux-designer (kickoff, part 2: design system + sprint 1–2 screens)

## Role and seniority
You are the same principal product designer as in part 1: 16 years in real-estate marketplaces, fintech wallets and live commerce in Egypt and the Gulf, Arabic-first and RTL, and design systems used by several teams.

## Decisions (binding): `docs/decisions/ADR-003-design-direction-and-ux-options.md`
- Direction **B base + C live stage** (details in ADR-003).
- UX options **1A, 2B (+5 jumps and custom amounts always confirm), 3B, 4A+4B**.
- Theme **follows the phone's setting**: design light and dark for every screen. Live surfaces stay navy in both.
- Logo **not final**. Reference the mark only through `docs/design/brand/logo/symbol.svg` and the lockup files (an `<img>` or an inline copy marked `data-brand="symbol"`), so a later swap is a file replacement. Do not draw your own mark.
- Colours come from `docs/design/brand/tokens.css`. Extend it, never redefine it. Gold text on ivory uses the deep gold token.

## Task
1. `docs/design/design-system.md` + `docs/design/tokens.css`, which imports or extends the brand tokens:
   - semantic colour tokens for light and dark, and the live-stage tokens;
   - the Arabic + Latin type scale (pick the UI fonts with reasons; the brand designer suggests Readex Pro for Arabic, so confirm or justify an alternative) and tabular numerals;
   - spacing, radius, shadows and motion, with a reduced-motion version of each animation;
   - a Tailwind theme mapping;
   - components with every state: button, input, OTP input, select, checkbox, radio, card, auction card, list row, bottom sheet, modal, toast, badge/LIVE pill, timer (ring + text, green/amber/red **with labels**), bid ladder, tabs, stepper, empty state, skeleton, money summary (receipt), and the deposit timeline card.
2. HTML prototypes `docs/design/screens/<id>-<name>.html` for the sprint 1–2 screens listed in `backlog/BACKLOG.md`: SHELL (app shell + bottom nav), DS-components (living component sheet), AUTH-01, KYC-01, PAY-01 (mock checkout, staging only), AU-01, AU-02, AU-03, AU-04, AU-05, AU-06, WAL-01, AD-SHELL, AD-15.
   - Arabic RTL first at 375 px, checked at 768 and 1280. Admin is desktop-first at 1280. Show one English (LTR) version of AU-02 and AU-04.
   - Show light and dark side by side, or with a toggle.
   - Every screen shows empty, loading, error, success and permission-denied states, plus the screen-specific ones (outbid, extended, paused, ended, pending payment, declined, low balance).
   - Mark interactive parts with `data-component` names matching the planned React components, and add a short component list at the top of each file.
   - Use the pinned Tailwind script `https://cdn.tailwindcss.com/3.4.17`.
3. Link each screen in its story: add the path under `## Design` in `backlog/stories/ST-###.md`, and tick "Design attached".

## Inputs
- `docs/decisions/ADR-003-…`, `docs/design/options/` (your part 1 work and OPTIONS.md), `docs/design/brand/` (tokens, CONCEPT.md, logo files), `docs/design/DESIGN_BRIEF.md`, `docs/design/STAKEHOLDER_VISION.md`
- `backlog/BACKLOG.md`, the story files for sprints 1–2, and `docs/design/contracts/` (field names and error codes, so the error states match)
- `docs/PRD.md` (never edit it)

## Constraints
- Do not run git commands. Do not edit `docs/design/brand/` or `docs/design/contracts/`.
- Use realistic Egyptian content, as in part 1.

## Self-check
- [ ] Every sprint 1–2 screen exists, in light and dark, with all its states.
- [ ] The error states use the contract error codes (for example BID_TOO_LOW, AUCTION_NOT_LIVE).
- [ ] Contrast is AA in both themes, focus is visible, RTL is mirrored, and reduced motion is covered.
- [ ] Money moments show the amount, premium, total, time and status before any commitment.
- [ ] Each story file links its screens.

## Report
Files created, component list, any deviations from ADR-003 and why, and open questions.
