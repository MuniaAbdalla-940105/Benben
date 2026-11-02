---
description: Take one story through the per-story cycle up to awaiting-validation
argument-hint: ST-###
---

Run the per-story cycle in CLAUDE.md for story $ARGUMENTS.

1. Check the Ready gate. If it fails, list what is missing and stop.
2. For each agent the story needs, generate `prompts/$ARGUMENTS/<agent>.md` from `prompts/_templates/agent-prompt.md`, choosing seniority by the rule in CLAUDE.md (risk: high → principal/staff).
3. Delegate build work (frontend and backend in parallel when the contract exists; integration and AI when needed). Update the story status at each step.
4. Review: `solution-architect`, plus `security` (always for risk: high). On findings: log, increase `loops`, set `reopened`, send back to the owner.
5. QA: `qa-engineer`. On bugs: bug files, `reopened`, back to the owner; then review and QA again.
6. Escalate to the stakeholder at loops = 3 or a blocker older than one working day.
7. At the Done gate: set `awaiting-validation`, update BACKLOG.md, and tell the stakeholder the staging link and what to check.
