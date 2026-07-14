# Noosphere Arsenal

A shared arsenal of reusable agent skills, protocols, and workflows.

## Skills

- `prd`: PRD routing and maintenance rules for BIC Production PRDs and Project PRDs.
- `bump-version`: Version bump SOP for uv-managed repositories.
- `raise-issue`: SOP for raising a GitHub issue with full metadata (assignee, labels, type, project, milestone), all discovered live from the target repo.
- `wrap-up`: SOP for closing a work session — reconcile the active Trellis task, then report a short heads-up + to-do list.

## Install

Install into a project with the [skills CLI](https://skills.sh) — skills are vendored
into `.agents/skills/` and symlinked into each agent directory, pinned in
`skills-lock.json`:

```bash
npx skills add c12-ai/noosphere-arsenal            # pick skills interactively
npx skills add c12-ai/noosphere-arsenal --all      # install everything
npx skills add c12-ai/noosphere-arsenal -l         # list available skills
```

To restore a project's pinned skills from its `skills-lock.json`:

```bash
npx skills experimental_install
```

## Update

```bash
npx skills update
```
