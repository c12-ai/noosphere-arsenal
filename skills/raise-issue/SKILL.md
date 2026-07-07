---
name: raise-issue
description: SOP for raising a GitHub issue in any repo, with full metadata — assignee, labels, type, project, milestone — discovered live from the target repo, never hardcoded. Use when the user says "raise an issue", "open an issue", "file an issue", or "create an issue".
---

# Raise an issue (SOP)

Every issue ships fully triaged: assignee, label(s), type, project, and
milestone. Never leave them blank, and never hardcode their values in this
skill or from memory (e.g. a specific project or milestone name) — repos and
orgs differ; discover everything live at raise time.

## 1. Resolve the target repo

- Explicit repo in the request wins; otherwise `gh repo view --json nameWithOwner`
  in the relevant working directory.
- Pass `-R <owner>/<repo>` on every `gh` call so the SOP works from any cwd.

## 2. Discover metadata live (never hardcode)

- Labels: `gh label list -R <owner>/<repo> --json name,description`
- Issue types (org-level): `gh api orgs/<org>/issue-types --jq '.[].name'`
- Projects (org-level): `gh project list --owner <org>`
  (needs the `project` scope — if it fails, `gh auth refresh -s project`)
- Milestones: `gh api repos/<owner>/<repo>/milestones --jq '.[] | .title + " (" + .state + ")"'`

## 3. Choose the metadata

- **Assignee**: `@me` unless the user names someone else.
- **Labels** — pick from the LIVE list only; never create a label. Where the
  repo uses the c12 6-label taxonomy (verified 2026-07-07 on
  c12-ai/BIC-agent-service), the semantics are:
  - `urgent` — serious blocking bug, needs immediate attention
  - `bug` — any issue, non-blocking
  - `enhancement` — new feature or request
  - `question` — further information is requested
  - `GTH` — good to have, non-blocking if absent
  - `forced-merge` — PR-flow label (PR opened despite mech-gap critique);
    almost never correct on an issue — apply only if explicitly asked
  Repos not yet migrated to this taxonomy keep GitHub defaults — pick the
  closest match from whatever `gh label list` returned.
- **Type** — map from the issue's nature to the org's live type list
  (typically `Bug` / `Feature` / `Task`): blocking or non-blocking defect →
  Bug; enhancement/request → Feature; chore/work item → Task.
- **Project and milestone** — match against the conversation context. If
  exactly one candidate is clearly active for this work, use it; if none or
  several are plausible, ask the user — never guess, and never fall back to a
  remembered name.

## 4. Create the issue

```bash
gh issue create -R <owner>/<repo> \
  -t "<title>" -F <body-file> \
  -a @me -l <label> -m "<milestone>" -p "<project title>"
```

- Title: imperative, specific, no trailing period.
- Body: what happens / evidence (logs, links, commits) / expected behavior.
  State unknowns explicitly rather than padding.

## 5. Set the issue type

`gh issue create` has no type flag (gh 2.92.0, verified 2026-07-07) — set it
via REST after creation:

```bash
gh api -X PATCH repos/<owner>/<repo>/issues/<number> -f type=<Type>
```

## 6. Verify

- `gh issue view <number> -R <owner>/<repo> --json assignees,labels,milestone,projectItems,title,url`
  and `gh api repos/<owner>/<repo>/issues/<number> --jq '.type.name'`
- Confirm every field chosen in step 3 is actually set; fix any that is
  missing before reporting. Report the issue URL plus the final
  assignee/labels/type/project/milestone.
