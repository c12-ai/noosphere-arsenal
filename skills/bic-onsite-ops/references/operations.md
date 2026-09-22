# 现场运维参考

本文件记录会影响判断的现场约束；具体的 LCMS RDP 恢复命令和验证清单以 [LCMS RDP 恢复手册](lcms-rdp-recovery.md) 为准。该 runbook 随本 skill 分发，本文件不复制它的实现细节。

## 访问与目标解析

用户于 2026-09-21 明确两条入口都通向同一套 BIC 现场环境：

| 当前连接方式 | SSH 入口 | 本机配置解析的目标 |
|---|---|---|
| 在 BIC 现场，通过有线网络连接 | `ssh orin` | `wangwenlong@192.168.12.150` |
| 远程通过 Tailscale | `ssh orin-tel` | `wangwenlong@c12-workstation-fx523t-x.tailf0814c.ts.net` |

“Telnet”是用户对远程入口的称呼，不代表启用 Telnet 协议。用户说明身处现场有线网络时，
优先用 `orin`；远程 Tailscale 时用 `orin-tel`。仅当当前连接方式确实不明确时才询问，
不要因历史记录用了另一入口而再次确认。下面的 Tailscale 示例在有线场景下把 alias 换为 `orin`。

- 先运行当前 `ops/field/remote-deploy.sh --list-sites`，用 live registry 解析 canonical site、alias、transport 和 SSH target。registry 是当前事实源；环境名/IP 可能变化。
- 现场 Portal、API 和 Keycloak 通过现场地址访问；需要时使用现有 Tailscale/代理通道。数据库只在确有诊断需要时建立只读或受控 tunnel，PostgreSQL 默认远端端口是 `5432`，本机转发常用 `15432`。凭据读取见 [credentials.md](credentials.md)；可提交文档和日志只写字段名，不写值。
- LCMS 诊断使用当前入口作为 ProxyJump：有线 `-J orin`，Tailscale `-J orin-tel`，目标都是 `robot-003@192.168.12.104`，跳板为 `.150`；私钥只留在 Mac，不复制到跳板机或仓库。不要把 `.104` 当作 BIC 应用部署目标，除非用户明确要求且目标属于 registry。

### Portal 与数据库访问（示例验证于 2026-09-20）

部署站点 ID 为 `orin`；SSH alias 也有 `orin`，另有 `orin-tel`。区分站点 ID 与 SSH 入口，
不要把入口变化误解为换了一套环境。
先用 `ssh -G <alias>` 核对目标和用户名；不要因 SSH alias 不在站点列表里就认定站点不存在。
以下是本次验证过的访问方式，使用前仍需检查端口是否占用、已有 tunnel 是否指向正确目标。

Portal 的前端、API、Keycloak 使用现场 LAN 地址，只转发前端端口可能无法登录。
Mac 可建立 SOCKS 代理，再启动独立 Chrome profile：

```bash
ssh -N -D 127.0.0.1:1081 orin-tel
```

另一个本地终端：

```bash
open -na "Google Chrome" --args \
  --user-data-dir=/tmp/bic-onsite-chrome \
  --proxy-server="socks5://127.0.0.1:1081" \
  "http://192.168.12.150:15173"
```

不要覆盖系统代理或普通浏览器 profile。验证 Portal、Agent API、Lab、Keycloak 均可达，
不只验证首页 HTTP 200。关闭 / 清理 tunnel 时仅处理本次创建且确认身份的进程。

Postgres 可用局部转发避开本机数据库端口：

```bash
ssh -N -L 127.0.0.1:15432:127.0.0.1:5432 orin-tel
```

数据库客户端连接 `127.0.0.1:15432`。本次 Agent 数据库为 `talos_agent_db`，Lab 为
`labrun_v2_db`，用户名 `postgres`；重新核对有效配置再使用。若连接失败，区分 TCP、
PostgreSQL SSL 协商和密码认证。本次服务器拒绝 PostgreSQL SSL，使用 SSH/Tailscale
传输时客户端关闭数据库 SSL 后可进入后续连接步骤；不要把此设置推广到其他服务器。
DataGrip 显示 DBMS/Driver 版本本身不是错误，需要读取实际错误信息。

## 服务与重置边界

