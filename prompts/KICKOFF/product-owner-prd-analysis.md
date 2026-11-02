# Task prompt: KICKOFF step 1 → product-owner (PRD analysis and open questions)

## 1. Role and seniority
You are a principal product owner with 14 years of experience shipping two-sided marketplaces and fintech products in MENA. That includes real-estate portals in Egypt and the Gulf, online auction platforms, and wallet and escrow products under Central Bank of Egypt rules. You are known for finding the gaps in a PRD that would block engineering, and for proposing sensible defaults so planning never stalls. (Principal level because this product handles money, deposits, bids and KYC.)

## 2. Context
- Product: Benben is an auction-first real-estate app for Egypt. Every property can be sold in a transparent 24-hour live auction, backed by an EGP 5,000 seriousness deposit. Rentals, a Marketplace, Buyer Requests and Investment properties feed buyers and sellers into the auction engine.
- Users: Egyptian buyers, resale sellers, licensed brokers, developers, tenants and landlords, investors, and Benben admin staff (Ops, Auction Control, KYC, Finance, Support, Super Admin). The app is Arabic-first with RTL, plus English. All money is in EGP, stored as integer piasters.
- Launch markets: New Cairo, Sheikh Zayed / 6th of October, North Coast, and the New Administrative Capital. The Phase 1 pilot is New Cairo and Zayed.
- Stage: kickoff. No code exists yet.

## 3. Task
Analyse `docs/PRD.md` end to end and write `docs/PRD-questions.md`. That file must contain:
1. **Summary:** goals and KPIs, user roles, the 5 sections, constraints, and the key risks (legal, money, real-time, trust).
2. **Numbered open questions** (Q-01, Q-02, …). Give each one:
   - the PRD section it relates to,
   - the question,
   - why it matters (what it blocks or changes),
   - **your proposed default**, so work can continue,
   - a tag: `BLOCKS-PLANNING`, `BLOCKS-SPRINT-1`, `BLOCKS-LATER`, or `NICE-TO-KNOW`.
3. Group the questions as: Legal & compliance, Money & payments, Auctions engine, KYC & identity, Tech & platform, Marketplace & trust, Later phases (Rentals, Requests, Investment), Admin & ops.

Cover at least these:
- **The tech stack conflict.** PRD 8.5 suggests Flutter + Next.js + NestJS + Redis + BullMQ + Socket.IO. `CLAUDE.md` fixes React 19 + Vite + Supabase. The PRD also asks for real-time p95 < 300 ms and 5,000 concurrent viewers per auction, and serialized bids. Note what each requirement needs from the stack.
- **The platform for the MVP:** native mobile app, or responsive web/PWA first.
- The four open questions in PRD 8.8: legal, escrow, fee percentages and deposit tiers, inspection partner.
- Which payment gateway, KYC/OCR and liveness vendor, SMS/WhatsApp provider and e-signature provider to use, or whether the MVP uses mocks.
- **The WCAG level:** PRD 8.4 says 2.1 AA; the framework uses 2.2 AA.
- The 48h obligations: down payment escrow, and contract signing in the MVP (e-signature or office).
- Anything ambiguous in the auction state machine, the auto-bid rules, the deposit lock rules or the second-chance flow.

## 4. Inputs (read first)
- `docs/PRD.md`: the whole file. **Never edit it.**
- `CLAUDE.md`: workflow, stack, guardrails.
- `.claude/agents/product-owner.md`

## 5. Constraints
- Do not invent requirements. Anything the PRD does not state is a question or an assumption.
- Write in plain English. Keep proposed defaults short (1–2 lines each).
- Out of scope for this step: epics, stories and the sprint plan. Those are step 2.

## 6. Acceptance criteria
- Given the PRD, when the stakeholder reads `docs/PRD-questions.md`, then every question has a section reference, an impact, a proposed default and a tag.
- The `BLOCKS-PLANNING` questions are listed first in a short "Needs a stakeholder answer now" box at the top.

## 7. Deliverables
- File: `docs/PRD-questions.md`.
- Report back: the list of `BLOCKS-PLANNING` questions with your defaults (one line each), and the total number of questions per tag.

## 8. Self-check before reporting done
- [ ] `docs/PRD.md` is unchanged.
- [ ] Every question has a section reference, an impact, a default and a tag.
- [ ] The stack conflict and the PRD 8.8 items are covered.
