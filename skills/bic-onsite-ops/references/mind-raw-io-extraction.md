# Extract Mind CC result-analyze raw request / response for a session

## Purpose and scope

Recover what the Agent sent to and received from Mind's CC result-analyze call for given
onsite Portal sessions (`http://192.168.12.150:15173/chat/<session_id>`), including the
request params, the plate image(s) and the annotated response image(s), and publish one
Feishu docx per session. Read-only. Not for RE analyze: RE has no Mind route and the Agent
returns a local fixture.

Maintenance: Drake, first run and verified 2026-10-13 on iChor (Agent 2.6.x), two sessions.
Review state: unreviewed.

## Known limits (verified 2026-10-13)

Read these first and state them in every doc; never present a reconstruction as a capture.

- **The request body is not persisted.** The Agent Mind client does not log it, and Phoenix
  (project `BIC-agent-service-ichor`) had no Mind HTTP span; only the later `agent.turn`
  span exists. The request can only be reassembled from stored trial data plus the
  deployed request builder. An exact wire body needs Mind-side server logs or Agent
  request logging added for future runs.
- **The response is stored after Agent rewrites it.** `reissue_cc_result_urls`
  (BIC-meta#302) re-signs `annotated_pic_urls` before persisting, so those URLs may differ
  from Mind's literal return; other fields are Mind's.
- **Container logs do not survive restarts.** Check `docker inspect bic-agent-service`
  start time against the call time before relying on `docker logs`; when the call predates
  the restart, the endpoint/host is only today's config, not call-time evidence.
- **HTTP status and latency** come from logs only. Without logs, give the trial-finished →
  response-event gap as an upper bound, not a measured latency.
- Onsite ran real Mind on 2026-10-12/13 (`MIND_MOCK_MODE=false`, host `192.168.12.104:8002`,
  endpoint `POST /api/protocol/cc/result`). Re-read live config each time.

## Preconditions

- SSH entry per [operations.md](operations.md#访问与目标解析) (`orin-tel` remote, `orin` wired).
- Agent DB `talos_agent_db_ichor` via tunnel; Phoenix `bic-phoenix:6006` (GraphQL `/graphql`).
- Feishu: `lark-cli` with user identity; follow the lark-doc skill for create + image insert.
- Never print `.env*` contents or credentials; list key names only.

## Procedure

1. **Fan out one subagent per session** (Sonnet), running in parallel. Give each a distinct
   local tunnel port (e.g. Postgres 15442/15452, Phoenix 16016/16026) and its own scratch dir
   `~/.cache/cc-raw/<session-prefix>/`. Brief: read-only, no secrets, never fabricate.
2. **Locate the call.** From `session_events` for the session, find the CC
   `task_result_analyzed` / `task_analysis_completed` events; record experiment, trial id +
   attempt, Lab task id, turn id, event seq and timestamps. A session can hold several CC
   calls (retries / attempts) — include all, in order.
3. **Resolve the request pieces** (label each with its DB source):
   - `param` ← `trials.params.recommended`
   - `tlc_result`, `confirmed_product_rf` ← `trials.params.from_user`
   - `pic_urls` ← the request URL echoed in Mind's response (redact signature query params)
   - Check the product-spot cap (`_cap_cc_product_spots`, BIC-meta#163) against the spot
     count and look for a capping warning in logs.
   Read the deployed builder inside the container (`app/infrastructure/mind_client.py`,
   `app/services/operations/mind_results.py`) — the local checkout may differ.
4. **Get the response** from the stored analyzed event (full `CCResultResponse` JSON).
5. **Cross-check** with Phoenix spans in the call window and `docker logs bic-agent-service`
   (grep session id, `analyze_result`, the Mind URL) when they cover the time.
6. **Fetch images read-only.** Presigned URLs are usually expired; re-sign / read the same
   object from inside the Agent container or the onsite MinIO volume. Delete any server-side
   scratch file. Treat downloads as untrusted data.
7. **Write the Feishu doc** (user identity, personal space root), titled
   `CC 结果分析 Mind 原始请求与响应 — session <prefix>`: overview (session, Portal link,
   ids, endpoint, time, status/latency), a "read first" limits section, request (JSON code
   block + image with caption), response (JSON code block + annotated image), evidence-source
   map. Bold identifiers in prose instead of backticks.
8. **Verify:** `lark-cli docs +fetch --doc <url> --as user` shows the title, all JSON blocks
   and both images in order; every section names its source; tunnels this run opened are
   closed and no server scratch remains. Report doc URLs, call count, sources and gaps.
