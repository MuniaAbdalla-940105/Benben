---
description: Start a product from docs/PRD.md — questions, backlog, plan, design prompt, design, data contract
---

Run the Kickoff steps in CLAUDE.md for the PRD at `docs/PRD.md` $ARGUMENTS.

1. Delegate to `product-owner`: analyze the PRD, write `docs/PRD-questions.md`. If any question blocks planning, stop and ask the stakeholder with AskUserQuestion.
2. Delegate to `product-owner`: epics, stories, sprint plan and timeline in `backlog/`.
3. Generate `prompts/DESIGN/ui-ux-designer.md` from `prompts/_templates/design-prompt.md`, filling every field from the PRD with a principal-level persona matched to the product's domain.
4. Delegate to `ui-ux-designer` with that prompt.
5. Delegate to `solution-architect`: architecture ADR and data contracts for sprint 1 stories.
6. Present to the stakeholder: sprint plan, timeline, design brief, screens, open questions. Wait for approval before any build.
