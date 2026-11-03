# Task prompt: Basic v1 B4 → react-frontend + supabase-backend

## 1. Role and seniority
A senior full-stack engineer with 10 years of experience building property-listing portals (search, filters, media) on Postgres and React, known for fast list pages on 4G. Senior level: normal feature work, with no money moving.

## 2. Context
Basic v1 (ADR-006), **wave 2**. The Marketplace is the fixed-price listing portal (PRD §5). B1 provides `properties`, `media`, areas and the shell. B6 will build the admin approval screen on your `content_submissions` table and functions.

## 3. Task
1. Schema: `listings`, `favorites`, `reports`, and a generic `content_submissions` for review (PRD 8.1.5 F, basic: Submitted → Approved / Changes requested / Rejected), plus `approve_submission()` and `reject_submission()` as admin-only functions. **B5 reuses `content_submissions` for its listing types: design it generically.**
2. **Add listing wizard** (MK-05, basic): type → location (area and compound) → specs → price and payment → photos (at least 5) → submit. Requires T1 (from B1). Drafts autosave. "My Listings" shows status and expires after 30 days.
3. **Explore** (MK-01/MK-02): search, core filters (area, type, price range, bedrooms, size, finishing, delivery, sale type), list view, save.
4. **Listing detail** (MK-03): gallery, price and payment plan, specs, "Request call" lead form (stored), Report ad (MK-06; 3 reports in 7 days → auto-hidden).
5. A "Send to Auction" button that creates a request record for Ops (no conversion flow).

## 4. Inputs
- PRD §5 (read only), stories ST-033–ST-038, `DATA_MODEL.md`, `design-system.md`
- There are no MK prototypes yet: follow the design system and the AU screen patterns, Arabic RTL first.
- `backlog/BASIC-V1.md`, ADR-006

## 5. Constraints
- Branch `bv1-b4-marketplace-listings-approval`. Migrations `<ts>_bv1_b4_*.sql`. Commits end `Refs: BV1-B4`.
- Only approved listings are publicly readable. The owner can see their own drafts. Status changes go only through functions.
- Out of scope: compare, boosts, map, masked calls, duplicate and price-outlier detection, strikes.

## 6. Acceptance criteria
- A T1 user lists a property with 5 photos, and it is not public until an admin function approves it; then it appears in Explore and filters find it.
- 3 reports hide it. Saved listings persist.
- RLS and pgTAP tests pass. CI is green.

## 7. Deliverables
A PR titled `BV1-B4 Marketplace listings with approval`, documenting the `content_submissions` API for B5 and B6.

## 8. Self-check
- [ ] RTL, LTR, light and dark checked. Empty, loading and error states present.
- [ ] Do not merge.
