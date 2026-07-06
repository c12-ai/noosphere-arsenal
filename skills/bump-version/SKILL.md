---
name: bump-version
description: Bump a package version in a uv-managed repo. Use when Drake says "bump version", "release x.y.z", or "cut a version".
---

# Bump version (uv repos)

1. Confirm the bump level first — never guess. Pre-release versions like
   `0.10.0a1` can mean alpha (`a2`), minor (`0.11.0a1`), or release (`0.10.0`);
   ask which is intended unless Drake states it.
2. Run in the package directory:
   - explicit version: `uv version <x.y.z>`
   - or relative: `uv version --bump patch|minor|major`
   Never hand-edit the version in `pyproject.toml`.
3. Verify BOTH `pyproject.toml` and `uv.lock` changed.
4. Do NOT commit unless Drake asks. When he does: standalone commit with
   `chore(release): bump version to <x.y.z>` including both files — never
   bundle a version bump into a feature commit.
