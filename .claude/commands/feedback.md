---
description: Record stakeholder validation for a story — accept it or reopen with feedback
argument-hint: ST-### accepted | ST-### <feedback text>
---

Stakeholder validation: $ARGUMENTS

- If it says accepted: check that CI is green on the story PR, merge it into `main` (merge commit), set the story to `accepted`, add a History line with the merge SHA, update BACKLOG.md, and start any story that was waiting on it.
- Silence is not acceptance: never merge without an explicit "accepted" from the stakeholder.
- Otherwise: add the feedback under `## Feedback` with today's date, create bug files for defects, set `reopened`, increase `loops`, and route to the owning agent with a new prompt. Then continue with `/run-story` for that story.
