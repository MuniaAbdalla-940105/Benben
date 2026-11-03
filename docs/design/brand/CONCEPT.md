# BEN-BEN brand identity: concept and usage

- Version 1.0, 2026-11-02. Owner: `ui-ux-designer`. Status: for stakeholder review.
- Binding input: `BRAND_IDENTITY_BRIEF.md` ("Ancient Value. Modern Legacy.").
- Presentation: `brand-presentation.html` (open in a browser; self-contained apart from Google Fonts).

## 1. The story
In the Heliopolis creation myth, the Benben is the first mound of land to rise from the waters of Nun. It is the origin of all ground, and it gives its shape to the gilded capstone of every pyramid. BEN-BEN turns that first piece of ground into the modern property market, where value is found in public, in 24 hours, one step at a time.

The symbol, **The Ascent**, tells this in three beats:
1. **Ancient value:** the Benben capstone, drawn at the true 51.84° slope of the Great Pyramid.
2. **Modern form:** the capstone becomes the crown of a building, and one vertical cut splits it into two slabs with sloped crowns. It reads as architecture, not a monument.
3. **Modern legacy:** the right half (the tower) rises exactly one step above the left half (the stone), and it is gold. That step is the bid: every auction moves value up from where it started.

## 2. Three explorations
| | A. Seked Ladder | B. Obelisk Line | C. The Ascent (chosen) |
|---|---|---|---|
| Idea | The capstone's left face is a staircase of bid increments that ends in a gilded tip. | A slim tower crowned by a gold pyramidion, with an ascending cut through the body like a price line. | The capstone split in two; the tower half lifts one step above the stone. |
| Why it could be ownable | Literal and easy to explain. | Strong tower read; works as a map pin. | Nobody in proptech uses a split capstone. One idea, two flat shapes, one gap. |
| Small-size test (29 / 16 px) | Steps merge into a plain triangle with a fleck of gold, which is the tourist pyramid we must avoid. | The rising cut is a hairline and disappears below 40 px. It reads as an obelisk or a lighthouse. | Holds: the 16 px favicon still shows two blocks with one higher, and the gold half stays distinct. |
| Cliché risk | High (step pyramid, "growth" stairs). | Medium-high (obelisk, souvenir). | Low, as long as the gap and the step are kept. |

Files: `explorations/a-seked-ladder.svg`, `explorations/b-obelisk-line.svg`, `explorations/c-the-ascent.svg` (concept sketches, not for production). The pixel-zoom evidence is embedded in the presentation.

**Why C wins.** It is the only route where all three meanings (stone, tower, bid) come from one geometric move instead of added detail, so it stays simple enough for an app icon. A and B each add a third element (stairs, a cut) to carry the auction idea, and that element is exactly what disappears at 16 px.

**A risk we checked and fixed.** In early sketches, two triangular halves with short walls read as a **sailboat**. The fix was to give both halves tall vertical walls (a 2:3 box), so they read as buildings. The rule "do not shorten the walls" is in the don'ts.

## 3. Construction (`logo/symbol.svg`, 48 × 72 units)
- Stone (left): `M0 72V42L22 14V72Z`. Tower (right): `M26 72V0L48 28V72Z`. Two paths, 8 points, no curves.
- **Slope 51.84°** = rise:run 14:11, the Egyptian *seked* of 5½ palms per cubit (the Great Pyramid). Each half is 22 wide and its crown rises 28.
- **Step = 14 units = half the crown height.** A smaller step looks like a mistake; a larger one breaks the memory of the capstone.
- **Gap = 4 units (1/12 of the width).** It survives at 29 px. The 16/32 px favicon is a hinted redraw with a gap of 1 px at 16 px.
- **Box 48 × 72 = 2:3.**
- **Colour logic:** the stone is ivory on navy (navy on light grounds); the lifted tower is always gold, because the Benben capstone was gilded.

