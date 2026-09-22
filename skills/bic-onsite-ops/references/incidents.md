# BIC 现场故障与运维记录

这里保存故障索引、诊断证据和处理结果；可重复执行的步骤放在对应运维手册。
先按症状找记录，再读取其关联手册。历史环境、进程号和镜像版本不能代替现场核验。
编写、版本管理及评审遵循 [手册管理规范](governance.md)。

## 索引

| 编号 | 日期 | 症状 / 场景 | 结果 | 关联手册 |
|---|---|---|---|---|
| LCMS-001 | 2026-09-21 | 监控 HTTP 200 但黑屏；跳板 SSH 认证失败；重连脚本误报 | 画面恢复已验证，脚本检查缺陷仍在 | [LCMS 重连](lcms-rdp-recovery.md) |
| LCMS-003 | 2026-09-21 | Black monitor; FreeRDP absent | Recovered on authorized retry; desktop verified | [LCMS recovery](lcms-rdp-recovery.md) |
| LCMS-002 | 2026-09-21 | 有线连接现场后重新访问监控 | LAN 鉴权取帧 HTTP 200；无需 SSH 隧道 | [LCMS 重连](lcms-rdp-recovery.md) |
| OPS-001 | 2026-09-20 | `make reset` 不可用，现场缺少 Makefile | 工具同步、语法与 dry-run 已验证；未执行 reset | [现场命令](https://github.com/c12-ai/BIC-meta/blob/main/ops/field/README.md#unified-routine-commands-on-any-field-server-in-bic-v2) |
| OPS-002 | 2026-09-20 | 单服务部署因未选中的 Device 状态检查而失败 | 范围检查和端口默认值修复已验证 | [运维处理](operations.md) |
| DEVICE-001 | 2026-09-20 | Device 切换 Mind 时 Compose 未传入连接配置 | Mind 启动、控制端空闲及 Lab 心跳已验证；未下发实验 | [Provider 配置](operations.md) |
| OPS-003 | 2026-09-20 | Mac 的 `DRY=1` 未传给 direct runner | 已确认，尚未修复；不可作为只读预检使用 | [运维处理](operations.md) |
| CC-001 | 2026-09-21 | CC repeat confirmation returns 409 after success | Saved result and Analyze progression verified; second-request trigger unverified | [Operations](operations.md#cc-result-confirmation-popup) |
| LCMS-004 | 2026-09-22 | 45 分钟内三次黑屏掉线；设备先被卡住的 execution 占用，后转 `error` | 根因确认为他人登录挤掉会话；Path A 两次验证，桌面与 idle 已验证；Path B 仍未验证 | [清除非 idle 设备](lcms-rdp-recovery.md#clear-a-non-idle-device-before-reconnecting) |

## LCMS-001：黑屏、SSH 身份与重连误报

- **环境 / 边界：** BIC `orin`，经 `orin-tel`（`.150`）访问 MIND 控制机 `.104`。
  用户授权恢复现有 RDP；其他容器、Python/API、YOLO、Xvfb、凭据不属于修改范围。
- **症状与前置证据：** `/v1/device/status` 返回 idle、没有执行 ID；鉴权后的
  `/monitor/frame.jpg` 返回 HTTP 200、有效 JPEG，但画面全黑。不能据此判定 RDP 正常。
- **访问诊断：** `.150 → .104` 网络可达；缺少合适 SSH 身份时返回
  `Permission denied (publickey,password)`。`.150` 的登录权限不自动继承到 `.104`。
  指定 Mac 已有的 `~/.ssh/c12_lab.pem`，使用 ProxyJump 和 `robot-003` 后登录成功。
  SSH `HostName` 使用裸 IP，不带 `http://` 或 `/`。
- **机制：** 物理 Windows 本机登录可能挤掉已有 FreeRDP 会话；锁屏本身不会发起重连。
  历史 FreeRDP 日志包含 `ERRINFO_DISCONNECTED_BY_OTHER_CONNECTION`。不要为观看监控
  再建立第二个交互式 RDP/VNC 会话。
- **操作：** 检查 idle 并记录容器及进程基线后，只执行 MIND 提供的
  `/home/robot-003/reconnect-lcms-rdp.sh` 一次。完整命令和脚本指纹见关联手册。
- **误报：** 脚本尾部 `docker top ... -eo comm` 因缺少 PID 列而失败，导致退出 1 并输出
  `xfreerdp did not stay up`。这不等于实际重连失败；不能直接循环重跑。
- **独立验证：** `docker top mind-lcms-control -eo pid,comm,etime` 显示新 xfreerdp；
  两分钟后仍在运行。HTTP JPEG 恢复为 Windows 桌面，可见 Agilent/OpenLab 图标。
  所有已有容器的 ID、启动时间、重启计数未变；Python/API 与 Xvfb PID 未变。
  控制端仍 idle，没有提交 LCMS 实验。
- **遗留：** 未修改远端重连脚本；尾部检查缺陷应由 MIND 脚本维护方修复。后续版本应
  重新核对，不能把本次缺陷视为所有版本都会存在。API/monitor 正常不代表真实仪器实验通过。

## LCMS-002：有线网络直接访问监控

- **目标：** 用户已改用有线网络和 `ssh orin`，希望重新打开只读监控。
- **验证：** `ssh -G orin` 解析为 `wangwenlong@192.168.12.150`；Mac 直接请求
  `http://192.168.12.104:18000/monitor/frame.jpg`，携带私有凭据文件中的 monitor token，
  返回 HTTP 200 和 `image/jpeg`。此次仅验证访问，不判定画面内容或仪器执行状态。
- **使用：** 同一可达 LAN 中直接打开 `http://192.168.12.104:18000/monitor/#<MONITOR_TOKEN>`，
  无需再建 SSH 隧道。若 LAN 直连不通，再通过用户当前可用的 SSH alias 转发端口；
  有线示例用 `orin`，Tailscale 示例用 `orin-tel`，先验证解析，不固定套用旧 alias。
- **范围：** 只读取帧；未重连 RDP、未启停服务、未下发任务。凭据值未写入记录。

## OPS-001：安装现场 Makefile / reset helper

- **症状：** `~/bic-v2/Makefile` 不存在；`scripts/reset.sh` 仍为旧位置参数接口。
- **原因：** 更新脚本将 Makefile 和 reset helper 视为 report-only，不自动覆盖；
  “服务已更新”并不代表“所有运维工具已同步”。现场还缺少 `SITE_NAME`。
- **操作：** 用户授权同步后，备份旧文件和 `.env`，同步 Makefile、reset helper、
  site-name / site-registry helper 和站点配置，仅补充 `SITE_NAME=orin`。
- **验证：** 文件哈希一致、Shell 语法通过、`make help` 正确识别站点；
  `make -n reset DATASET=test SCOPE=agent` 和 `make -n reset DATASET=demo SCOPE=lab`
  仅打印正确命令。除 SITE_NAME 外的配置及文件权限未变。
- **限制：** 没有执行真实 reset，也没有重置数据。安装工具不是 reset 授权；实际执行必须
  明确 `DATASET=test|demo` 和 `SCOPE=agent|lab`，一次只操作一个数据域。
- **备份证据：** `orin-tel:~/bic-v2/backups/operator-sync-20260920-190125/`。

## OPS-002：部署状态检查应尊重服务范围

- **症状：** Chem 已成功更新并健康，但最后的全栈状态检查访问未安装的 Device Compose
  后退出。随后首次 Device 部署又遇到 `DEVICE_PORT: unbound variable`。
- **原因：** 验证阶段丢失了单服务范围；`load_env` 没有补齐 Device 端口默认值。
- **操作：** 本地修复 `ops/field/deploy.sh` 与 `update.sh`：指定服务状态检查不检查排除项；
  Robot Mock 采用运行状态检查而非不存在的 HTTP 接口；Device 端口默认 8012。
- **验证：** 状态范围回归、端口默认值回归、已有 preflight 自检和语法检查通过；
  旧代码对应回归失败。现场指定服务检查通过。没有为了状态检查去部署排除的服务。
- **边界：** 保留被选服务的真实失败；不要用 `|| true` 掩盖健康检查或认证失败。
  后续使用前核对修复是否已进入当前工作树 / 部署包，不假定已发布。

## DEVICE-001：Mind provider 的配置传递

- **背景：** Mind adapter 已在镜像内，但现场 Device Compose 没有传递 `MIND_CONTROL_*`。
  只修改 `.env` 不足以改变容器中的有效配置。
- **操作：** 验证控制端 idle 和没有活动 Analyze，备份 `.env`、Compose、镜像及容器身份；
  增加配置传递，按用户授权写入连接设置，仅重建 Device，保留原镜像 pin。
- **关键细节：** `MIND_CONTROL_URL` 是可空但非空字符串字段。未配置时不能注入空串，
  也不能用字符串 `"null"` 冒充空值。Compose 的裸 mapping 项在未配置时保持 null；
  通过 JSON 配置断言验证，而非只看文本。
- **验证：** fake/happy 默认渲染与显式 Mind 设置的自检通过；现场 Device 健康，
  `DEVICE_PROVIDER=mind`；从 Device 容器访问控制端返回 idle；Lab 收到重启后的新心跳。
  Agent 的 `MIND_MOCK_MODE=true`、Robot Mock、Lab 容器身份均未改变。
- **限制：** 没有提交真实 LCMS 任务。Agent 的模拟 Mind 与 Device 的 provider 是独立选择，
  不能用其中一个配置推断另一个。真实控制服务的能力和报告真实性应核对当前契约。
- **备份证据：** `orin-tel:~/bic-v2/backups/device-provider-mind-20260920-192940/`。

## OPS-003：direct 部署的 dry-run 参数未传递

- **证据：** 检查时统一入口没有把 `DRY=1` 转成 direct runner 的 `--dry-run`，
  `update.sh` 初始化 `DRY=0`。不能把环境变量名当成已经生效的安全保证。
- **状态：** 已确认、尚未修复。没有把调用该入口作为无副作用验证方法。
- **处理：** 准备阶段直接做窄范围只读检查；部署使用正常授权流程。需要修复时同时验证
  参数从入口到 runner 的传递和实际无写入行为，再更新本记录的验证状态。

## 每次记录的最小字段

为每次现场故障或运维动作追加 / 更新记录，并同步上方索引。同一未解决故障的重试可以
追加到原记录，避免制造多个互相矛盾的“已解决”结论。

- 日期、站点 / 主机、涉及服务、当时版本与有效 provider。
- 用户目标、授权范围、必须保持不变的服务 / 数据，以及症状。
- 只读证据：HTTP 状态、相关日志时间、进程 / 容器状态；原始证据位置及其临时性。
- 原因：明确区分已确认原因、推测和被排除的假设。
- 实际执行步骤、前置条件、备份 / 回滚位置；命令使用凭据变量，不写凭据值。
- 验证结果：业务目标是否恢复、哪些范围没有测试、保护对象是否保持不变。
- 状态：已验证恢复 / 部分验证 / 未解决；剩余阻塞与下一步。
- 关联运维手册，以及需要修正或废弃的旧步骤。

只有已验证的步骤才能提升为默认恢复手段。失败或未执行的方法也要记录，但不能写成
成功 SOP。发现旧经验失效时，标明适用版本和替代记录，不把相反结论并排留作现行规则。

## CC-001: CC repeat confirmation conflict

- Site: Orin via `ssh orin`; session `b1f4a7ce-66df-45be-8b1b-7c1db6deadc4`. Scope: read-only diagnosis; no submissions, reset, restart or deployment.
- Versions: Portal `d2329422be893b20ba74b637c41971732feec51a`, Agent `d5ddbde9b86945bfec653141c9d510584fce335d`.
- Verified via Docker logs and persisted session_events (China time): CC analysis PATCH 10:19:32 returned 200. Event 1050 at 10:19:34.934 confirmed result-review decision `e945313b-a801-4326-9dc0-66af8bd26fd6`; event 1051 recorded accepted/passed; POST returned 202. Analyze was created at 10:19:35.044 (1053).
- Second POST at 10:19:36.298 returned 409. Event 1058 records `decision_not_pending`, decision `confirmed`, trial `completed`/`done`, next action `refresh_session`. Saved CC analysis remains present; analysis_completed=true. Analyze params accepted at 10:20:20 (1060), dispatched at 10:20:36.787 (1062).
- Frontend source review: ResultConfirmationPane buttons lack submit-in-flight disabling. use-submit-form only recovers decision_already_resolved for params; result_review falls through to generic error toast.
- Verified: original result accepted; duplicate confirmation rejected without duplicate accepted review. Refresh continuation is user-reported and consistent with persisted state. Unverified: exact browser action producing second request (do not claim proven double-click). No browser reproduction or code fix.
- Follow-up: add result-review submission locking and already-resolved recovery; verify delayed UI updates and rapid repeat clicks.

## 2026-09-21 — Mind agreed PDF deployment and automatic RDP recovery (verified)

- Authorization: Drake approved source implementation, merge to main, .104-only redeploy preserving all keys/tokens/config/other services, and post-deploy reconnect; confirmed nobody operating the instrument PC. SSH route for this wired session: orin. Accepted documented baseline quality-gate exceptions.
- Read-only discovery: Device uses mind at .104:18000. External Mind already had VirtualDemoReportResolver but served a 193-byte blank PDF; Lab could download it. Host source /home/robot-003/mind-lcms-control has no Git metadata. Git branch feat/accepted-instrument-control report source exactly matched the live container.
- Change: PR c12-ai/mind-lcms-control#1 merged to main caa2603a07e90628ac39bb4bbf1d95d4d9d5155a. Existing route serves bundled BIC PDF, 604037 bytes, SHA256 6de8cb51b325763cadfe46597b4e6136bb5ee7588d540b51bec93299ef4bd813. No Device provider-mode change.
- Deployment correction: initial two-file overlay failed importing VirtualDemoReportResolver because original image lacked writable-layer source updates present in the old live container. Rebuilt complete audited runtime/workflow from main over existing dependencies/OCR weights, preserving prior monitor-refresh customization. Isolated import and all-source hashes verified. Only report handler/PDF differ from original live source. Final image 12687eba3883c6c6d376942c797313a3e06ab34127cbe70bc4316df13ef060ca.
- Configuration: original env/Compose hashes and actual env values unchanged. Additive preserve-runtime.compose.json retains absence of LCMS_APPLY_TEMPLATE_BUTTON_CONF, which existed only in the newer disk env, not prior runtime. All unrelated container IDs/start times/restart counts unchanged; mounts/ports/GPU unchanged.
- Connection: before deployment monitor was black and status had automation_failed/no current execution. Corrected startup automatically reconnected; fresh visible Windows desktop, exactly one xfreerdp, stable Python/Xvfb/RDP >4 min, state idle/no current execution. The reconnect script was not run unnecessarily after the connection had recovered. No reset or physical LCMS task.
- Validation: Lab downloaded exact PDF; Device authenticated with unchanged API key. Full offline checks have documented baseline/type/Aardwolf exceptions accepted by Drake; not all-green.
- Recovery: release directory /home/robot-003/mind-lcms-releases/caa2603a07e90628ac39bb4bbf1d95d4d9d5155a holds ROLLOUT.md and rollback.py. Import-tested rollback image mind-lcms-control:rollback-live-4d0ed10 reconstructs prior live runtime. Do not use the old immutable image alone as a working rollback.

## 2026-09-21 — Onsite mock identity corrected before test-lcms (verified)

Drake explicitly required bic-robot-mock use talos.mock and authorized ID update/restart then test. Original Compose ROBOT_ID=${MOCK_ROBOT_ID:-talos.001} fell back to talos.001 because field .env omitted MOCK_ROBOT_ID. Set only MOCK_ROBOT_ID=talos.mock; backup /home/wangwenlong/bic-v2/.env.bak-talos-mock-20260921-171214. Existing robot-mock/mock.sh up consumer guard used; new effective ID, one talos.mock.cmd consumer, fresh idle heartbeats and unchanged other container IDs verified. No SQL state forcing.

Lab demo then Agent test resets succeeded; exact test prompt started session1bf46471-6e6b-40f0-a2ba-4479298cb2b7. Attempt blocked before dispatch by Objective form: reference equivalents empty/disabled yet required, second reactant dose/equivalents missing. No plan/trial/Lab task. Phoenix had no fresh attempt traces (PHOENIX_ENABLED=true, project BIC-agent-service, PHOENIX_ENDPOINT blank). Session/evidence preserved; no retry/reset, code fixes or instrumentation changes. Evidence docs/test-lcms-onsite-2026-09-21-attempt-1/REPORT.md.

## 2026-09-21 — Phoenix endpoint restored (verified)

Drake explicitly requested Phoenix configuration fix. Agent had PHOENIX_ENABLED=true but PHOENIX_ENDPOINT empty; deployed observability.setup_tracing registers exporter only for a nonempty endpoint. Added only PHOENIX_ENDPOINT=http://bic-phoenix:6006 to field .env (backup .env.bak-phoenix-20260921-174641). Waited for Drake-owned Analyze task e505b4d4-c0b5-47b0-be9d-94d9d40cca2f and its analysis work item to settle before recreating only Agent. Same image/model, all remaining env values and other container identities verified unchanged. Startup registered http://bic-phoenix:6006/v1/traces. Phoenix GraphQL getTraceByOtelId confirmed synthetic configuration-check trace3f8500fa1748625adac15bc7042531d8 in BIC-agent-service at09:55:34Z. This is exporter verification, not replayed experiment evidence. Source fix0.14.6 publication is separate and deployment is explicitly on hold while users test.

## LCMS-003: FreeRDP absent (2026-09-21, approximately 18:28 China time)

- Drake requested diagnosis only, no Trellis task; wired access via orin confirmed. No remote mutation or physical task submitted.
- Verified: authenticated status HTTP 200, idle, current_execution_id null, error null. Monitor HTTP 200 JPEG, 33,268 bytes, visually entirely black; temporary evidence /tmp/lcms-black-screen-check.jpg.
- Controller process list: Python 3449474, Xvfb 3449616, no xfreerdp. Container ca68941bfd6e started 2026-09-21T08:47:57.549789149Z, restart count 0. Other container identities/start/restart values captured read-only.
- Desktop RDP is down despite healthy API. Exit cause unverified; narrow common temporary-log checks returned no evidence. Physical-login displacement is not established for this occurrence.
- Unresolved: no reconnect attempted; operator absence unconfirmed. Follow existing recovery runbook only after authorization and fresh idle/operator checks. No general procedure change; entry unreviewed.

### LCMS-003 authorized reconnect attempt, approximately 18:31 China time

- Drake authorized reconnect and confirmed nobody using the physical Windows PC. Fresh API check remained idle/no execution. Captured baseline in /tmp/lcms-reconnect-before.txt; script hash matched a486acf9a6d4856e9884e078b38256e90297bd2bfba1142d1483b13fa30d8ea0.
- Ran existing reconnect entry once via orin. Exit 1 included known PID-field checker error, plus transport failure/Broken pipe. Independent verification found no xfreerdp and a still-black 33,268-byte monitor frame (/tmp/lcms-reconnect-after.jpg). This attempt genuinely did not recover RDP.
- Verified blocker: TCP connection from controller container to its configured Windows target 192.168.12.115:3389 failed with errno 113, No route to host. Power, sleep, cable, addressing or network filtering cause remains unverified.
- All nine container identities/start/restart values unchanged; Python 3449474 and Xvfb 3449616 unchanged. API still idle/no execution/error null. No configuration changes, service restarts, or experiment submissions. No repeated reconnect.
- Outcome: unresolved pending Windows PC/network reachability restoration; ask onsite operator to check awake/power/network.

### LCMS-003 subsequent authorized retry — recovered (verified)

- Drake explicitly requested another reconnect; prior confirmation that physical PC was unused remained applicable. Fresh check: controller idle/no execution, Windows 192.168.12.115:3389 TCP reachable again.
- Executed existing reconnect script once. It returned the known PID-field checker error; actual verification showed exactly one xfreerdp PID 3483461 and a 331,510-byte authenticated JPEG displaying usable Windows desktop with Agilent/OpenLab icons. No second retry was triggered by the false checker failure.
- Python 3449474 and Xvfb 3449616 unchanged; all nine container identities/start/restart values matched the fresh baseline. API remained idle/no current execution/error null. No other service restart, configuration change or physical task.
- Evidence: temporary /tmp/lcms-retry-before.txt, /tmp/lcms-retry-after.txt and /tmp/lcms-retry-after.jpg. Recovery verified; cause was initially unverified and is resolved by the operator follow-up below. Long-term stability was not tested.

### LCMS-003 operator-confirmed root cause

- Drake subsequently confirmed that someone had turned off the LCMS Windows PC; the person is unknown. Drake restarted the PC before requesting the successful retry.
- Root cause: Windows PC powered off (operator-confirmed). Agent evidence independently verified the transition from RDP port unreachable to reachable, then a working desktop after reconnect. No claim that the network error alone proved shutdown.
- Diagnostic update: check physical PC power/awake/network state early, even when the controller API is healthy and idle. Restore PC availability before retrying RDP; preserve the existing idle/operator and service-protection checks. Updated skill operations reference and recovery runbook; changes not yet committed or reviewed.

### LCMS-003 diagnostic refinement from Drake

- Evidence must lead the diagnosis: failed controller-to-PC TCP access supported an unreachable RDP endpoint, not a specific power or WiFi cause. Drake identified loss of the dedicated Cohes WiFi as another possible cause to investigate in future incidents. No WiFi fault was established in this incident.
- Updated operations reference and runbook to separate observations, possible causes and distinguishing checks (power/awake, Cohes WiFi association, current IP and available route/network evidence). No new onsite operations or network changes performed for this documentation update.

## 2026-09-21 - Device provider environment rule (user-confirmed)

Drake clarified that real Mind requires the physical LCMS PC/controller and applies only to BIC onsite; AWS test must use fake. Updated operations reference and session lesson. This is a required environment boundary, not a verification of current AWS configuration. No onsite connection, provider switch or deployment performed. Agent MIND_MOCK_MODE and Robot Mock remain independent.

## 2026-09-21 - Default reset pair clarified (user-confirmed)

Drake explained that the current robot follows a single happy path with dependent
starting postures, so each new round needs preparation/reset. His default reset
request means Lab demo followed by Agent test, restoring preparation/material
data and clearing Agent business state. This matches test-lcms. Updated the
existing onsite skill routing, operations reference and session lesson. No live
reset performed; physical stock/posture and runtime reset outcome were not
verified in this documentation-only turn.

## 2026-09-21 18:55 China time - Authorized paired onsite reset (verified)

- Drake authorized reset using established Lab demo then Agent test defaults, and reiterated the make entry requirement. Target orin, wired SSH, ~/bic-v2.
- Preflight: Lab tasks all completed, controller idle/no execution. Remaining Agent jobs were pending Fraction Pool; pending trial collecting_params had no lab_task_id/start time (execution_status field said dispatched, so that field alone was not taken as proof of active physical execution).
- Private pre-reset snapshots: /tmp/bic-onsite-reset-20260921/{lab-before,agent-before}.dump on Mac, mode 0600. Temporary retention; not committed and restore not tested.
- Executed make reset SCOPE=lab DATASET=demo, then make reset SCOPE=agent DATASET=test; both returned HTTP 200/status ok through the existing helper. No direct SQL mutations or substitute reset calls.
- Verified afterward: Lab tasks 0; materials available 33, unused 193, none using/used; all 3 auxiliary devices idle; robots 2 idle and 2 disconnected. Agent sessions/jobs/trials all 0, users preserved at 1. Physical consumables/posture not verified.

### Paired-reset backup policy correction

Drake clarified that the current onsite environment is not used by real clients.
Routine reset backups are unnecessary; he will explicitly signal when real data
requires protection. Updated the default reset procedure and session lessons.
The already-created temporary snapshots were not deleted by this documentation
change. Physical execution checks remain applicable. No additional live reset.

## LCMS-004: Desktop recovered, device still held by a stuck execution (2026-09-22)

Status: **partially verified** — RDP recovery verified; the device was not returned to idle.

- Site/target: BIC onsite, wired entry `ssh orin`; controller `robot-003@192.168.12.104`,
  container `mind-lcms-control` (up 12 h at the time). Request: reconnect the LCMS RDP
  session, after first checking device status and resetting it if it sat in an error state,
  without disturbing any running service container.
- Read-only evidence before any mutation:
  - `GET /v1/device/status` → `state=working`, `current_execution_id=0e92f04a-…5347f7`,
    `error=null`. The requested "error state" condition was **not** met; the device was busy.
  - `GET /v1/executions/<id>/events` → one `running` event, `terminal=false`, unchanged
    across ~50 minutes and a further 2-minute poll.
  - `bic-device-service` logs: the execution was submitted at 10:03:40 and the service polled
    its events once per second, so a BIC Analyze task was waiting on it.
  - Monitor frame: HTTP 200, 33,268-byte black JPEG — the known black-frame signature.
  - `docker top mind-lcms-control -eo pid,comm,etime`: python 3545697 and Xvfb 3545812 present,
    **no `xfreerdp` at all** — the RDP session had already died on its own.
  - TCP probe from the controller container to `LCMS_RDP_HOST:3389` → reachable, so the Windows
    PC was powered on. This is **not** the LCMS-003 power-off case.
- Authorized actions and results:
  1. `POST /v1/device/recover` → `409 device_busy`. The endpoint recovers an errored device and
     will not preempt an execution holding the lock. This matches MIND's Path B note.
  2. One run of `/home/robot-003/reconnect-lcms-rdp.sh` (SHA-256 `a486acf9…d8ea0`, unchanged),
     authorized by Drake despite the non-idle state because no live RDP session existed to disturb.
     It exited 1 with `xfreerdp did not stay up` — the known PID-field checker defect, not a real
     failure; its log tail showed a fresh connection past the self-signed-certificate warnings.
  3. Verified after: exactly one `xfreerdp` (PID 3810169); python 3545697 and Xvfb 3545812
     unchanged; all controller-host containers unchanged; monitor frame HTTP 200 at 322,537 bytes
     showing a usable Windows desktop with Agilent/OpenLab icons and a live clock.
- Unresolved: restoring the desktop did **not** unstick the execution. Status stayed `working` on
  the same execution with no new events, and a repeat `recover` still returned 409. No cancel exists
  on the controller API or on `bic-device-service`. MIND's Path B
  (`docker restart mind-lcms-control` → health ok → `recover` → confirm idle) was supplied after
  this session and was not executed here; it is the next step when this recurs.
- Carry-forward facts: a black frame plus a reachable Windows PC plus zero `xfreerdp` means the
  session died by itself, and a stuck `working` execution does not resume merely because the
  desktop returns. Until the device is cleared it accepts no new LCMS execution and the waiting
  BIC Analyze task cannot complete.

### LCMS-004 continued — root cause found, Path A verified twice (2026-09-22, 11:14-11:36)

- Someone restarted `mind-lcms-control` at about 10:58 outside this session. That killed display
  `:99`, so stuck execution `0e92f04a` finally went terminal as `run_failed` /
  `run_aborted: Unable to open display: b':99'`, releasing the device lock and leaving
  `state=error` with `current_execution_id=null`. The Analyze task submitted at 10:03 is dead.
- **Path A verified twice.** `POST /v1/device/recover` at 11:14:22 and again at 11:31:57 both
  returned `{"state":"idle","current_execution_id":null,"error":null}` immediately. Path B was
  therefore never needed and remains **unverified onsite**.
- **Root cause of the repeated black screens: another login evicts the controller's RDP session.**
  The FreeRDP log recorded `ERRINFO_DISCONNECTED_BY_OTHER_CONNECTION (0x00000005)` at 03:28:31 UTC,
  matching the third drop. Three drops occurred in about 45 minutes. Reconnecting succeeds each
  time but only until the next login, so repeating the script is not a fix — the person logging
  in has to stop, or MIND has to change the session policy.
- Second error shape seen once the screen is black and something dispatches anyway:
  `automation_failed: 无法从当前帧解析点击目标`. Expect to run Path A before each reconnect.
- Two reconnects run (11:17 and 11:32), each verified by exactly one `xfreerdp`, unchanged
  python/Xvfb PIDs (3812156 / 3812294), unchanged containers, a desktop frame with a current clock,
  and `state=idle` afterwards. The script exited 1 both times with the known PID-field defect.
- Note on evidence quality: at 11:18 two frames five seconds apart differed (322,449 vs 322,453
  bytes), proving a live capture. At 11:32 they were byte-identical on a still desktop, which is
  expected and was corroborated by the visible clock, but is weaker proof.
- Still open: the LCMS application is not on screen after a fresh reconnect, so an operator step
  may be needed before the next Analyze run.

## MIND-supplied device reset procedure (2026-09-22, supplied by Drake, unverified onsite)

MIND colleagues supplied the two-path procedure now recorded in
[Clear a non-idle device before reconnecting](lcms-rdp-recovery.md#clear-a-non-idle-device-before-reconnecting):
Path A `recover` for `error` with no execution, Path B `docker restart mind-lcms-control` for a
stuck `working` execution, then `recover` and confirm idle. MIND maintains the controller service,
so Drake ruled on 2026-09-22 that they are the authority on it: this procedure overrides the
previous BIC-side rules against the recovery endpoint and against restarting the controller
container, and those older rules are not retained as parallel options. The limits MIND gave with
the same procedure still hold — no `docker compose down`, no other containers, no `lcms.4080.env`
edits, no hand-editing the controller SQLite.

Access route is the one exception, by Drake's ruling the same day: BIC shares a different route
with MIND, so keep using the BIC route (`-J orin` wired, `-J orin-tel` over Tailscale). MIND's
jump host and their "a Mac cannot reach `.104` directly" note describe their identity and network;
on 2026-09-22 the BIC route worked (direct `http://192.168.12.104:18000` returned HTTP 200 and the
ProxyJump SSH authenticated). This is an access-path choice only and does not reduce MIND's
authority over the controller procedure.

Path B was not executed onsite in this session, so it stays `unverified` until a live run confirms
it. Note that it restarts Python/Xvfb, so this runbook's protected-PID comparison applies to a
reconnect, not to an authorized Path B restart.
