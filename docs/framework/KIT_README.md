# Claude kit: AI delivery framework (React + Supabase)

Copy everything in this folder into the root of a new product repo, then:

1. Put the stakeholder PRD in `docs/PRD.md`.
2. Open Claude Code in the repo and run `/kickoff`.
3. Approve the plan and design, then run `/run-story ST-001` per story.
4. Validate on staging and reply with `/feedback ST-001 accepted` or `/feedback ST-001 <your comments>`.
5. Every two weeks: `/sprint close`, then `/sprint plan`.

Contents: `CLAUDE.md` (the framework), `.claude/agents/` (10 agents with seniority personas), `.claude/commands/` (kickoff, run-story, feedback, sprint), `backlog/` and `prompts/` templates.