## 4. Wordmark (`logo/wordmark.svg`)
- Reads exactly **BEN-BEN**, hyphen included, in every lockup.
- Custom geometric sans drawn from scratch as SVG outlines on a 100-unit cap grid (stems 18, horizontal bars 16), so no font is needed. **Outfit** (Google Fonts) was the proportion reference and is the companion text face.
- Custom touches, all from the seked:
  - **E:** every arm ends in a 51.84° cut, parallel to the stone's rising face.
  - **N:** the left shoulder is cut at the seked, a small copy of the stone half.
  - **Hyphen = the gold step:** a parallelogram with seked ends, in gold in two-colour versions.

## 5. Arabic subtitle "مزاد عقارات"
- Set in **Readex Pro Medium (500)** from Google Fonts, then outlined in the SVGs (shaped with HarfBuzz).
- Why: Readex Pro is a geometric, monoline Arabic with a low-contrast, Kufi-leaning skeleton, designed as a companion to Lexend. Its even stroke and flat terminals match the wordmark, so the two scripts feel like one voice. It is also the recommended Arabic UI face.
- Lockup: centred under the wordmark at 56 % of its width, between two gold hairlines.

## 6. App icon
| File | Spec |
|---|---|
| `app-icon/ios-1024.svg` | 1024 master, full-bleed navy `#0B1530` (iOS applies the mask). Symbol 560 px tall (55 %), raised 8 px optically. Ivory stone, gold tower. Export a PNG without alpha for App Store Connect. |
| `app-icon/android-foreground.svg` | 108 dp canvas; symbol 40 dp tall, centred, fully inside the 66 dp safe circle. |
| `app-icon/android-background.svg` | 108 dp flat navy. |
| `app-icon/android-monochrome.svg` | Extra: Android 13+ themed icon layer. |
| `app-icon/favicon.svg` | 32-unit grid, hinted for 16 px (wider gap, 10:8 crown), navy rounded square. |

Previews in the presentation: 180, 120, 60, 40 and 29 px, the 16 px favicon, Android circle, squircle, rounded and square masks, and mock iOS and Android home screens.

## 7. Lockups and files
| Lockup | Light ground (default) | On navy | One colour |
|---|---|---|---|
| Symbol | `logo/symbol.svg` | `logo/symbol-on-navy.svg` | `logo/symbol-mono.svg` (navy), `symbol-gold.svg`, `symbol-white.svg` |
| Wordmark | `logo/wordmark.svg` | `logo/wordmark-on-navy.svg` | `wordmark-gold.svg`, `wordmark-white.svg` |
| Horizontal | `logo/lockup-horizontal.svg` | `logo/lockup-horizontal-on-navy.svg` | `-gold`, `-white` |
| Stacked | `logo/lockup-stacked.svg` | `logo/lockup-stacked-on-navy.svg` | `-gold`, `-white` |
| Wordmark + Arabic | `logo/lockup-arabic.svg` | `logo/lockup-arabic-on-navy.svg` | `-gold`, `-white` |

The default files use navy + antique gold `#A27E3E` for light grounds. The `-on-navy` files use ivory + champagne gold `#C8A464`. All files are transparent with flat fills.

Proportions: in the horizontal lockup the symbol is 1.6 × the cap height, with a gap of 0.56 × the cap height, centred vertically. In the stacked lockup the symbol is 2.4 × the cap height, with a gap of 0.64 × the cap height.

## 8. Usage rules
**Clear space:** X = half the wordmark cap height (equal to one symbol half-width in the horizontal lockup). Keep X clear on every side. For the symbol alone, use X = its half-width.

**Minimum sizes**
| Asset | Digital | Print |
|---|---|---|
| Symbol | 24 px tall (below that, use the favicon artwork, down to 16 px) | 6 mm |
| Horizontal lockup | 120 px wide | 30 mm |
| Stacked lockup | 72 px wide | 20 mm |
| Wordmark | 80 px wide | 20 mm |
| Wordmark + Arabic | 140 px wide | 35 mm |

