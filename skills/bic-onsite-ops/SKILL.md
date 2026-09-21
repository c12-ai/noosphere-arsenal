---
name: bic-onsite-ops
description: BIC 现场故障诊断、运维处理及经验记录，涵盖现场访问、provider、重置入口和 LCMS RDP 恢复；不用于通用本地 bench 调试。Use when the user says "BIC 现场运维", "现场故障处理", "LCMS 黑屏", or "RDP 重连".
---

# BIC 现场运维

## 全局安装与工作区

本 skill 的维护源是 `c12-ai/noosphere-arsenal` 的 `skills/bic-onsite-ops/`；安装目录是分发副本。
本包只提供 BIC 运维知识，不包含服务器部署工具或凭据。使用 BIC 工具前，从当前会话明确的工作区、显式 `BIC_ROOT` 或当前目录的 BIC checkout 解析根目录，并核验 `ops/field/remote-deploy.sh` 与站点 registry；不要相对全局 skill 安装目录寻找这些工具。目标工作区不明或缺少 registry 工具时先报告并询问，在解析完成前不执行现场操作。
文中的 `ops/field/...` 命令均相对已解析 BIC 根目录；服务器 `make` 命令在已核实的部署目录执行。历史地址、alias 和指纹是有日期的案例，不代替 live registry/profile。
维护经验时修改 Noosphere Arsenal 源 checkout 的本 skill；安装副本不作为唯一维护源。源 checkout 不可用时，先把脱敏 incident 保存到当前工作区并注明待同步，不能丢失记录或声称已发布。提交/推送遵循当前用户授权。


同一套 BIC 现场环境有两种 SSH 入口：现场有线用 `orin`，远程 Tailscale 用
`orin-tel`（用户有时称为 “Telnet”，实际仍是 SSH）。按用户当前连接方式选择入口，
不要固定使用旧会话的 alias；这也决定访问 `.104` 时的 ProxyJump 和各类隧道入口。

Drake 要求“reset / 重置”时，默认按当前明确的目标环境执行 Lab `demo` → Agent `test` 配对；前置检查、覆盖规则和验证见 [默认配对重置](references/operations.md#default-paired-reset-for-another-run)。不要重复询问已确定的 dataset；目标不明或有活动执行时先澄清。

按以下顺序处理每个现场问题。编写或更新手册、记录和评审时，遵循
[`references/governance.md`](references/governance.md) 的结构、术语、版本控制及评审规则。

1. **确定目标。** 从当前 live registry 解析 site、服务和 SSH 目标，再连接；不要把历史环境名或旧 IP 当永久 allowlist。需要鉴权时按 [`references/credentials.md`](references/credentials.md) 读取本机私有凭据，不将其复制进 Skill 或日志。部署、更新或命名服务发布转给 `bic-remote-deploy`（从已解析 BIC 工作区加载；未安装时不要自行替代部署流程）；完整 TLC→CC→Analyze→Fraction Collection 流程转给 `test-lcms`（按名称加载已安装 skill；缺少时报告依赖缺失；仅在用户授权安装后从 Noosphere Arsenal 安装）。
2. **先读现状。** 读取当前 provider、容器、健康状态和相关日志；不要依据历史推断 fake/MIND。Agent 的 `MIND_MOCK_MODE` 与 Device 的 `DEVICE_PROVIDER=fake|mind` 是独立开关。
3. **保留只读证据。** 先做最小范围的状态、日志、进程和 UI/帧检查，并把证据与已知案例匹配。HTTP 200、进程存在或 PID 存在都不能单独证明恢复成功。
4. **再做授权变更。** 只执行用户已明确授权且范围明确的 mutation；已有明确授权无需重复询问。现场诊断默认不提交物理 LCMS 任务。LCMS RDP 重连前确认 controller idle、无 current execution、无人使用物理 Windows 电脑，并记录受保护容器/Python/API/Xvfb 状态；只运行既有 reconnect 入口，不改容器、API、Xvfb、密钥或 SSH 配置。详细步骤见 [LCMS RDP 恢复手册](references/lcms-rdp-recovery.md)。
5. **验证真实结果。** 同时检查业务状态和可见结果（例如 LCMS monitor 的实际桌面帧）；不要只看命令退出码、HTTP 200 或 PID。一次重连失败码也要先检查真实进程和画面，避免重复执行。
6. **记录经验后完成。** 每个 incident 在完成前都要更新源仓库的 `skills/bic-onsite-ops/references/incidents.md`，并更新相关 runbook；标明 `verified` 或 `unverified`，写清日期、目标、只读证据、授权动作、结果和残余风险。新的方法必须先在现场复现/核验，再进入 verified 条目；未经核验只能记录为 unverified。
7. **核验处理与记录。** 确认本次成功结论有实际证据、保护对象保持不变、未验证范围明确；检查故障索引及手册链接，没有重复或冲突的现行步骤，且没有凭据值进入可提交文件。未解决的问题也必须记录，再报告具体阻塞。

日常访问、代理、重置边界、provider 选择和 Mac→`.150`→`.104` 的 LCMS 通路见 [`references/operations.md`](references/operations.md)。故障索引和追加记录格式见 [`references/incidents.md`](references/incidents.md)。按当前请求处理现场，不因读取旧记录而自动执行操作；仅要求整理 Skill 时不连接或修改现场。
