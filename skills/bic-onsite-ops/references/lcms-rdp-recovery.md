# Recover the onsite LCMS monitor

Verified on 2026-09-21. This runbook covers BIC operator access and verification.
MIND owns the controller, its RDP session, and the reconnect script. Do not copy
the controller implementation into BIC or recreate its container to recover a screen.

## Access and ownership

| Role | Verified address / identity |
|---|---|
| BIC jump host | Wired: `orin`; Tailscale: `orin-tel`; same onsite host `192.168.12.150` |
| MIND controller host (4080) | `robot-003@192.168.12.104` |
| Controller HTTP | `http://192.168.12.104:18000` |
| Existing controller container | `mind-lcms-control` |
| Approved reconnect entry | `/home/robot-003/reconnect-lcms-rdp.sh` |
| Mac SSH identity used in verification | `~/.ssh/c12_lab.pem` |

Choose the jump alias for the current connection: `orin` on the onsite wired
network, `orin-tel` through Tailscale. Both reach the same BIC host. The
Mac-to-controller path verified through Tailscale was:

```bash
ssh -J orin-tel -i ~/.ssh/c12_lab.pem -o IdentitiesOnly=yes \
  robot-003@192.168.12.104 hostname
```

Use a raw host/IP in SSH configuration: `HostName 192.168.12.104`, not an HTTP
URL. Access to `.150` provides a network route, not automatic login rights on
`.104`. The nested SSH attempt from `.150` failed authentication; ProxyJump
with the explicitly selected Mac identity succeeded. Keep the private key on
the Mac; do not copy it to the jump host or into this repository.

## Diagnose before reconnecting

1. Obtain the approved controller API key and the separate monitor token through
   the existing credential channel. Do not put their values in documentation,
   Git, screenshots, or PRs. The API key is not the monitor token or SSH password.
