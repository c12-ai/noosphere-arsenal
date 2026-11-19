# Noosphere Arsenal

A shared arsenal of reusable agent skills, protocols, and workflows.

## Skills

- `worklog`: Record research, completed work, or requested to-dos in an Obsidian weekly note through the Obsidian CLI.

- `sop`: Capture a standard operating procedure, check for duplicates, choose its scope, and index it in agent instructions.

- `bic-onsite-ops`: BIC onsite diagnosis, evidence-led LCMS recovery, provider boundaries, and paired Lab demo / Agent test resets.

- `draft-release-notes`: Draft evidence-based BIC release notes in English, Simplified Chinese, or both, with audience-specific product language and full change links.
- `prd`: PRD routing and maintenance rules for BIC Production PRDs and Project PRDs.
- `bump-version`: PR version policy and source-version SOP for uv/Python and package.json/Node repositories.
- `raise-issue`: SOP for raising a GitHub issue with full metadata (assignee, labels, type, project, milestone), all discovered live from the target repo.
- `raise-pr`: SOP for raising/opening a PR — full local gate (pre-commit + CI mirror) all green before push, then monitor the PR's CI and loop-fix until green.
- `wrap-up`: SOP for closing a work session — reconcile the active Trellis task, then report a short heads-up + to-do list.
- `handoff`: Hand the active Trellis task to a person or an agent on another machine — push the task's branches with only what the receiver needs (WIP-committing unfinished task work after showing the file list), then print one English pickup message to copy and send.
- `generate-interview-result`: Prepare a structured interview or an evidence-based hiring decision from a resume, JD, and interview evidence, then safely copy, fill, and verify the Feishu document for HR.
- `test-lcms`: Run the BIC TLC → CC → Analyze LCMS scenario through the real Portal with CDP and Phoenix evidence — reset lab demo and agent test per attempt, drive parameters and dispatch, and verify Analyze execution through to every expected vial report.
- `demo-video`: Make a short product demo video (zooms, callouts, captions, optional local AI voice-over, MP4) with OpenScreen's MCP tools — plan, demo-ready then freeze, record, edit, export, verify. For every role, not only developers.

## Install

### Global skills shared by Claude Code and Codex

Use this repository as the source for reusable personal workflows. Install a skill globally for both tools with the same command:

```bash
npx skills add c12-ai/noosphere-arsenal --skill worklog --global --agent claude-code codex --yes
```

The shared Skill contains the workflow. Use the installer-managed global agent entries; keep tool-specific entries free of a second workflow or a dependency on a private `~/.claude/commands/` file. `worklog` uses the user's vault configuration and does not embed one person's absolute paths. Obsidian must be running with its CLI enabled.

### Project-scoped skills

Install into a project with the [skills CLI](https://skills.sh) — skills are vendored
into `.agents/skills/` and symlinked into each agent directory, pinned in
`skills-lock.json`:

```bash
npx skills add c12-ai/noosphere-arsenal            # pick skills interactively
npx skills add c12-ai/noosphere-arsenal --all      # install everything
npx skills add c12-ai/noosphere-arsenal -l         # list available skills
npx skills add c12-ai/noosphere-arsenal --skill demo-video -g   # one skill, for all your projects
```

To restore a project's pinned skills from its `skills-lock.json`:

```bash
npx skills experimental_install
```

## Update

```bash
npx skills update --global  # global personal skills
npx skills update          # choose the appropriate scope for project skills
```

Install BIC onsite operations globally for Claude Code and Codex:

```bash
npx skills add c12-ai/noosphere-arsenal --skill bic-onsite-ops --global --agent claude-code codex --yes
```
