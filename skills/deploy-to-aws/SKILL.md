---
name: deploy-to-aws
description: SOP for redeploying the latest merged code of the BIC repos to the aws-test cloud box (43.192.79.141 · https://bic.labwise.cn) via the Mac-relay script. Survey what's stale, verify prerequisites (builds dispatched, IP whitelisted), report the plan, WAIT for the user's go, deploy, then report tags/ports/URLs/rollback handles. Use when the user says "deploy to aws", "redeploy aws-test", "update aws-test", "ship latest to aws". NOT for orin (that's the BIC field-deploy skill, LAN deploy.sh) and NOT for the local dev bench (env-up).
---

# deploy-to-aws — relay-deploy the BIC stack to aws-test

Target: EC2 box `ssh aws-test` (cn-northwest-1, no EIP), fronted by the
`labwise-cn` ALB at https://bic.labwise.cn. The deploy vehicle is
`ops/field/relay-deploy.sh` in BIC-meta — the Mac pulls images via its proxy
and relays them over ssh (`docker save | ssh docker load`), because the box
pulling ghcr directly is cross-border (~130 KB/s, measured 2026-07-17).
Never hand-write docker commands against the box; the script owns the
pull/relay/roll/verify sequence.

Scope: lab / BE / portal / mock images only. Chem, keycloak, infra, and any
compose/`.env` change are OUT of scope (see step 2). Sibling skills:
orin LAN deploy → BIC `field-deploy`; local dev bench → BIC `env-up`.

## 1. Survey — what needs redeploying (read-only)

For each deployable repo, compare main head vs what the box runs:

```bash
# main heads
for r in BIC-lab-service BIC-agent-service BIC-agent-portal mars_interface_mock; do
  gh api "repos/c12-ai/$r/commits/main" --jq '"\(.sha[0:10])  \(.commit.committer.date)  \(.commit.message | split("\n")[0])"'
done
# box: running container -> image revision label + created date + PRE-DEPLOY IMAGE ID (= rollback handle, record it now)
ssh aws-test 'for c in bic-lab-service bic-agent-service bic-agent-portal bic-robot-mock; do
  img=$(docker inspect $c --format "{{.Image}}");
  echo "$c id=${img:7:12} rev=$(docker image inspect $img --format "{{index .Config.Labels \"org.opencontainers.image.revision\"}}" | cut -c1-10) created=$(docker image inspect $img --format "{{.Created}}")"; done'
```

A service needs redeploying when its running revision ≠ main head. List the
stale ones with the commits they'd ship. Image `Created` dates are
informational only — the authoritative freshness check is the script's
image-ID comparison (a `docker load`ed image has no RepoDigests, so digest
comparison against ghcr does NOT work on this box).

## 2. Prerequisites — verify, don't assume

- **Code on main.** This SOP ships `main` heads only (lab/BE ride `:main`,
  portal is pinned `sha-<main head>`, mock `:latest`). Unmerged PRs don't
  deploy — flag them to the user instead.
- **Images actually built.** THE trap (cost a stale deploy 2026-07-29): lab
  and BE `docker-build.yml` are `workflow_dispatch`-ONLY — merging to main
  does NOT build an image. Compare the latest "Build and Push Docker Image"
  run sha against main head:
  `gh run list -R c12-ai/<repo> -w "Build and Push Docker Image" -L 1 --json headSha`
  If stale: `gh workflow run docker-build.yml -R c12-ai/<repo> --ref main`,
  then poll to green (~2–4 min; verified 2026-07-29). Portal builds on push
  but verify its run anyway.
- **Local tooling.** Docker daemon up (on Drake's Mac: OrbStack —
  `docker context show` must say `orbstack`, never `open -a Docker`), `gh`
  authenticated with c12-ai access, `~/.ssh/config` has `Host aws-test`.
- **Config drift check.** relay-deploy is IMAGES-ONLY. If merges since the
  last deploy touched `ops/field/` compose files or added `.env` keys, those
  need `update.sh` — and `update.sh` on aws-test clobbers the site-local
  `KC_PROXY_HEADERS: xforwarded` line in `keycloak/docker-compose.yml`
  (re-add it after any update.sh run). Surface this to the user; don't run
  update.sh as part of this SOP.
- Anything you can't verify yourself (creds, box tenancy, whether a real
  robot is attached) → ASK the user; never guess.

## 3. Dry-run, plan, and report — then STOP

```bash
FIELD_SSH=aws-test ops/field/relay-deploy.sh --dry-run
```

- If preflight red-cards your IP ("NOT in office-ips prefix list" — ssh
  would hang/die silently), re-run with `--fix-ip` (needs China-partition
  aws CLI creds). This ADDS your `/32` to the shared prefix list
  permanently; mention it in the report (entries accumulate — transient
  VPN-exit IPs deserve occasional cleanup).
- Report to the user: per-service before→after sha with the changes being
  shipped, what's excluded (mock skips unless its container is running —
  consumer mutex with the real robot; chem/keycloak/infra untouched), any
  config-drift or whitelist heads-up, and ask how/whom to notify once the
  deploy is done (e.g. a Feishu group message).
- **WAIT for the user's explicit go ("deploy", "start", "go"). Reporting
  the plan is NOT permission to deploy.**

## 4. Deploy (only after the go)

```bash
FIELD_SSH=aws-test ops/field/relay-deploy.sh
```

Run it in the background and monitor the log (full run ≈ 3 min when only
2–3 services are stale). The script skips services whose image ID already
matches (`--force` overrides), rolls with `compose up -d --pull never`, and
self-verifies: 90 s health probes, container-runs-relayed-image, stage-gate
FATAL scan, reset-contract 422 probe. `--reset` (destructive bench reset)
only on explicit user request. Quirks seen 2026-07-29: an empty `created=`
in the pull log is harmless; a fast "relayed in 3s" just means the image was
small or already mostly present.

## 5. Verify independently, then closing report

Verification is two-layer — the script's own STEP 5 all-green, PLUS an
independent check that running containers now carry the intended shas
(same revision-label command as step 1; each must equal its repo's main
head). Then report:

- **Image tags + revisions**: lab/BE `:main` @ `<sha>`, portal
  `sha-<sha>`, mock `:latest`.
- **Ports**: host→container mapping per service, read LIVE from
  `ssh aws-test 'docker ps --format "{{.Names}} {{.Ports}}"'` — don't
  recite from memory.
- **URLs**: portal https://bic.labwise.cn · API https://bic-api.labwise.cn ·
  lab https://bic-lab.labwise.cn · auth https://bic-auth.labwise.cn
  (office IPs also reach raw ports directly).
- **Rollback handles**: the pre-deploy image IDs recorded in step 1.
  `:main` gets re-tagged on every load, so the OLD image survives only as
  an untagged ID — rollback = retag that ID (or rebuild the older sha via
  workflow_dispatch) and `compose up -d --pull never`.
- Notify whoever/however the user chose in step 3.

Finally, verify nothing was silently skipped: every service listed as stale
in step 1 must appear either in the deployed set or in the report with a
stated reason.
