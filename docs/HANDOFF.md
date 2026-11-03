# Orchestrator handoff (2026-11-03)

Start a new orchestrator session with: **"Read docs/HANDOFF.md and CLAUDE.md, then wait for my go."** The previous session was too long to keep using cheaply.

## Product and plan
- BEN-BEN: an auction-first real-estate app for Egypt. Stakeholder: Munia Abdalla. Arabic RTL first, plus English; EGP stored as piasters.
- **Active plan: Basic v1** (ADR-006, `backlog/BASIC-V1.md`). All five sections plus the admin in a basic form, on mocks (payments, KYC, SMS). Packages run **one at a time**: B1 → B2 → B3 → B4 → B5 → B6. Prompts are in `prompts/BASIC-V1/`.
- The full 55-story Phase 1 backlog (`backlog/BACKLOG.md`, `backlog/stories/`) is the detailed source behind Basic v1.

## Decisions (all in `docs/decisions/`)
| ADR | What |
|---|---|
| 001 | React + Supabase; web app / PWA first; mock providers |
| 002 | Architecture: row-lock bids, Realtime broadcast, pg_cron, double-entry ledger, RLS model |
| 003 | Design: direction B (Ivory Ledger) + C live stage; UX options 1A/2B/3B/4A+4B; theme follows the phone; logo "The Ascent" approved |
| 004 | Bid sanity cap of 100 increments (`BID_TOO_HIGH`); realtime capacity decided after a load test; fonts Plex Arabic + Readex + Inter |
| 005 | Staging: Supabase Pro in eu-central-1 + Cloudflare Pages (proposed; **awaiting stakeholder approval**) |
| 006 | Basic v1 scope and cuts; the orchestrator merges package PRs when green |
| 007 | How Edge Functions access the DB and read `runtime_env` |

## Rules the stakeholder set (in `CLAUDE.md`)
- **Do not auto-continue:** ask before starting any session, merging, or scheduling check-ins.
- Token rules: no sub-agents in packages, Sonnet everywhere (Opus only for the B2 and B3 security reviews), sequential packages, short reports, no screenshots unless asked.
- Meaningful branch and commit names (Conventional Commits).

## Status
- Merged to `main`: the kickoff (#1), the merge policy (#2), ST-001 foundation with 9 CI checks (#3), the Basic v1 plan (#4), token saving (#5), and this lean setup.
- **B1** (session "BV1-B1 …", branch `bv1-b1-shell-auth-core-schema`) hit the usage limit at start and built **nothing**. Next step when the stakeholder says go: restart B1 (send it a message, or start a fresh session on Sonnet with `prompts/BASIC-V1/B1-shell-auth-core-schema.md`).
- Nothing else is running.

## Waiting on the stakeholder
1. Supabase project `benben-staging` (Pro, eu-central-1).
2. GitHub environments `staging` and `preview` with their secrets.
3. Repository variables `STAGING_PROJECT_REF`, `STAGING_SUPABASE_ANON_KEY`, `CLOUDFLARE_ACCOUNT_ID`.
4. Branch protection on `main`, and `main` set as the default branch.
5. Approval of ADR-005.

The checklist is in PR #3. Until these are done there is no clickable staging link.

## Open risks before any real-money launch
- Legal: online auctions, deposit forfeiture, e-signature (Q-01 to Q-10).
- CBE stored-value licence (Q-05).
- Data residency, since Supabase has no Egypt region (Q-06).
- Escrow partner and real vendors.
- Trademark search for BEN-BEN.

## Useful links
- Status board: https://claude.ai/artifact/UtCj8yyQaaGJP8B3f3riQf (owned by the old session; republish from the new one with its `url`).
- Repo: https://github.com/MuniaAbdalla-940105/Benben