**Do:** use the primary version on midnight navy; use navy + antique gold on ivory or white; use one-colour white on photos under a 55 % navy overlay; use one-colour gold for foil and embossing; switch to the favicon artwork below 24 px.

**Don't:** rotate or tilt the symbol; close the gap or level the halves (that makes a plain pyramid); shorten the walls (that makes a sail); swap the colours (gold is always the taller half); add gradients, bevels, glows or 3D; drop or restyle the hyphen; stretch the wordmark or retype it in a live font; set champagne gold text on ivory; place the logo on busy photos without an overlay.

## 9. Palette and contrast
Tokens are in `tokens.css`, with a Tailwind mapping in its header.

| Token | Hex | Role |
|---|---|---|
| `--bb-navy-950` | #070E1F | deepest ground (splash, footer, overlays) |
| `--bb-navy-900` | #0B1530 | brand navy |
| `--bb-navy-800` / `-700` | #14213F / #22305A | raised surfaces on navy |
| `--bb-charcoal-900` | #1C1F26 | neutral dark alternative |
| `--bb-gold-300` | #E4CE9C | light champagne |
| `--bb-gold-500` | #C8A464 | brand gold (flat) |
| `--bb-gold-600` | #A27E3E | antique gold, graphics on ivory |
| `--bb-gold-700` | #846429 | deep gold, text on ivory |
| `--bb-ivory-50` / `-100` / `-200` | #FBF8F2 / #F6F1E7 / #ECE4D3 | light grounds |
| `--bb-stone-100…900` | #E7E4DD … #24231F | warm neutrals |
| `--bb-gold-brushed` | gradient | marketing only |
| `--bb-live-600` | #C9302C | proposed LIVE signal |

| Pair | Ratio | Result | Use |
|---|---|---|---|
| gold-500 on navy-900 | 7.69:1 | AAA | wordmark hyphen, timers, bid amounts on navy |
| gold-300 on navy-900 | 11.69:1 | AAA | secondary text on navy |
| ivory-100 on navy-900 | 16.02:1 | AAA | body text on navy |
| navy-900 on ivory-100 | 16.02:1 | AAA | body text on ivory |
| navy-900 on gold-500 | 7.69:1 | AAA | navy text on a gold button |
| gold-700 on ivory-100 | 4.86:1 | AA | gold text on ivory |
| gold-600 on ivory-100 | 3.34:1 | 3:1 non-text | symbol and hyphen on ivory, never text |
| gold-500 on ivory-100 | 2.08:1 | Fail | never for text or meaning |
| stone-600 on ivory-100 | 5.00:1 | AA | muted text on ivory |
| stone-300 on navy-900 | 10.38:1 | AAA | muted text on navy |
| white on live-600 | 5.33:1 | AA | LIVE badge |

## 10. How the brand meets the product
The mark stays still and premium. Energy lives in the auction UI: the LIVE badge (pulsing dot, stopped when reduced motion is on), countdowns, and the bid step (the hyphen shape is reused as the bid-increment glyph). This follows the orchestrator note in the brief and `STAKEHOLDER_VISION.md`.

## 11. Open questions for the stakeholder
1. **Approve "The Ascent"** as the symbol, or ask for a refinement of A or B.
2. **Live signal colour:** the mark uses no red, but the auction UI needs a LIVE colour. Proposed `#C9302C`. Confirm, or let the UI direction options decide.
3. **Navy or charcoal** as the primary dark ground. Proposed: navy primary, charcoal secondary.
4. **Arabic name:** the subtitle is the descriptor "مزاد عقارات". Do you also want a transliterated Arabic wordmark "بن-بن" for Arabic-only contexts (store listing, billboards)?
5. **Tagline in Arabic:** proposed "قيمة عريقة. إرث حديث." for "Ancient Value. Modern Legacy." Please confirm the wording.
6. **Trademark:** a clearance search for the symbol and the name BEN-BEN in Egypt (and the GCC, if planned) is recommended before production use.
