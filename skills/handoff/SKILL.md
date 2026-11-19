---
name: handoff
description: Hand the active Trellis task to someone else — a person, or an agent on another machine (for example local Mac → GCP). Pushes the task's branches with only what the receiver needs (committing unfinished task work as a WIP commit after showing the file list), then prints one English pickup message to copy and send. Use when the user says "/handoff", "hand this off", "hand over the task", "move this task to GCP", "交接", "交接给…".
---

# Hand off a task

Goal: the receiver continues from **one message**. They need git access to the repos and the workspace's Trellis scripts (they come with the workspace repo); they do not need this skill or this session.

Nothing is written or pushed until the user has approved the plan (Step 3). Never push to `main` or `development`, never force-push, never open or print `.env*` files.

Run Trellis scripts with `PYTHONDONTWRITEBYTECODE=1` so they do not leave `__pycache__` files behind as new dirty files.

## 1. Find the task

- `PYTHONDONTWRITEBYTECODE=1 python3 ./.trellis/scripts/task.py current --source` from the workspace root (the repo holding `.trellis/tasks/`).
- No active task: ask which task to hand off (`task.py list`). Do not guess from the conversation.
- Read the task's `task.json` (`title`, `description`, `status`, `branch`, `base_branch`), `prd.md`, `implement.md` and `handoff.md`.

## 2. Find every repo the task touched

List the git repos under the workspace, including nested clones the workspace repo ignores and linked worktrees:

```bash
find <workspace> -maxdepth 4 -name .git -not -path '*/node_modules/*'   # dirs = repos, files = worktrees
git -C <repo> worktree list
```

The repo holding `.trellis/tasks/<task>/` always belongs to the task (it carries `handoff.md`). Another repo belongs to it when its current branch equals the task branch, or when the task's `prd.md`, `implement.md` or `handoff.md` names it or its branch. List any repo the documents name but you did not find (for example one outside the workspace). If unsure, ask; do not include it silently.

For each task repo, record:

```bash
git -C <repo> remote get-url origin
git -C <repo> branch --show-current                        # empty = detached HEAD
git -C <repo> rev-parse --abbrev-ref @{upstream}           # may be unset
git -C <repo> status --porcelain=v1 --untracked-files=all
gh pr list -R <owner/repo> --head <branch> --state open --json number,url,baseRefName   # GitHub remotes only; otherwise PR is "unknown"
```

Stop and report a repo that is on a detached HEAD, in the middle of a rebase, merge or cherry-pick, or has unmerged (`UU`) entries; do not commit there.

**Base branch** (used for ahead/behind and for checking the pushed diff), first match wins: the open PR's `baseRefName` → `task.json` `base_branch` → the remote's default branch (`git -C <repo> remote show origin | sed -n 's/.*HEAD branch: //p'`). Fetch it first (`git -C <repo> fetch origin <base>`), then ahead/behind: `git -C <repo> rev-list --left-right --count HEAD...origin/<base>`.

## 3. Show the plan, then wait for the user's go

Classify every dirty file in every task repo:

| Push | Never push |
|---|---|
| The task directory (`.trellis/tasks/<task>/`), except the right-hand column | Secrets and `.env*` files (list names only, never contents) |
| Files named in the task's documents | Screenshots and large evidence: `**/research/screens/`, fixtures, images, PDFs, videos, archives |
| Changes made for this task in a repo Step 2 assigned to it, whatever branch it is on now | Scratch and caches: scratch dirs, `__pycache__`, `node_modules`, `.pnpm-store`, tool state |
| | Other sessions' work: another task's directory, files this task never touched |
| | Unrelated changes, even when they sit in the same repo |

"Never push" always wins over "push" (a task document may name a screenshot or `.env.local`). When a file fits neither column clearly, put it under "never push" and say so. Also list secret files that exist, untracked or ignored (`git -C <repo> status --ignored --porcelain | grep -E "\.env"`), under "never push" by name, so the message can say they stay local. Files someone else has already staged stay staged and stay out of the commit; list them too.

Show one table: repo (and its path relative to the workspace) → branch (create one if the work sits on `main`/`development`) → files to WIP-commit, plus the handoff entry from Step 4 → files left behind and why → open PRs. Ask for a go. Change the plan if the user corrects it.

Branches:

- The repo is on the task branch: commit there.
- It is on `main` or `development`: the plan creates the task branch from the current commit (uncommitted work moves with it).
- It is on any other branch: stop and ask; never commit task work onto an unrelated branch. The same applies when the task branch exists but is not checked out, or when `task.json` `branch` is `main` or `development`.
- The branch has an open PR: show it in the plan, and check `gh api repos/<owner>/<repo>/pulls/<n>/reviews` — a push re-runs CI and may dismiss approvals; say so if any review is APPROVED.

No task branch in `task.json`: propose `<type>/<task-slug>` (for example `feat/handoff-skill`) in the plan and record it after the go with `task.py set-branch`.

## 4. Record the handoff in the task

After the go, and before committing: a handoff is a milestone, so always append an entry to the task's `handoff.md` (format: "Recording task progress" in `.trellis/workflow.md`). `<machine>` is the environment name the user uses (for example `laptop`, `gcp`), else `hostname -s`.

```markdown
## YYYY-MM-DD HH:MM <machine>
Handing off: <one line: where things stand>
State: <phase, checklist position, branches/PRs and their status>
Env: <where it ran: machine, container, services, stage>
Next: <the next concrete step for the receiver>
Blockers: <none, or what blocks and who decides>
Evidence: <paths, PR/run links, commands>
```

The entry is committed with the WIP commit in Step 5, so it cannot name its own SHA; name the branches instead.

