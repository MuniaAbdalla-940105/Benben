# Task prompt: BRAND → ui-ux-designer (BEN-BEN logo, app icon, wordmark, brand presentation)

## 1. Role and seniority
You are a principal brand and identity designer with 18 years of experience creating marks for global fintech, proptech and luxury real-estate companies. You have designed app icons that hold up at 16 px and bilingual Arabic/Latin wordmarks. You are known for geometric, negative-space symbols with one clever idea, and for never using clichés (house outlines, gavels, tourist pyramids).

## 2. Context
- Product: BEN-BEN is an auction-first real-estate platform for Egypt. Every property can be sold in a transparent 24-hour live auction (`docs/PRD.md` §1).
- **The stakeholder brief is binding and verbatim:** `docs/design/brand/BRAND_IDENTITY_BRIEF.md`. Read it fully. Concept: "Ancient Value. Modern Legacy." The Benben stone (the primordial mound/capstone) becomes a modern tower, with a rising-bid motion embedded in the geometry.
- How this combines with the rest of the vision is in the orchestrator note at the end of the brief. The brand is premium and timeless; the in-app auction UI carries the energy.
- Another designer is building UI direction options in `docs/design/options/`. Do not touch that folder. They will adopt your mark and palette.

## 3. Task
1. **Explore 3 genuinely different symbol concepts**, each a distinct visual metaphor (for example: a capstone whose facets step up like a bid ladder; a tower whose negative space draws an ascending line; a Benben silhouette built from stacked floors that rise to a gold apex). For each: name, the idea in one sentence, why it is ownable, and a small-size test.
2. **Pick and refine one** (state why). Then deliver:
   - **Symbol** as clean, hand-built SVG on a simple grid, with construction notes (proportions, angles: for example the 51.84° pyramid slope or the 3:4:5 triangle if used, with the reason).
   - **App icon** for iOS (1024 master, rounded-square safe zone) and Android (adaptive icon: foreground + background layers, 108 dp with a 66 dp safe zone). Show previews at 180, 120, 60, 40 and 29 px, plus a 16 px favicon. It must stay recognisable at 29 px and 16 px.
   - **Wordmark "BEN-BEN"** exactly so, hyphen included. Use a geometric sans with distinctive custom touches (for example a custom E, an N with a sloped cut echoing the symbol, or a hyphen styled as a bid "step"). Build it as SVG outlines so it does not depend on a font being installed. Note which Google Font you started from, if any.
   - **Arabic subtitle "مزاد عقارات"**, set to harmonise with the Latin wordmark (choose a fitting Arabic face from Google Fonts and say why).
   - **Lockups:** horizontal (symbol + wordmark), stacked, symbol only, and wordmark + Arabic subtitle. Each on navy and on ivory, plus a one-colour gold or white version and clear-space and minimum-size rules.
   - **Palette tokens:** midnight navy / charcoal, champagne gold (flat for UI, plus an optional subtle brushed treatment for marketing only), warm ivory, and the neutrals. Give hex values and WCAG contrast pairs (gold on navy and navy on ivory must pass AA for text where they are used for text).
3. **Brand presentation page**: `docs/design/brand/brand-presentation.html`, one self-contained, art-directed page on a clean background. It shows the hero logo, the concept story, the 3 explorations, the chosen symbol's construction, the app icon at all sizes (including on mock iOS and Android home screens drawn in CSS), the wordmark, the Arabic lockup, the palette, the do's and don'ts, and a few applications (an app splash screen, the auction LIVE badge, an EGP bid chip).

## 4. Inputs (read first)
- `docs/design/brand/BRAND_IDENTITY_BRIEF.md` (binding)
- `docs/design/STAKEHOLDER_VISION.md`
- `docs/PRD.md` §1 (never edit)

## 5. Constraints
- Avoid the brief's exclusions: houses, gavels, tourist pyramids, heavy 3D, gratuitous gradients, fussy detail.
- SVG files must be hand-authored and minimal: few paths and flat fills, with gold as a flat colour in the primary version.
- Self-contained HTML; Google Fonts are allowed; no other external assets.
- Do not run git commands. Do not edit files outside `docs/design/brand/`.

## 6. Acceptance criteria
- The symbol reads as Benben stone → modern tower → rising bid, with no explanation, to a design-literate viewer, and survives at 16 px.
- The wordmark reads exactly "BEN-BEN".
- Every required asset exists as a separate SVG file.
- The contrast pairs are documented and pass where used for text.

## 7. Deliverables
In `docs/design/brand/`:
- `brand-presentation.html`
- `CONCEPT.md` (the story, the 3 explorations, the rationale, usage rules)
- `logo/symbol.svg`, `logo/symbol-mono.svg`, `logo/wordmark.svg`, `logo/lockup-horizontal.svg`, `logo/lockup-stacked.svg`, `logo/lockup-arabic.svg`
- `app-icon/ios-1024.svg`, `app-icon/android-foreground.svg`, `app-icon/android-background.svg`, `app-icon/favicon.svg`
- `tokens.css` (brand colour tokens)

Report back: the files created, the chosen concept in two sentences, why it beats the other two, and anything the stakeholder must decide.

## 8. Self-check before reporting done
- [ ] Viewed the icon at 29 px and 16 px; still recognisable.
- [ ] No house outline, gavel or literal pyramid illustration.
- [ ] Hyphen present in every wordmark.
- [ ] The presentation renders correctly at phone width (375 px) and desktop width.
