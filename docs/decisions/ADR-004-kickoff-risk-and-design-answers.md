# ADR-004: Stakeholder answers on architecture risks and design questions

- Status: **accepted** (stakeholder decision) · Date: 2026-11-03 · Decided by: Munia Abdalla
- Inputs: `docs/decisions/ADR-002-architecture.md` §16, and `docs/PRD-questions.md` group I

## Decisions
1. **R1, Realtime capacity:** decide after the load test. ST-012 measures by 2026-11-15. The stakeholder then chooses between Supabase Enterprise and a dedicated fan-out service in sprint 2–3.
2. **R4, bid sanity cap: accepted.** A bid more than `bid.max_increments_above_min` increments above the minimum (default **100**, set by admin per auction) is rejected with `BID_TOO_HIGH`. This is on top of the AU-05 confirmation sheet. It applies to ST-010, ST-011 and ST-015.
3. **Q-85 accepted:** IBM Plex Sans Arabic for body text, Readex Pro for headlines, and Inter with tabular figures for Latin text and numbers.
4. **Q-86 accepted:** the countdown ring has a gold frame, and the arc and label turn green, amber and red as time runs out.
5. **Q-87 accepted:** the admin uses each staff member's saved language, Arabic by default.

R2 (data residency), R3 (CBE licence), R5 (anon realtime auth) and R6 (JWT expiry) stay open with the ADR-002 proposals.