2. Check `GET /v1/device/status` with `X-API-Key`. Proceed only with `state=idle`
   and `current_execution_id=null`. An idle API does not establish that desktop
   capture is working. When the device is not idle, clear it first with the
   MIND-owned procedure in
   [Clear a non-idle device before reconnecting](#clear-a-non-idle-device-before-reconnecting).
   Use no other controller operations endpoint.
3. Check one authenticated monitor JPEG and inspect the picture. HTTP 200 plus a
   valid JPEG can still mean a completely black framebuffer. An unauthorized
   request returning 401 is an authentication problem, not an RDP diagnosis.
4. Establish PC reachability before choosing a recovery action: test the current
   configured RDP host/port from the controller container and record the time,
   source, target and exact result. Follow the evidence branches below. A healthy
   controller API does not establish Windows PC reachability. Confirm nobody is
   using or about to log into the physical Windows PC before reconnecting.
   Local login can displace RDP; locking the PC alone does not reconnect it.
   Do not open a competing RDP/VNC session.
5. Record all running controller-host container IDs, start times, and restart
   counts. Record the controller's Python and Xvfb PIDs using the command below.
   These protected services/processes must remain unchanged after recovery.

From the controller host, this is a read-only process check:

```bash
docker top mind-lcms-control -eo pid,comm,etime
```

The deployed script uses the container's existing `LCMS_RDP_*` settings. It
terminates residual `xfreerdp` processes and starts one replacement on the
existing display, normally `:99`. It does not restart Python/API, YOLO, Xvfb,
other services, or the container, and it does not change credentials.

## Clear a non-idle device before reconnecting

Procedure supplied by MIND colleagues through Drake on 2026-09-22. MIND maintains
the controller service, so on anything concerning it they are the authority and
this procedure governs. Drake confirmed on 2026-09-22 that it overrides the
earlier BIC-side rules against using the controller's recovery endpoint and
against restarting the controller container. Where an older note in this skill
disagrees with MIND, MIND wins; do not average the two or preserve the old rule
as a parallel option.

The limits below come from MIND as part of the same procedure and still apply:
no `docker compose down`, no changes to other containers, no edits to
`lcms.4080.env`, and no hand-editing of the controller's SQLite database.

Read `GET /v1/device/status` first and pick the path from its actual `state`.

### Path A — `error` with no active execution (preferred)

```bash
curl -sS -H "X-API-Key: $LCMS_API_KEY" http://127.0.0.1:18000/v1/device/status
# when state=error and current_execution_id=null:
curl -sS -X POST -H "X-API-Key: $LCMS_API_KEY" http://127.0.0.1:18000/v1/device/recover
```

Run these on the controller host, or against a local tunnel to port 18000.

### Path B — `working` with a stuck execution

1. Confirm it is genuinely stuck: the execution's events show no terminal state
   for a long period, and `workflow_event_index` stays in the observation segment.
2. Do not call `POST /v1/device/recover` first. While an execution holds the
   device lock it returns `409 device_busy`, and repeating it changes nothing.
   Do not work around it by editing the SQLite database.
3. Run only:

   ```bash
   docker restart mind-lcms-control
   ```

4. Wait for the container's health to report ok, then `POST /v1/device/recover`,
   then confirm `state=idle` with `current_execution_id=null`.

Restarting the controller kills the RDP session and the Python/Xvfb processes
with it, so the protected-PID comparison in this runbook applies only across a
reconnect, not across an authorized Path B restart. Re-run the idle and operator
checks afterwards, then reconnect and verify a fresh desktop frame.

### Controller API key source

MIND keeps the key on the 4080 host at `~/mind-lcms-control/config/lcms.4080.env`,
field `LCMS_API_KEY`. Read it into the calling shell or program; do not print or
copy its value into documentation, logs, screenshots, or PRs. The BIC-side copy
of the same key is described in [credentials.md](credentials.md).

### Access route — use BIC's own

Drake's ruling, 2026-09-22: BIC shares a different access route with MIND, so
use the BIC route in the table above — wired `ssh -J orin` or Tailscale
`ssh -J orin-tel` to `robot-003@192.168.12.104`, with the Mac identity. Verified
the same day: direct `http://192.168.12.104:18000` from the Mac on the onsite
wired LAN returned HTTP 200, and the ProxyJump SSH authenticated.

MIND's own instructions name their jump host and state that a Mac cannot reach
`.104` directly. That describes their identity and network, not ours. Do not
switch to their jump host, and do not treat their note as evidence that the BIC
route is broken. This route choice is BIC-side access only; it does not weaken
MIND's authority over the controller procedure above.

## Run the approved recovery once

After the idle and operator checks, run from the Mac:

For the onsite wired connection:

```bash
ssh -J orin -i ~/.ssh/c12_lab.pem -o IdentitiesOnly=yes \
  robot-003@192.168.12.104 /home/robot-003/reconnect-lcms-rdp.sh
```

For Tailscale:

```bash
ssh -J orin-tel -i ~/.ssh/c12_lab.pem -o IdentitiesOnly=yes \
  robot-003@192.168.12.104 /home/robot-003/reconnect-lcms-rdp.sh
```

Do not run it repeatedly just because the shell exit code is nonzero. Inspect
the actual process and frame first, especially for the known checker issue below.
Do not use `docker compose up --force-recreate`, restart the controller API,
change keys, or submit an LCMS execution to test reconnection.

### Known false failure in the verified script

The deployed script inspected on 2026-09-21 has SHA-256:

```text
a486acf9a6d4856e9884e078b38256e90297bd2bfba1142d1483b13fa30d8ea0
```

Its final check uses `docker top ... -eo comm`, which failed on this host with:

```text
Couldn't find PID field in ps output
```

Consequently it exited 1 and printed `xfreerdp did not stay up` even though the
new process was running and the monitor had recovered. The log tail also
contained older disconnect messages; their presence alone does not prove that
the latest attempt failed.

Use `docker top mind-lcms-control -eo pid,comm,etime` to inspect the real state.
The checker defect should be corrected in the MIND-owned script; it was not
patched on the controller during this recovery. The colleague reported the
repository counterpart as `mind-lcms-control/config/reconnect-linux-freerdp.sh`;
the deployed file and checksum above are the artifact verified in this session.

## Verify recovery

1. Confirm exactly one live `xfreerdp` process. A PID alone is insufficient.
2. Confirm all pre-existing container IDs, start times, and restart counts are
   unchanged, and the recorded Python/API and Xvfb PIDs still exist.
3. Fetch a new monitor frame and visually confirm a usable Windows desktop or
   LCMS application, rather than a black frame or login screen. Check for a
   current visible clock or another sign of a live display when possible.
4. Recheck the controller status. It must still be idle with no current
   execution; do not start an experiment as part of this recovery.

Two monitor frames a few seconds apart are the strongest cheap liveness check:
differing bytes prove the capture is updating. Identical bytes on a still desktop
are expected and do not by themselves mean the session is frozen — read the
visible clock as well.

### A session evicted by another login (verified 2026-09-22)

When the desktop drops repeatedly, read the FreeRDP log tail before reconnecting
again. This line names the cause outright:

```text
ERRINFO_DISCONNECTED_BY_OTHER_CONNECTION (0x00000005):
Another user connected to the server, forcing the disconnection of the current
connection.
```

On 2026-09-22 the controller's session was evicted three times within about
45 minutes, and the 03:28:31 UTC log entry above matched the third drop exactly.
Someone logging into that Windows PC, remotely or at the keyboard, displaces the
controller's RDP session. LCMS-001 had already seen this code in historical logs;
2026-09-22 confirms it as a live, repeating cause rather than a stale line.

Reconnecting works but only until the next login, so repeating the script is not
a fix. Escalate instead: find who is logging in and stop it, or ask MIND for a
session policy that does not evict the automation. A dropped session also leaves
the device in `error` once anything dispatches against the black frame
(`automation_failed: 无法从当前帧解析点击目标`), so expect to run Path A before
reconnecting.

On the lab's wired LAN, first check direct access to the authenticated frame
endpoint. On 2026-09-21, direct access from the Mac returned HTTP 200 with
`image/jpeg`; the browser address is
`http://192.168.12.104:18000/monitor/#<MONITOR_TOKEN>`. No tunnel is needed when
this route works. This access check alone does not establish frame content.

When direct LAN access is unavailable, use the existing monitor tunnel if it
is already running. Otherwise, use the currently reachable SSH alias (`orin`
for the verified wired connection or `orin-tel` for Tailscale). For example:

```bash
ssh -N -L 127.0.0.1:18001:192.168.12.104:18000 orin-tel
```

Open `http://localhost:18001/monitor/#<MONITOR_TOKEN>`, or fetch one frame from
`http://localhost:18001/monitor/frame.jpg` with the `X-Monitor-Token` header.
The monitor is read-only. For programmatic checks, fetch at most one frame per
second; do not add continuous polling alongside existing viewers unnecessarily.

## Verified incident outcome

Before recovery, the monitor returned HTTP 200 with a black JPEG (33,268 bytes),
while the controller reported idle. After the single approved script execution,
the monitor returned HTTP 200 with a 323,747-byte JPEG showing the Windows
desktop and Agilent/OpenLab icons. Image size is evidence for this incident,
not a general success threshold.

The new `xfreerdp` process was still running more than two minutes later. The
controller and every other running container retained their identities, start
times, and restart counts. Python/API and Xvfb PIDs were unchanged. The
controller remained idle; no LCMS task was submitted.

The separate monitor check remains essential: a report that direct Xvfb
capture works does not prove that the HTTP monitor is returning the same frame.

## Related ownership documentation

- [MIND controller repository](https://github.com/c12-ai/mind-lcms-control)
- [BIC Device integration boundary](https://github.com/c12-ai/BIC-device-service/blob/main/docs/BIC_INTEGRATION.md)
- [Field operations and deployment](https://github.com/c12-ai/BIC-meta/blob/main/ops/field/README.md)

Keep recovery implementation in MIND and BIC access/verification instructions
here. Agents should enter through
[`bic-onsite-ops`](../SKILL.md), which references
this procedure and maintains incident evidence. Update the procedure here when
verified steps change; record individual outcomes in the skill's incident log.

## Unreachable Windows target after a reconnect

Verified 2026-09-21 in LCMS-003: the existing script can fail with both its known
PID-field checker defect and a real transport failure. Check the actual process
and authenticated frame before deciding which applies. If no FreeRDP remains,
check TCP reachability from the controller container to its current configured
LCMS_RDP_HOST/LCMS_RDP_PORT without printing credentials. `No route to host`
requires restoring Windows/network reachability; it does not prove a password
problem or identify whether the PC is powered off, asleep, disconnected, or filtered. Stop
repeating reconnects and have onsite staff check power/awake/network state.
After reachability is restored, repeat the idle/operator checks before recovery.

For LCMS-003, Drake subsequently confirmed that someone had turned off the LCMS
Windows PC; who did so is unknown. Drake restarted it, after which TCP reachability
returned and the authorized RDP retry restored the desktop. The physical cause is
operator-confirmed; reachability and desktop recovery were independently verified.

## Evidence before a physical-PC diagnosis

Diagnostic guidance updated from Drake's 2026-09-21 correction; the TCP failure
and recovery were verified in LCMS-003. Cohes WiFi checks below are diagnostic
steps, not a claim that this incident involved a WiFi fault.

- Record a TCP probe from the controller container to the configured RDP host/port.
  Success proves that port was reachable at that time, not that login or desktop
  capture works. Inspect FreeRDP errors and an authenticated monitor frame next.
- A refused connection means the TCP attempt was actively rejected; investigate
  the RDP listener or filtering. It does not establish that the PC is off.
- A timeout or `No route to host` establishes a failed connection from that source
  at that time. It does not distinguish shutdown, sleep, wrong network, changed
  IP, routing, or firewall filtering. Do not label the PC powered off from this alone.
- Narrow the cause with available read-only evidence: controller route/neighbor
  state, the PC's current IP, and onsite confirmation of its power/awake state
  and connection to the dedicated **Cohes WiFi**. Router/AP association or DHCP
  records can support the network check when available; stale leases or missing
  neighbor entries do not prove current power state. Do not change network settings
  merely to test a hypothesis.
- Report separately: observed failure, supported possible causes, and the next
  distinguishing check. If remote evidence cannot distinguish them, ask onsite
  staff to verify power and Cohes WiFi. Retry only after reachability returns and
  the idle/operator checks pass; verify a usable desktop afterward.

In LCMS-003, `No route to host` supported only failed RDP reachability. Drake's
physical observation supplied the power-off cause; restored TCP access and the
visible desktop verified recovery. Who switched off the PC remains unknown.
