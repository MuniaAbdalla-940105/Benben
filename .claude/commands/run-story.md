---
description: Take one story through the per-story cycle up to awaiting-validation, in its own session, branch and PR
argument-hint: ST-###
---

Run the per-story cycle in CLAUDE.md for story $ARGUMENTS. Follow the "One story = one session = one branch = one PR" rule.

**If you are the orchestrator session:**
1. Check the Ready gate, and check that every story this one depends on is merged to `main`. If either fails, list what is missing and stop.
2. Generate `prompts/$ARGUMENTS/<agent>.md` for each agent the story needs, from `prompts/_templates/agent-prompt.md`. Choose seniority by the rule in CLAUDE.md (risk: high → principal/staff). Commit the prompts to `main` through the kickoff/sprint branch.
3. Start a new cloud session titled `$ARGUMENTS <story title>`, checked out from `main`, with outcome branch `st-###-<what-it-delivers>` (the name in the story's History line). Its first message is: "You are the story session for $ARGUMENTS. Run /run-story $ARGUMENTS as the story session."
4. Set the story to `in-progress`, record the session link and branch in the story's History, and update BACKLOG.md.

**If you are the story session:**
1. Work only on the story branch. Commit by the naming rules.
2. Delegate the build: frontend and backend in parallel when the contract exists; integration and AI when needed. Update the story status at each step.
3. Review: `solution-architect`, plus `security` (always for risk: high). On findings: log them, increase `loops`, set `reopened`, and send the work back to the owner.
4. QA: `qa-engineer`. On bugs: write bug files, set `reopened`, and send back to the owner; then run review and QA again.
5. Escalate to the stakeholder at loops = 3 or for a blocker older than one working day.
6. At the Done gate: open the PR `$ARGUMENTS <title>` into `main`, using the body from CLAUDE.md. Set `awaiting-validation`, and tell the stakeholder the PR link, the preview URL and what to check. Do not merge.
