# AI Delivery Framework (React + Supabase)

This repo is built by a team of Claude agents. Stakeholders (humans) give requirements, set priorities and accept work. The backlog lives as files in `backlog/`. There is no Jira and no management layer.

## Roles

- **Stakeholders (humans):** write the PRD, answer questions, validate stories on staging, approve sprint plans and releases. Only a stakeholder merges to `main`.
- **Main Claude Code session = product owner and orchestrator.** It follows `.claude/agents/product-owner.md`, keeps the backlog, writes the task prompt for each agent, delegates to subagents, and reports to stakeholders.
- **Subagents** in `.claude/agents/`:

| Agent | Owns |
|---|---|
| `product-owner` | PRD analysis, epics, stories, acceptance criteria, sprint plan and timeline |
| `ui-ux-designer` | Design brief, design system, HTML prototypes, UX review of built screens |
| `solution-architect` | Architecture, data contract (tables, RLS, generated types), code review |
| `react-frontend` | React + TypeScript screens from the HTML handoff |
| `supabase-backend` | Postgres schema, migrations, RLS, auth, storage, edge functions |
| `ai-engineer` | AI features, prompts, evaluation sets, cost and quality |
| `integration` | Third-party connectors, webhooks, payment and KYC providers, mocks |
| `security` | Access control, data protection, RLS audit, dependency checks |
| `qa-engineer` | Test plans, automated and regression tests, bug reports |
| `devops` | CI, Supabase staging project, migrations pipeline; Docker later |

## Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, React Router, Vitest, Playwright.
- Backend: Supabase (Postgres, Auth, Storage, Realtime, Edge Functions), `supabase-js` with generated types.
- AI: Python service or edge functions; pgvector for search.
- Change the stack only with a stakeholder decision recorded in `docs/decisions/`.

## Repo layout

```
docs/PRD.md                 stakeholder PRD (input, never edited by agents)
docs/design/                design brief, design system, HTML prototypes
docs/decisions/             architecture decision records (ADR-001-*.md)
backlog/BACKLOG.md          epics, sprint plan, timeline, status board
backlog/stories/ST-###.md   one story per file
backlog/bugs/BUG-###.md     one bug per file, linked to its story
prompts/ST-###/<agent>.md   generated task prompt for each agent on a story
supabase/migrations/        all schema changes
src/                        React app
ai/                         AI services and eval sets
```

Templates are in `backlog/_templates/` and `prompts/_templates/`.

## Kickoff (from a PRD)

Run `/kickoff` after the stakeholder puts the PRD in `docs/PRD.md`:

1. `product-owner` reads the PRD and writes open questions to `docs/PRD-questions.md`. Stop and ask the stakeholder if anything blocks planning.
2. `product-owner` writes epics and stories into `backlog/`, then a sprint plan and timeline in `BACKLOG.md`.
3. Orchestrator generates the design prompt `prompts/DESIGN/ui-ux-designer.md` from `prompts/_templates/design-prompt.md`, filled from the PRD (see Prompt generation).
4. `ui-ux-designer` writes `docs/design/DESIGN_BRIEF.md`, the design system, and HTML prototypes for sprint 1 stories.
5. `solution-architect` writes the architecture ADR and the data contract for sprint 1.
6. Orchestrator shows the stakeholder the plan, the timeline and the design, and waits for approval before any build.

## Prompt generation (every handoff)

Never delegate with a one-line instruction. Before each handoff the orchestrator writes `prompts/ST-###/<agent>.md` from `prompts/_templates/agent-prompt.md` and passes its content to the subagent. Each prompt must contain:

1. **Role and seniority.** Pick the level from the table below and write the persona as a real expert: years of experience, domain, what they are known for. Example: "You are a principal product designer with 15 years in marketplace and fintech products, known for clear bidding flows and accessible, RTL-ready interfaces."
2. **Context:** product goal, the user, the story, links to PRD sections and design files.
3. **Task:** what to produce, in concrete terms.
4. **Inputs:** exact file paths to read.
5. **Constraints:** stack, design system, guardrails, out of scope.
6. **Acceptance criteria:** copied from the story, plus technical criteria.
7. **Deliverables:** files to create or change, and the report format.
8. **Self-check:** what the agent verifies before reporting done.

| Seniority | Use for |
|---|---|
| Principal / Staff | Architecture, security, data contract, design system, AI evaluation, anything with money or legal risk (bidding, payments, KYC) |
| Senior | Normal feature stories, integrations, QA plans |
| Mid | Small, well-specified changes: copy, styling fixes, simple CRUD |

Design prompts get the most detail. The `ui-ux-designer` prompt must also state the target users and their context, brand and tone, platforms and breakpoints, languages and RTL, accessibility level (WCAG 2.2 AA), the screens and every state (empty, loading, error, success, permission denied), and reference products the stakeholder named in the PRD.

## Per-story cycle

Statuses (field `status:` at the top of each story file):

`backlog → ready → in-progress → in-review → in-qa → awaiting-validation → accepted → released`, plus `reopened`.

1. **Ready gate (Definition of Ready):** user story and acceptance criteria written; design or HTML attached; schema and RLS drafted if data is involved; dependencies (integration, AI) named; fits one sprint; test approach noted.
2. **Design and data contract:** UI/UX HTML handed over; architect agrees tables, RLS policies and generated TypeScript types. Frontend and backend then build in parallel.
3. **Build:** `react-frontend` and `supabase-backend`, plus `integration` or `ai-engineer` when the story needs them. Work on a branch `st-###-short-name`.
4. **Code and security review:** `solution-architect` and `security`. Changes requested → log in the story, set `reopened`, back to the author.
5. **QA:** `qa-engineer` tests against acceptance criteria. Bug → create `backlog/bugs/BUG-###.md`, set the story `reopened`, assign the owning agent. Review and QA run again after every fix.
6. **Done gate (Definition of Done):** acceptance criteria met; reviewed; security check and RLS tests passed; unit and API tests green in CI; QA evidence linked in the story; deployed to staging; docs and release-note line updated. Then set `awaiting-validation` and notify the stakeholder with the staging link and what to check.
7. **Human validation:** no feedback → `accepted`. Feedback → record it in the story under `## Feedback`, set `reopened`, route to the owning agent.

**Escalation:** a third loop on the same story, or a blocker older than one working day, goes to the stakeholder with a short summary from the orchestrator. Agents never loop forever.

## Sprint cycle (two weeks)

Sprint planning (orchestrator proposes, stakeholder approves) → sprint (per-story cycle, status updated in `BACKLOG.md`) → backlog reprioritized → release decision (stakeholder approves) → retrospective (update agent files and this file with lessons) → next sprint.

## Guardrails

- Every piece of work has a story or bug file and exactly one owning agent.
- Agents work on branches. Only a stakeholder merges to `main` and approves releases.
- Every bug fix adds a regression test.
- Traceability: PRD section → epic → story → prompt → branch/PR → test evidence → release.
- Row-level security is on for every table. The service-role key never reaches the browser.
- Schema changes are Supabase migrations in Git, never manual edits in the dashboard.
- Money, bids and other critical writes go through server-side functions, never direct client inserts.
- No real or production data in agent environments.
- Never edit `docs/PRD.md`. Ask questions in `docs/PRD-questions.md`.
- QA and validation run on staging, never on a developer build.

## Metrics (reviewed each sprint, in BACKLOG.md)

Sprint goal delivered · cycle time (ready → accepted) · first-pass QA rate · reopen rate · escaped defects · escalations · AI cost per story.
