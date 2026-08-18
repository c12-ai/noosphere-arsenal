---
name: bump-version
description: Apply and validate source version changes in BIC pull requests for uv-managed Python repos and package.json Node repos. Use when Drake says "bump version", asks to prepare a PR or release, or when a PR must declare version:patch, version:minor, version:major, or version:none.
---

# Bump version in a pull request

## 1. Resolve the version intent

- Never guess the bump. Use the explicit version or bump level from Drake or
  the issue; otherwise ask.
- Inspect the target repository for `.github/workflows/version-policy.yml` and
  its live `version:*` labels. Do not invent labels or claim enforcement when
  the repository has not installed the policy.
- Treat prerelease versions carefully. A value such as `0.10.0a1` could move
  to `a2`, `0.11.0a1`, or `0.10.0`. The current PR labels express only patch,
  minor, major, or no change. Stop and surface any prerelease transition that
  cannot be expressed by one of those policies.
- When the version policy is installed, apply exactly one PR label:
  - `version:patch`
  - `version:minor`
  - `version:major`
  - `version:none` for docs/chore-only changes with no source version change
- Never use `version:none` to bypass a required bump.

## 2. Update the source version

Run the package-native command in the repository root.

For uv-managed Python projects:

```bash
uv version <x.y.z>
# or
uv version --bump patch|minor|major
```

Never hand-edit the version in `pyproject.toml`. Verify that both
`pyproject.toml` and `uv.lock` contain the new version.

For package.json projects using pnpm:

```bash
pnpm version <x.y.z|patch|minor|major> --no-git-tag-version
```

Always keep `--no-git-tag-version`; the PR changes source metadata only. Verify
`package.json` and any lockfile change produced by the repository.

## 3. Validate before push

- Read the resulting version from the source manifest and compare it with the
  requested policy.
- In uv repos, run `uv lock --check`.
- Run the repository's complete local gate and `git diff --check`.
- Keep the version change in the same PR as the behavior change. When a
  separate commit improves reviewability, use
  `chore(version): bump version to <x.y.z>`; do not call the bump a release.

## 4. Validate the pull request

- When the repository has installed the version policy, apply exactly one
  `version:*` label before declaring the PR ready.
- Confirm `Version Policy / version-policy` appears in the PR checks and passes
  after the final push or label change. If it is absent, report that the
  repository has not installed the policy.
- Do not claim that the check blocks merging unless the repository or
  organization ruleset marks `version-policy` as required.

## 5. Keep publishing separate

Merging the PR updates the source version only. Never create or push a Git tag,
or create a GitHub Release, unless Drake explicitly requests a separate
publishing step. For that step, read the version from `main` after merge and
make the tag/release version match it exactly, following the repository's tag
naming convention.
