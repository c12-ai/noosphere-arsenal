---
name: sop
description: Capture a standard operating procedure ("when I say X, do Y") into the right persistent home — a Codex.local.md one-liner, a project skill in ./.Codex/skills, a user-level skill in ~/.Codex/skills, or (development skills only) a plugin in the c12-apex marketplace — after deduplicating against existing rules and skills. Use when the user says "/sop", "make this an SOP", "remember this procedure", "add global", "this is a shared skill/sop", or right after they correct how a procedure should be done. Also use when asked to add, index, or reference an EXISTING skill in Codex.local.md / AGENTS.md ("add skill X to Codex.local.md", "apply skill X to <repo>") — never hand-edit those pointers in.
---

# /sop — capture a procedure

Input: args describing the SOP ("when I say X, do Y with tool Z"). If args are
empty, derive the SOP from the most recent correction in this conversation and
confirm a one-line summary with the user before writing anything.

Index-only requests: if the ask is to add/index an EXISTING skill into
Codex.local.md / AGENTS.md ("add skill X to Codex.local.md", "apply skill X
to <repo>"), there is no new procedure to capture — run only step 2 (dedup)
and step 6 (index). If the skill is already indexed at its home tier (plugins
and user-level skills index in `~/.Codex/AGENTS.md`, which loads in every
repo), report that and write nothing — never duplicate a globally-indexed
skill into a repo-level file. (Drake correction, 2026-07-02: raise-pr was
hand-duplicated into BIC's Codex.local.md despite the global index entry.)

## Steps

1. **Extract three things** — the trigger phrase(s) the user actually says, the
   procedure steps, and a verification step. If any is unclear, ask; don't guess.

2. **Dedup (mandatory, before writing)** — search for the topic in:
   - `.Codex/skills/*/SKILL.md` and `.Codex/rules/*.md` of the current repo
     (and of the workspace root if inside a multi-repo folder)
   - `~/.Codex/skills/*/SKILL.md` and installed marketplace plugins
   - `Codex.local.md` and `AGENTS.md` at both levels
   If an existing SOP or rule covers the same purpose, STOP and show it to the
   user (file path + the relevant lines), then let them decide: update the
   existing one the way they prefer, or create a separate dedicated skill.
   Never decide silently, and never leave two overlapping SOPs behind — if old
   and new contradict, report the conflict and apply whichever the user picks.

3. **Pick the tier by shape**:
   - one-line mapping → bullet under an `## SOPs` section in `Codex.local.md`
   - multi-step procedure → a skill (`SKILL.md`)
   - must-never-happen enforcement → suggest a PreToolUse hook, but only
     suggest; don't create hooks without explicit approval

4. **Pick the scope** (route by these signals, in priority order):
   - user says **"add global"** or **"this is a shared skill/sop"** — then split
     by kind:
     - **development skill** (teammates run it against repos: release, CI,
       deploy, PR flow, codegen) → contribute it to the apex market
       (`c12-ai/apex-forge`): new top-level plugin dir
       (`<name>/.Codex-plugin/plugin.json` + `<name>/skills/<name>/SKILL.md`,
       mirror an existing plugin), append the entry to
       `.Codex-plugin/marketplace.json`, open a PR (main is review-gated:
       1 write-access approval, squash-only — no self-merge). After merge:
       `Codex plugin marketplace update c12-apex && Codex plugin install <name>@c12-apex`,
       then delete any interim local copy so the plugin is the single home.
     - **meta / toolkit skill** (process, capture, workflow tooling) → the apex
       market is dedicated to development skills and will refuse these
       (PR #92 refused on this ground, 2026-07-02) — put it in user-level
       `~/.Codex/skills/<kebab-name>/` instead; it loads in every repo.
   - SOP is specific to one project → that repo's
     `./.Codex/skills/<kebab-name>/SKILL.md`, checked in; flag if the repo's
     `.gitignore` blocks `.Codex/skills/`.
   - personal habit (phrasing, formatting, workflow taste) → `Codex.local.md`
     or user-level `~/.Codex/`.
   If none of the signals is present and the tier is a skill, ask one question:
   shared (market or user-level) or project-local? Don't guess.

5. **Write it** in this shape:
   - description ends with: `Use when the user says "<trigger1>", "<trigger2>".`
   - numbered steps; the last step is always a verification ("verify …")
   - if the SOP came from a correction, state the wrong way explicitly
     ("never hand-edit `pyproject.toml`")
   - date-stamp environment-dependent facts ("verified YYYY-MM-DD")

6. **Index it (mandatory for every skill, whatever the scope)** — add a
   one-line pointer under an `## SOPs` section so the SOP is visible in
   always-loaded context:
   `- <trigger phrase> → <one-line rule> (<where the skill lives>)`
   Where to index:
   - project skill → the repo's `Codex.local.md`; if that file doesn't
     exist, use `AGENTS.md`
   - apex-market plugin or user-level `~/.Codex/skills` skill → user-level
     `~/.Codex/AGENTS.md` (loads in every repo)
   Create the `## SOPs` section if missing. One-liner SOPs from step 3
   already live there — don't index them twice.

7. **Report** one line per file written / updated / superseded. Do NOT commit.