## 5. Commit, push, verify

Per repo, after the go:

1. On `main` or `development`: `git switch -c <task branch>` first (uncommitted work moves with it).
2. Stage **explicit paths only** (`git add -- <approved paths>`; never `git add -A` / `git add .`), then commit **only those paths**, so anything someone else had already staged stays out:
   `git commit -m "chore: wip handoff <YYYY-MM-DD>" -- <approved paths>`
   (a conventional-commit type, so commit-msg hooks accept it). Before committing, scan the staged diff for token-like strings (`git diff --cached -- <paths> | grep -nEi "(api[_-]?key|token|secret|password|authorization).{0,40}[:=]"`) and any file over ~500 KB; report hits by file and line only and leave those files out unless the user confirms. Let hooks run: if the message is rejected, reword it; if a check fails, fix the cause or leave that file out and report it — never `--no-verify`. If a hook rewrote files, re-check `git status`. Skip the commit when nothing is staged.
3. `git push -u origin <branch>`. If the push is rejected (remote moved), stop for that repo and report; do not force, rebase or merge on your own.
4. Verify:
   - `git ls-remote origin <branch>` equals `git rev-parse HEAD`.
   - The WIP commit (`git show --name-only --format= HEAD`) holds exactly the approved paths, and nothing from the "never push" column.
   - The whole branch (`git diff --name-only origin/<base>...HEAD`) holds nothing from it either. Files committed before this handoff are not rewritten: report them to the user instead.

## 6. Reply

The reply has two parts, in this order:

1. **Result** — per repo: pushed `branch @ <short sha>` (verified), branch created by this handoff yes/no, WIP commit yes/no, files left behind; plus anything that failed.
2. **Pickup message** — one fenced block, **always in English**, self-contained:

````markdown
```text
Pickup: <task title>
Goal: <one sentence from task.json description / prd.md>

Repos (path is relative to the workspace root):
- <owner/repo, or the remote URL> → <branch> @ <short sha>   path: <path>   PR: <url or "none">
- ...

Resume (inside an AI session with the Trellis hooks; in a plain shell, export TRELLIS_CONTEXT_ID=<any session id> first):
1. Fresh machine: git clone -b <branch> <remote> <path> for each repo, workspace repo (path .) first, nested repos inside it after.
   Existing checkout: git fetch origin && git switch <branch> in each repo.
2. From the workspace root, make it this session's active task:
   <status-specific command, see below>
   Confirm: PYTHONDONTWRITEBYTECODE=1 python3 ./.trellis/scripts/task.py current --source  ("none" means the pointer was not set)
3. Read .trellis/tasks/<task>/handoff.md (newest entry last), prd.md, implement.md.

State: <from the newest handoff.md entry>
Next: <the next concrete step: what to change, where, and how to verify it>
Blockers: <none / what and who decides>
Environment: <stage, services to start, required secret keys by NAME from the repo's .env.example or docs (never from a .env* file) — or "key names unknown; ask the sender">
Not pushed: <files left behind and why, or "nothing">
```
````

Write GitHub remotes in their HTTPS form (`https://github.com/<owner>/<repo>.git`), since an SSH remote may not work on the receiver's machine. If a remote URL is a local path or otherwise unreachable from the receiver's machine, say so next to that repo. Replace every `<…>` placeholder, including the Resume step 2 command below.

Resume step 2 depends on `task.json` `status`:

- `in_progress`: `PYTHONDONTWRITEBYTECODE=1 python3 ./.trellis/scripts/task.py start .trellis/tasks/<task> --allow-empty-context` (sets the session pointer; only a `planning` status would change; the flag skips the context-manifest gate, which a pickup should not trip over).
- `planning`, or any other status: `task.py start` could change the status, which is not a pickup's call. Set only the pointer:
  `PYTHONDONTWRITEBYTECODE=1 python3 -c "import sys; sys.path.insert(0, '.trellis/scripts'); from pathlib import Path; from common.active_task import set_active_task; print(set_active_task('.trellis/tasks/<task>', Path('.').resolve()))"`

## Example message

```text
Pickup: Demo: add greeting endpoint
Goal: Add a /greet endpoint to svc and document it.

Repos (path is relative to the workspace root):
- c12-ai/demo-meta → feat/demo @ 53feddc   path: .   PR: none
- c12-ai/demo-svc → feat/demo @ 8598323   path: svc   PR: none

Resume (inside an AI session with the Trellis hooks; in a plain shell, export TRELLIS_CONTEXT_ID=<any session id> first):
1. Fresh machine: git clone -b feat/demo https://github.com/c12-ai/demo-meta.git . then git clone -b feat/demo https://github.com/c12-ai/demo-svc.git svc
   Existing checkout: git fetch origin && git switch feat/demo in each repo.
2. From the workspace root, make it this session's active task:
   PYTHONDONTWRITEBYTECODE=1 python3 ./.trellis/scripts/task.py start .trellis/tasks/11-19-demo --allow-empty-context
   Confirm: PYTHONDONTWRITEBYTECODE=1 python3 ./.trellis/scripts/task.py current --source
3. Read .trellis/tasks/11-19-demo/handoff.md (newest entry last), prd.md, implement.md.

State: in_progress; endpoint drafted in svc/src/app.py; next checklist item "Add tests".
Next: add svc/tests/test_app.py asserting greet("x") == {"hello": "x"} (run: python3 -m pytest svc/tests); then document /greet in svc/README.md.
Blockers: none
Environment: no services needed; no secrets needed.
Not pushed: .env.local (secret); research/screens/shot.png (screenshot); notes/personal-todo.md (unrelated); .trellis/tasks/11-19-other-session/ (another session's task).
```
