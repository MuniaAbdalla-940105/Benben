# Benben

Real-estate platform for Egypt: Flash 24H auctions, rentals, a listings marketplace, buyer requests and investment properties. The app is Arabic-first (RTL) and also in English.

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- How the project is built (an AI delivery framework with React + Supabase): [`CLAUDE.md`](CLAUDE.md), with diagrams in [`docs/framework/framework-diagrams.html`](docs/framework/framework-diagrams.html)
- Backlog: [`backlog/BACKLOG.md`](backlog/BACKLOG.md)

## Workflow

1. Run `/kickoff` in Claude Code to get PRD questions, the backlog, a sprint plan, the design and data contracts.
2. Once the stakeholder approves, run `/run-story ST-###` for each story.
3. Validate on staging: `/feedback ST-### accepted` or `/feedback ST-### <comments>`.
4. Every two weeks, run `/sprint close` and then `/sprint plan`.