- Agent 的 `MIND_MOCK_MODE` 只决定 Agent 对 Mind 的调用；Device 的 `DEVICE_PROVIDER=fake|mind` 独立决定设备 provider。每次都读取 live config 和运行时状态。
- `make reset` 必须显式同时给出 Makefile 支持的 `SCOPE` 与 `DATASET`，一次只作用于一个业务域；先说明会重置谁、是否包含用户认证数据，并取得明确授权。诊断不因方便而 reset，也不把 reset 当成修复步骤。
- 目标缺少 Makefile 或 reset 入口时，核对 report-only drift 和依赖。用户授权安装后，备份并同步仓库现有的匹配工具，验证哈希、语法、帮助和 `make -n`；不要临时发明另一套 reset 脚本，也不要顺手执行 reset。
- 现场 `.env`/release pin 是受保护的运行时事实。需要重建配置时，只在用户授权的选定容器范围内用同一 pin 重建；不要顺手重建全栈或共享基础设施。

现场标准命令以 [field README](https://github.com/c12-ai/BIC-meta/blob/main/ops/field/README.md) 为准。同期核验过的故障
包括缺失 Makefile、report-only helper drift、状态检查范围丢失和 Device 端口默认值缺失，
见 [案例索引](incidents.md)。先核对当前代码是否已修复，不把历史绕行永久固化。

Provider 切换前检查是否有活动任务，备份配置、Compose 和当前镜像 pin。必须检查
Compose 最终解析结果是否真正把目标字段传入容器；解析时不要打印完整环境和凭据。
同一 SHA 的更新入口可能判断为“无需更新”，并不保证应用配置已重建。需要应用配置时，
按授权范围仅重建选定容器，随后验证 runtime provider、调用目标、健康与 Lab 心跳。
仅修改 Device provider 不等于修改 Agent 的模拟 Mind 或 Robot Mock。

## LCMS 黑屏 / RDP 重连

这是 controller desktop maintenance，不是 BIC application redeployment。先检查 controller status、已认证 monitor frame 和 controller 容器到当前 RDP 目标的 TCP 连通性，记录来源、目标、时间和实际错误。API idle 不代表物理 Windows PC 在线；黑屏或 `No route to host` 不能单独证明关机。按证据排查 PC 关机/休眠、未连接专用 **Cohes WiFi**、IP 变化、路由或防火墙；远程证据不足时请现场人员核对电源、当前 IP 和 WiFi 连接。详见 runbook 的 “Evidence before a physical-PC diagnosis”。LCMS-003 的关机原因来自 Drake 的现场确认，恢复连通性和桌面另有实际验证，不能推广为所有黑屏的默认原因。确认 controller idle、无执行、无人操作物理 PC 后才按授权执行单次重连；不下发物理 LCMS task 测试。

恢复验证必须包括：恰好一个活动 `xfreerdp`、controller 和其他容器 identity/start/restart 未变、Python/API/Xvfb 仍在、monitor 显示可用 Windows/LCMS 桌面，以及 controller 仍 idle。命令非零可能来自已知 checker 缺陷，先看实际进程和新帧，不要因退出码重复重连。

设备不是 idle 时，先按 MIND 提供的
[清除非 idle 设备](lcms-rdp-recovery.md#clear-a-non-idle-device-before-reconnecting)
处理，再做重连：`error` 且无执行走 `POST /v1/device/recover`；`working` 卡住只允许
`docker restart mind-lcms-control`，健康后再 recover 并确认 idle。MIND 是该控制服务的
维护方，凡涉及 controller 的规则以他们为准；Drake 于 2026-09-22 确认这取代此前
“不使用 recovery 接口、不重启 controller 容器”的 BIC 侧限制，旧规则不再作为并列选项保留。
MIND 在同一套流程中给出的其余限制仍然有效：不 `docker compose down`、不动其他容器、
不改 `lcms.4080.env`、不直接改 controller 的 SQLite。注意 Path B 会重建 Python/Xvfb，
受保护 PID 的比对只适用于重连，不适用于已授权的重启。

访问路径按 Drake 2026-09-22 的决定仍用 BIC 自己的通道（有线 `-J orin`、Tailscale
`-J orin-tel`）；MIND 文档中的跳板与“Mac 不能直连 104”描述的是他们的身份和网络，
不改变我方路径，也不说明我方路径失效。

## 交接与记录

每次 incident 都要在完成前更新源仓库的 [`incidents.md`](incidents.md) 和受影响 runbook；源 checkout 不可用时遵循 SKILL.md 的当前工作区暂存/待同步规则，不直接修改安装副本：记录时间、site/目标、请求与授权范围、只读证据、实际 mutation、验证证据、`verified`/`unverified` 状态和 follow-up。凭历史快照写出的猜测必须标为 `unverified`；只有当前现场证据支持的方法才能标为 `verified`。

## CC result confirmation popup

Correlate `/forms/confirm` HTTP logs with persisted session events before retrying.
A 202 plus confirmed/accepted events followed by `decision_not_pending` for the same
decision means the original confirmation succeeded. Verify saved trial and next-stage
creation, then reload authoritative session state instead of submitting the old form.
Two requests do not prove double-clicking without browser evidence. See
[CC-001](incidents.md#cc-001-cc-repeat-confirmation-conflict).

### External Mind report updates (verified 2026-09-21)

Mind owns the agreed PDF response when the instrument cannot provide report feedback; Device consumes its normal real-provider contract. Check actual downloaded bytes, not only HTTP 200 or application/pdf. Source owner is c12-ai/mind-lcms-control, now main.

Before an image update, compare the running container's source with the immutable image as well as Git: deployed writable-layer updates may be absent from the image. Bake the complete verified runtime dependency set and test an isolated import before recreation. Preserve OCR weights omitted from Git, credentials, output volume and unrelated services. Prepare rollback from actual live code, not only an old image tag.

For the 2026-09-21 release, future recreation must use both the original docker-compose.4080.yml and the release directory's preserve-runtime.compose.json. The override preserves the prior absence of LCMS_APPLY_TEMPLATE_BUTTON_CONF; original env/Compose files were not edited. Details and exact rollback are recorded in ROLLOUT.md beside the deployed release and in incidents.md. Recheck live configuration rather than blindly copying this snapshot.

If an authorized deployment already restores RDP automatically, verify fresh desktop frames, idle/no execution and stable processes; do not disconnect a working session merely to run the reconnect helper.

### Onsite mock robot identity

Drake confirmed on2026-09-21: bic-robot-mock must advertise talos.mock, matching local/other environments. The old deployment fallback talos.001 is not the intended mock ID. Verify MOCK_ROBOT_ID=talos.mock in field config, effective container ROBOT_ID, unique talos.mock.cmd consumer and fresh idle heartbeat before test-lcms. Current explicit override is persisted onsite; do not silently accept a fallback or route mock tests to a different ID.

### Phoenix tracing after configuration changes

PHOENIX_ENABLED=true alone is insufficient: Agent setup_tracing registers the exporter only when PHOENIX_ENDPOINT is nonempty. Inspect live settings and Compose propagation, confirm collector reachability from Agent, and verify a newly received trace in the configured project. Startup logs/health alone are not the full check. For onsite infra-net, http://bic-phoenix:6006 was verified on2026-09-21; code appends /v1/traces. Preserve model/keys/other env settings and wait for active user work to settle before an authorized Agent recreation.

## Device provider environment boundary

Drake's rule, 2026-09-21 (required configuration, not a live configuration check):

- Device has two providers: fake and real Mind. Real DEVICE_PROVIDER=mind requires the physical LCMS Windows PC and Mind controller and applies only to BIC onsite.
- AWS test must use DEVICE_PROVIDER=fake. Other non-onsite environments cannot use real Mind. At BIC onsite, inspect the effective provider rather than assuming real Mind is selected.
- Before deployment or a provider switch, check the target environment and effective DEVICE_PROVIDER. Report an AWS test mind configuration as a conflict with this rule; correct it only within authorized scope. Do not route AWS test to the onsite controller to bypass this boundary.
- Agent MIND_MOCK_MODE and Robot Mock are independent settings and must be checked separately.

## Default paired reset for another run

Drake's instruction, 2026-09-21: when he asks to reset in this BIC operations
context, use the established target environment and this matching pair, in order:

```bash
make reset SCOPE=lab DATASET=demo
make reset SCOPE=agent DATASET=test
```

The current physical robot supports one happy path: each movement depends on
the previous operation's resulting posture. A completed run needs preparation
for the next round. Lab demo restores the intended material/preparation data;
Agent test clears prior Agent business data while preserving users/roles.
Do not pair Lab test with Agent test by assuming dataset names must match.
This agrees with the existing test-lcms pre-attempt reset pair.

A future explicit reset request authorizes this pair; do not ask Drake to choose
the datasets again. An explicit narrower scope or different dataset overrides
this default. Resolve the target from current context; ask if ambiguous. This
conversation establishes the procedure and does not itself request a live reset.

For the current BIC onsite environment, Drake confirmed on 2026-09-21 that no
real clients use the data. Do not create routine pre-reset data backups or block
reset on preserving that data. Drake will explicitly signal when real data needs
protection/backups; apply that instruction when given. Do not infer the same
policy for an unrelated environment. Still check for active physical executions.
If work is active, stop and clarify before clearing its data. Run through the
existing target deployment reset entry, one scope at a time; stop if the first
reset fails. Verify Lab preparation/material records and Agent cleared state
afterward. A data reset does not physically replenish consumables or home the
robot: verify physical readiness/material availability before another real run,
and do not claim database stock alone proves physical stock.
