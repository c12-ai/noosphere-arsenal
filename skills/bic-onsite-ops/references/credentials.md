# 私有凭据读取

用户于 2026-09-21 要求保存已提供的密码和 token，供后续现场运维复用。
凭据值保存在本机私有文件，不保存在可提交的 Skill、案例、日志或 PR 中。

```text
~/.config/bic-onsite-ops/credentials.json
```

目录权限为 `0700`，文件权限为 `0600`。该文件独立于本项目工作树；换机器时不会随 Git
自动同步。SSH 私钥仍位于原路径，未复制进凭据文件或 Skill。

## 字段

顶层为 `schema_version` 和 `sites`。已保存的现场 profile 为 `sites.orin`：

| 字段 | 用途 |
|---|---|
| `postgres.host` / `port` / `username` / `password` | BIC 现场数据库连接 |
| `postgres.source` / `verification` | 配置来源和验证范围 |
| `mind_lcms.ssh_host` / `ssh_username` | 控制机 SSH 目标 |
| `mind_lcms.ssh_identity_file` / `ssh_proxy_jumps` | 本机密钥路径，以及 `wired=orin` / `tailscale=orin-tel` 两个跳板入口；按当前网络选用 |
| `mind_lcms.ssh_password` | 用户提供的控制机 SSH 密码；未单独测试密码登录 |
| `mind_lcms.control_url` / `api_key` | 控制服务四接口，使用 `X-API-Key` |
| `mind_lcms.monitor_token` | 只读监控，使用 `X-Monitor-Token`；不能与 API key 混用 |
| `mind_lcms.ssh_verification` / `http_verification` | 登录及接口验证范围 |

## 使用规则

1. 先确认当前目标和用户授权，再从该文件把所需字段读入调用程序的内存。
   不用 `cat`、调试输出或整个 Docker inspect 环境块打印全部凭据。
2. 优先使用已验证的 SSH 密钥方式。保存的 SSH 密码是后备资料，不是已验证登录成功的证明。
   目标拒绝认证时先核对用户名、密钥和跳板路径，不反复尝试密码。
3. HTTP 调用在程序中构造认证 header；不要把 token 写入报告链接、截图或运行日志。
   用户明确要求查看某项凭据时，只展示该项，避免顺带输出其他秘密。
4. 目标、token 或密码轮换后，在用户授权范围内更新这个私有文件和验证日期；Skill 和故障
   记录只写字段名、来源及验证结论。保留不相关 profile，维持文件权限。
5. 文件不存在或权限不足时，说明缺少哪类凭据并让用户通过已有安全渠道提供或配置。
   不使用旧聊天值猜测新凭据，不把值硬编码进恢复脚本。

## 读取示例（不输出值）

```python
import json
from pathlib import Path

store = Path.home() / ".config/bic-onsite-ops/credentials.json"
profile = json.loads(store.read_text())["sites"]["orin"]["mind_lcms"]
api_headers = {"X-API-Key": profile["api_key"]}
monitor_headers = {"X-Monitor-Token": profile["monitor_token"]}
# 将 headers 传给已授权的请求；不要打印 profile 或 headers。
```
