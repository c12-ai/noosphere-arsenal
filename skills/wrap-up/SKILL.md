---
name: wrap-up
description: SOP for closing out a work session — reconcile the active Trellis task, then report a short heads-up + to-do list. Use when the user says "wrap up", "close the session", "session wrap-up", "let's wrap", or ends a working session.
---

# Wrap up a session (SOP)

Close the session cleanly: reconcile any Trellis task, then hand back a short,
plain-words report of what needs the user's attention and what they should do
next. The report is the deliverable — keep it tight.

## 1. Check for an active Trellis task FIRST

- `python3 ./.trellis/scripts/task.py current` (or the platform's Trellis
  command). Read the result — do not assume from memory.
- **No active task** → skip step 2 entirely. Do NOT invent a task to close, and
  do NOT map this session's work onto an unrelated task that happens to be open.
  State plainly in the report that there was no active task.
- **An active task exists** → confirm the session's work actually belongs to it
  before touching it. If the work was unrelated (e.g. a different branch /
  feature than the task describes), say so and leave the task alone.

## 2. Close the task via the Trellis workflow (only if step 1 found a real match)

- Follow the project's Trellis finish flow, not manual guesses. If a command
  exists, prefer it: `/trellis:finish-work` (or `trellis-check` →
  `trellis-update-spec` → commit → wrap-up, per the repo's `.trellis/workflow.md`).
- Never advance or archive a task while a required gate is red or a check was
  skipped. If something blocks closing, stop and put it in the heads-up list —
  do not close around it.
- Closing a task is not permission to push or open a PR. Do those only if the
  user asked in this session.

## 3. Report back — two lists, plain words

Lead with the result in one line, then exactly these two sections. Short common
English, one idea per line, no jargon walls. Put detail below only if needed.

### Heads-up (things to keep an eye on)
- Real risks, blockers, unpushed commits, red/pending checks, intentional
  overrides that break a normal contract, anything skipped or degraded.
- One line each. If there is nothing, say "Nothing — clean."

### To-do (what the user should do next)
- Concrete next actions, in order. e.g. push + open PR, review a decision,
  answer an open question, run a bench step.
- One line each. If there is nothing, say "Nothing pending."

## Rules

- Report faithfully (fail loud): if tests failed, a step was skipped, or work is
  uncommitted, it goes in Heads-up — never smooth it over.
- Do not create a Trellis task, push, or open a PR unless the user asked.
- Verify state live (git status, `task.py current`, PR/check state) before
  reporting it — do not report from memory of earlier in the session.
