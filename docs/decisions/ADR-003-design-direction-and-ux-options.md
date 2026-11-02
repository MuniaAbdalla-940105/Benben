# ADR-003: Design direction, UX options and theme

- Status: **accepted** (stakeholder decision) · Date: 2026-11-02 · Decided by: Munia Abdalla
- Inputs: `docs/design/options/OPTIONS.md`, the direction files in `docs/design/options/`, and `ux-options.html`

## Decision
1. **Direction: B (Ivory Ledger) as the base, plus C's (Grand Salon) live stage.**
   - Taken from B: ivory, private-bank calm surfaces; navy text and buttons; gold as thin lines and the mark; money sheets that read like a bank receipt.
   - Taken from C, for **live surfaces only** (AU-01 live hero, the AU-02 sticky header, AU-03 live room): the dark navy stage, the gold countdown ring, lot numbers, and the "Sold for" moments.
   - Taken from A: only the compact four-facts block in the AU-03 header.
   - Excluded: A's betting-like cues (crawling ticker, banner slam-ins), C's tinted gallery photos, and Kufi body text.
   - C's auctioneer's call ("مرة · مرتين · بيع") is parked until the copy and a legal check are done.
2. **UX options (all recommended):**
   - **1A:** Join to Bid is a bottom sheet that grows, so the auction stays visible. KYC is the only full-screen step.
   - **2B:** bid confirmation has a "skip for this session" toggle, off by default. Jumps of +5 increments and custom amounts always confirm (Q-80 answered: yes).
   - **3B:** when you're outbid or the auction extends, the header and bid bar change state, with one vibration.
   - **4A + 4B:** winners see the outcome, a 48h countdown, the checklist and the amount due. Every outcome shows a deposit timeline card.
3. **Theme (Q-78): follow the phone's setting.** Both light and dark are designed. Live surfaces stay navy in both.
4. **Logo:** "The Ascent" is **not approved yet**. The stakeholder asked to see the other concepts (A Seked Ladder, B Obelisk Line). Screens use the brand symbol through `docs/design/brand/logo/` so it can be swapped later without redesign.

## Consequences
- Part 2 of the design (the design system, tokens and sprint 1–2 screens) starts in this direction.
- The brand tokens in `docs/design/brand/tokens.css` are the source for colour.
