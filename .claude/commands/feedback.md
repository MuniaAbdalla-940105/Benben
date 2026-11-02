---
description: Record stakeholder validation for a story — accept it or reopen with feedback
argument-hint: ST-### accepted | ST-### <feedback text>
---

Stakeholder validation: $ARGUMENTS

- If it says accepted (or no feedback): set the story to `accepted`, add a History line, update BACKLOG.md.
- Otherwise: add the feedback under `## Feedback` with today's date, create bug files for defects, set `reopened`, increase `loops`, and route to the owning agent with a new prompt. Then continue with `/run-story` for that story.
