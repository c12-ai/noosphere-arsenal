---
name: raise-pr
description: SOP for raising/opening a PR in any repo. Use whenever asked to raise, open, or create a PR, or to "commit and PR" — BEFORE pushing anything. Enforces a full local gate pre-push and CI monitoring post-push.
---

# Raise a PR (SOP)

## 1. Before push — full local gate, ALL green first

- `uv run pre-commit run --all-files`
- The repo's CI mirror, typically: `uv sync --frozen`, `uv run ruff format --check .`,
  `uv run ruff check .`, `uv run pyright`, `uv run pytest`
  (repos with a `Makefile` CI mirror: use it, e.g. `make ci`)
- Gates short-circuit: after fixing any failure, re-run the WHOLE chain from the top.
  Only report per-gate results the chain actually printed.

## 2. Commit, push, open the PR

- Conventional Commits; never `--no-verify`.
- Open with `gh pr create` (or update the existing PR).

## 3. After push — monitor CI, loop until green

- `gh pr checks <n> --watch --interval 20`
- On failure: `gh run view <run-id> --log-failed` → root-cause → fix → re-run the
  full local gate → push → watch again. Repeat until green.
- EXCLUDED from the must-green set: the LLM "code review" job (e.g. `review-fix`) and
  "build and push". Everything else must pass.
- Never declare done while a non-excluded check is pending or red.
