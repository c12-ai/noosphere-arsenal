---
name: test-lcms
description: Run the BIC TLC-to-CC-to-Analyze LCMS test scenario through the Portal using CDP and Phoenix evidence, with lab demo and agent test resets before each full attempt. Use when asked to test this LCMS workflow from parameter setting through dispatch, running, finished Analyze execution, the per-vial result review and Confirm, up to the opened Fraction Collection form (never dispatched).
---

# Test LCMS

Exercise the experiment through the real Portal, using **CDP and Phoenix as the sources of truth**. Creating or editing this skill does not itself start an experiment or reset a bench.

## Scope and evidence

- Use Chrome DevTools Protocol (CDP) to inspect and operate the Portal. Load the available Chrome DevTools skill for the selected CDP tool. Capture rendered forms, selected values, confirmation states, dispatch requests/responses, and visible execution/results.
- Use Phoenix to inspect the corresponding agent traces, tool inputs/outputs, errors, and dispatch behavior. Discover its configured endpoint and available tools; correlate traces with session/trial/task IDs and attempt timestamps. Old traces are not evidence for a new attempt.
- Report UI and trace disagreements explicitly. A click, assistant prose, or successful HTTP response alone does not prove a task was dispatched or completed. Missing CDP or Phoenix access makes verification incomplete; report the missing source.
- Database rows, health checks, and service logs support bench diagnosis and preconditions. They do not substitute for the CDP/Phoenix evidence of the tested workflow.
- If project instructions require a live-bench runner agent, dispatch that agent with this entire scenario and the resolved bench target. This scenario overrides older runner defaults for datasets, robot identity, step order, and evidence sources. Use one operator on the shared bench.

## Resolve before running

Read the current BIC workspace instructions and `.bic-env`; identify the actual checkout, service endpoints, stage configuration, and running processes before any reset. Inspect any reset/restart helper and its transitive calls to ensure it targets that bench. Use the existing test bench; ask if its target or ownership is unclear.

**Local login:** for the verified local Portal and its local Keycloak login page, use username `dev` and password `dev` (provided by Drake). Sign in through the normal UI when prompted and verify the authenticated Portal loads. These credentials apply only to the local environment; do not use them for remote, staging, or production environments.

**Fixed endpoint:** test Analyze parameter setting, readiness, dispatch, running through execution finished, then the per-vial **result stage** — results in the Result tab, role editing, the single Confirm — and stop at **FP form opened, not dispatched**. Do not ask for the stopping point again. Verify the completed Monitor survives reload without advancing the workflow, and leave the FP form untouched once it opens.

The current prompt no longer names the workflow steps, but the plan still comes back as the fixed five — TLC, Column Chromatography, Analyze, Fraction Collection, Rotary Evaporation — with FP present and locked behind Analyze (observed on aws-test, 2026-09-16). FP unlocks once the Analyze result review is confirmed; inspect its opened form and stop there. **FP dispatch is out of scope.**

Preserve answers throughout the run. Use available valid slots/cartridges shown by the UI; ask when an unspecified choice materially affects the experiment. A task or experiment **name** field is free text: fill it yourself with a descriptive value such as `test-lcms <date> attempt-<n>`, record the value in the evidence, and do not ask about it. Derive Analyze values from current form choices and accepted experiment evidence; do not invent chemical method parameters.

## Before every full experiment attempt or retry

“Turn” means a **full experiment attempt/retry**, not each chat message or workflow step. Reset both datasets before every new attempt, regardless of whether the preceding attempt succeeded or failed. Preserve the preceding attempt's evidence before resetting.

1. Reset **Lab with `dataset=demo`**, then **Agent with `dataset=test`**. Verify both reset responses before proceeding. In the standard local bench, the contracts are:
   - Lab: authenticated `POST /admin/reset-to-test-data` on port 8192, JSON `{"robot_id":"talos.mock","dataset":"demo"}`.
   - Agent: `POST /reset` on port 8800, JSON `{"dataset":"test"}`; this also purges inter-service MQ.
   - Obtain Lab authorization through the current workspace's `scripts/bic-env/get-token.sh`. Use `curl --noproxy '*'` for local requests and keep bearer tokens out of evidence artifacts.
   Verify the current reset contract supports this robot identity before invoking it. If it requires a different reset robot, resolve the discrepancy rather than substituting `talos.001` silently.
2. Verify the **mars_mock** service is the intended `mars_interface_mock` process for this checkout/stage, with the correct robot identity, MQ configuration, and fresh heartbeat/log evidence. Inspect effective configuration without exposing secrets.
3. Inspect the robot table through the current schema/read-only query and confirm **`talos.mock` is `idle` before dispatch**. An unrelated idle robot does not satisfy this gate. Check again before each robot dispatch within the attempt.
4. Correlate a busy state with active tasks first. If this attempt is still finishing valid work, wait for it within a bounded interval. If another operator owns the active task, stop and resolve bench ownership. If the mock is incorrect or `talos.mock` remains non-idle when this attempt is ready to dispatch, restart the mock using the workspace's supported stage-aware entry. Discover the actual tmux pane/process; never trust cached pane numbers. Verify the restarted process and fresh idle state before continuing. Do not force the robot row to idle with SQL.
5. If restart does not restore the required state after a bounded wait, stop and report the blocking evidence. Do not dispatch against a busy robot or loop restarts indefinitely.

These resets belong only at attempt boundaries. Resetting between TLC, CC, and Analyze would erase the state needed by later steps.

## Experiment

Start a fresh Portal session after the preconditions pass. Send this prompt exactly:

```text
Do an purification experiment, RXN is Clc1nnc(Cl)c(Cl)n1.CC(C)(C)OC(=O)N1CC2(CNC2)C1>>ClC1=NN=C(Cl)N=C1N2CC3(CN(C(OC(C)(C)C)=O)C3)C2, target purity 95%, target yield 80%,  main reactant feed amount = 15mg. By the way, CC crude amount = 5mg
```

Confirm the reference/main reactant the agent preselects (Drake did not name which of the two reactants is the "main reactant"; do not guess a compound name). Verify the **15 mg** charge, **95%** target purity, and **80%** target yield in the resulting plan/form before proceeding.

**TBD:** the expected main-reactant identity for this reaction is unconfirmed; pin it once Drake confirms. Observed 2026-09-16 on aws-test: the agent marks **tert-butyl 2,6-diazaspiro[3.3]heptane-2-carboxylate** as `Suggested`, and accepting it puts the 15 mg on that reactant. Treat that as the agent's suggestion, not a confirmed product ruling.

The agent may question the feed amount against the auto-calculated target weight. That prompt does not block anything — confirm the objective and continue.

### TLC

1. Inspect the parameter form and fill all required fields. Verify actual values in the rendered form before confirming.
2. Assign **both sample and crude tubes in tube box 1**. They must be in the **same box**, at distinct available positions. Verify both box IDs and capture the selected tube IDs/positions. This supersedes the earlier mention of boxes 1 and 4.
3. Confirm the populated form, then dispatch after the robot idle check. Use CDP and Phoenix to verify submitted values and actual dispatch.
4. Wait for execution to finish, inspect the TLC result, and **confirm the result** so the plan advances to CC.

### CC

1. Assign an available **sample cartridge** and record its identity. Complete required parameters and confirm before dispatch.
2. Recheck the robot gate, dispatch, and verify execution through CDP and Phoenix.
3. Review the CC result. The initial prompt already states the crude amount (**5 mg**); if the agent still asks, enter **5 mg**, verifying the displayed unit.
4. Record and preserve Mind's CC peak classifications, spans, and apex tubes. For MED004, verify Peak 1 = `product_none`, apex A1, span A1; Peak 2 = `product_high`, apex A2, span A2/A3; Peak 3 = `product_none`, apex A4, span A4. Choosing a collect tube does not change these peak assignments; do not rewrite the CC result to force a collection choice. Once `c12-ai/BIC-meta#612` is on the bench, each peak's apex tube is what Analyze will seed regardless of role — A1, A2 and A4, one per peak. Leave the apexes as Mind returned them; the CC editor exposes only role, peak tubes and the Apex Tube select, and collection is decided in the Analyze step below.
5. **Confirm the CC result** to advance to Analyze. Check that Analyze retains the accepted CC source evidence. Collection selection is handled only in the Analyze form below — the CC result editor has no collection control — and stays separate from CC peak membership/role and the TLC sample/crude positions in box 1.

### Analyze

1. Open the task's parameter form and narrow the selection down to **A2 only as the collect/source tube** (Drake, 2026-09-17). Once `c12-ai/BIC-meta#612` is on the bench, the form seeds **three** rows by default — A1, A2, and A4, one per CC peak's apex regardless of role, and never A3 — so remove the A1 and A4 rows in this form to reach A2 alone (adding A3 would likewise be adding a row here, not a CC-editor action, and is not part of this scenario's target). **Before #612 lands**, the bench instead seeds the older two-row default A2+A3 (the whole range of the `product_high` peak) — in that case just remove the A3 row. **If A2 is already the only selected tube and the form is complete, just confirm**; no manual reselection, redundant edit, or extra save cycle is required. Preserve CC peak spans unchanged. Verify the submitted and retained selection is exactly A2.
2. Record the selected source tube A2, method name, and other configured parameters. Expect one logical filter vial for A2; distinguish it from the physical filter vial allocated by Lab. This replaces the former A1/A2 and A1/A3 test corrections.
3. Exercise readiness and dispatch. Observe validation failures if they occur, correct inputs through the UI, and retain the evidence. Recheck `talos.mock` idle before robot preparation dispatch.
4. Verify the dispatch request and acceptance in CDP, the corresponding Phoenix tool/span evidence, and the resulting task identity/status. Distinguish accepted, running, completed, and failed; claim only the state observed.
5. Follow **running execution** in Monitor: verify robot/mock sample preparation, then the separate LCMS device execution. Record their step/task/execution identities and progress evidence; identify which messages belong to preparation, device execution, or Lab report collection. Dispatch acceptance alone is not a pass.
6. Wait for **Analyze execution finished**. With A2 as the only selected source, require **1/1 vial report** durably stored and associated with its execution/vial, then confirm the backend completed state and Portal's localized **Execution completed** state agree. Robot preparation success, device acceptance, heartbeat progress, or report URLs alone do not establish completion.
7. Verify the terminal Monitor remains completed after a normal reload, then continue into the result stage below. Leave the session intact. If execution fails or cannot finish within a bounded wait appropriate to the configured run, preserve evidence and report the failed/blocked step rather than claiming completion.

### Analyze results, editing and Confirm

Each vial's analysed result belongs in the **Result tab**, not under Monitor. Monitor keeps
execution progress. Verified 2026-09-18 on the local `work/bic-0923` bench with the mock
Mind LCMS response.

**Order matters: Confirm locks editing, so do every row check before you Confirm.**

1. **Open the Result tab.** With A2 as the only source, a card appears as the next numbered
   step after TLC and Column Chromatography, reading `LCMS Analysis · 1/1 vials analyzed ·
   Awaiting review`. It starts collapsed — click its `Expand LCMS Analysis` disclosure. The
   row carries `FILTER VIAL / SOURCE TUBE / METHOD / MIND EVIDENCE / ROLE`. Mind evidence
   renders as `m/z <value> · purity <n>%`, `confidence <raw score> · <adduct>`,
   `Mind conclusion: <conclusion>`, then the warning list. **Confidence is the raw score
   (e.g. 17.106569989516203), not a 0–1 probability** — report it as shown. The ROLE cell is
   an enabled `<select>`, and the FILTER VIAL cell carries a **Preview report** control
   (`lcms-report-link-<filter_vial_id>`) — present as soon as that vial has a durable
   receipt, with no reload needed.
2. **Preview the original report.** Click **Preview report**. It is a `<button>`, not a
   link: it calls `GET /sessions/{sid}/trials/{tid}/analysis/reports/<filter_vial_id>`,
   which 302s to a presigned object URL carrying
   `response-content-type=application/pdf` and
   `response-content-disposition=inline; filename="<filter_vial_id>.pdf"`. Assert:
   - a NEW browser tab opens, and its `document.contentType` is `application/pdf` —
     Chrome renders the report inline in its own PDF viewer, not a download prompt and
     not a blank page. The tab title is the PDF's internal title, and the viewer shows
     the page count and thumbnail rail;
   - the viewer's toolbar offers download. Chrome isolates the viewer UI, so the control
     is not in the page DOM — it lives in the `chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/`
     iframe, which CDP lists as its own target. Attach to that target and click the
     `Download` control (`CR-ICON-BUTTON#save`) after setting
     `Browser.setDownloadBehavior`;
   - the saved file is `<filter_vial_id>.pdf` and byte-identical to what Lab stored —
     compare its size and checksum against the object behind `report_collection.reports[].report_ref`
     (MinIO's ETag is the MD5).
   Redact `X-Amz-Signature` from any URL you keep as evidence.
   Negative case: the control is absent on a vial row with no durable receipt. This
   scenario collects one vial and always receives its report, so there is normally no
   such row — say so rather than inventing one.
3. Confirm the backend agrees: exactly one `analysis_sub_result_analyzed` and one
   `analysis_processing_updated` in session history per vial, one `succeeded` row in
   `analysis_work_items`, and `trials.analysis` holding the Mind result. Card text alone
   is not evidence, and neither is the DB alone.
4. **Edit the role through the row's `<select>`** (`lcms-role-select-<filter_vial_id>`;
   Product / Waste / Tentative). The save is immediate — no separate save button. Each
   change appends one `analysis_sub_result_edited`. Then **reload the page, still before
   Confirm**, and assert the row survives: the card still reads `1/1 vials analyzed ·
   Awaiting review`, the Mind evidence is present, and the `<select>` is still rendered,
   still enabled, and shows the value you left. Cross-check
   `GET /sessions/{id}/snapshot` — the Analyze trial's `analysis` carries an `lcms` key
   holding `processing` (one settled entry per vial with `can_edit: true`), `results` and
   `raw_reports` (with a presigned `report_download_url`). Leave the role at the value the
   next step should act on: **Product** is what seeds FP.
5. Manual completion after a settled failure was **not exercised** on this bench — the
   mock Mind always succeeds, so nothing produced a `failed` / `manual_result_required`
   row. Treat it as untested; do not claim it works.
6. **One Confirm, no Reject.** As Analyze terminalizes, the backend mints a pending
   `RESULT_REVIEW` decision and announces it with a `form_requested`
   (`confirm_kind=result_review`, `original_action.specialist_kind="analyze"`,
   `turn_id="analyze-result-review"`). The card's single **Accept result** control is
   therefore live from the moment the vial settles — no reload and no API call to reveal
   it. Analyze has no rework/reject action by product ruling, so Accept is the only button.
   Click it in the UI and check `form_confirmed` with `confirm_kind=result_review` lands in
   session history. If the control is missing, that is a regression of the
   2026-09-18 fix (`1b1985c6`): record it with the event tail and stop — do not confirm
   over the API.
7. **FP landing checks, then stop.** After Accept the cursor moves to the Fraction
   Collection job. The workspace does not auto-open it: click the **Task** lifecycle tab,
   then the **Fraction Collection** specialist tab. Verify, without dispatching:
   - the upper **upstream evidence** panel carries the accepted CC run — the same peak
     rows and rack the CC result review showed (`fp-upstream-rack-A` + `fp-upstream-rack-B`);
   - the assignment grid shows `Flask 1 · 1 tube selected · <apex tube>` with that well
     pressed/coloured, and every other well unassigned;
   - **both racks render side by side** in the upstream panel and in the assignment grid
     (`Rack A · Left` and `Rack B · Right`);
   - the seeded `from_user.containers[0].tubes` in the FP trial's params matches.
     A Waste role seeds an empty flask — that is correct behaviour, not a bug, so only
     judge the flask contents against the role you actually confirmed.
   Stop here. Do not press Prepare materials, validate FP readiness, or dispatch FP. The FP
   trial reads `execution_status=dispatched` on a seeded form; the proof that nothing was
   sent is an empty `lab_task_id` and no `fraction_pool` row in `labrun_db.tasks`.
8. **Post-Confirm lock.** Reload once more and check the row's ROLE cell is now a read-only
   badge — no `<select>`, no Accept button — while the Mind evidence and the **Preview
   report** control stay. That lock is correct behaviour, not a regression of the reload
   fix, and the report stays previewable after Confirm.

## UI mechanics verified on aws-test, 2026-09-16

These cost real time to work out. They are observations about how the Portal behaves, not product rules.

- **Material slots are inert until an item exists.** Clicking a rack cell does nothing on its own, and the shelf's pre-existing tubes are not selectable that way. The order is: pick the type, press **Add**, press that item's **Assign slot**, and only then do the empty cells become buttons. Repeat per tube, switching the type between them.
- **The dispatch control differs per stage.** TLC and CC end in **Confirm Dispatch**. Analyze uses **Next** twice — once to open the material panel, then **Validate Readiness**, then **Next** again to dispatch. Do not hunt for a Confirm Dispatch button on Analyze.
- **Listbox options ignore synthetic clicks.** Selecting a value in the tube-type or stage dropdown needs real keyboard input: focus the combobox, `Enter` to open, `ArrowDown`, `Enter`. Native `<select>` elements are fine to set directly.
- **The terminal Monitor text changes after reload.** Live it reads "Execution completed. All expected reports have been received." After a reload the same completed state renders as "Execution complete. Evidence delivered." with the Lab task ID. Both mean completed — match on the Analyze stage showing **Done** plus the Lab task being `Completed`, not on the exact sentence.
- **Confirm completion from Lab, not only the Portal.** The decisive line is `Analyze task <id> completed — every expected vial report received` in `bic-lab-service` logs, preceded by one `Uploaded file object to s3://.../<execution>/<vial>/report` per vial.
- **Peak spans and collection selection are distinct.** The observed product peak spans A2+A3; that does not require selecting both tubes for Analyze. Once `#612` is on the bench, Analyze seeds each peak's apex regardless of role (A1, A2, A4 for MED004/MED005, never A3 by default), so CC role/span stays Mind's classification and the collected set is edited only in the Analyze form. The current scenario still narrows the selection down to A2 only and leaves the peak evidence intact.
- On aws-test the LCMS device is `BIC-device-service` running the **fake** provider (`DEVICE_PROVIDER=fake`, scenario `happy`), deployed 2026-09-16. Reports are generated demo PDFs, not measurements.

### Added on the local `work/bic-0923` bench, 2026-09-18

- **The pre-seeded demo tubes are decoration.** `tube_box_2ml_l2_002` already holds a Pure
  tube at A1 and a Crude tube at A4, but clicking those chips does nothing. Create both
  tubes in **tube box 1** (`tube_box_2ml_l2_001`) with the usual pick-type → Add →
  Assign slot → click an empty cell loop. Set the type *before* each Add; changing the
  combobox afterwards does not retype an already-added item, and a leftover mistyped item
  keeps readiness disabled with `Add at least 1 crude-sample tube.`
- **Confirming the objective can lose a race with the agent.** If the agent is still
  revising the draft, the confirm returns HTTP 412 `objective_revision_stale`; a reload
  restores the latest revision but clears the free-text task name. Refill and re-confirm.
- **Objective dosing comes back blank under the mock.** Feed amounts, both equivalents and
  sometimes yield/purity are empty and must be entered; that is a mock-data limitation,
  not missing user input. The reference reactant's equivalents field is disabled and fixed
  at 1 once its radio is set.
- **`lcms.001` goes `disconnected` if device-service loses its AMQP connection.** Check
  `robots` for a fresh `lcms.001` heartbeat alongside `talos.mock` before Analyze dispatch;
  `make restart-device STAGE=local` restores it.
- **To read the app's live Zustand state from CDP**, import the module URL the app already
  loaded (take it from `performance.getEntriesByType('resource')`, it carries Vite's `?t=`
  query). A bare `import('/src/stores/workspaceStore.ts')` returns a second, empty module
  instance and will make a working store look empty.

## Recovery and report

Preserve screenshots/DOM evidence, relevant CDP requests/responses, Phoenix trace/span IDs or links, and session/trial/task IDs for each attempt. Capture the exact error and last confirmed step before any reset.

A failed step remains part of the same attempt while diagnosing or retrying it through its normal UI. Starting the whole experiment over is a new attempt and requires both resets. Honor a user-supplied full-attempt retry budget; without one, report the failed attempt and ask before starting another full attempt.

### No idle robot at dispatch — verified recovery

An idle precheck can race the robot's stale-heartbeat cutoff. If Lab rejects dispatch with **No idle robots available**:

1. Preserve the failed task ID, CDP response/visible error, and Phoenix trace. Verify that the rejected task is not running and that no other task owns the robot.
2. Restart the mock using the supported stage-aware entry for the verified bench (currently `make restart-mock STAGE=local`). Wait for a **fresh heartbeat and `talos.mock=idle`**, not just a stale row saying idle.
3. Return to the **same step's normal UI**, retain/review its parameters and material assignment, revalidate readiness, and click **Confirm Dispatch** again promptly after the fresh idle check. Do not stop after the restart. This is same-step recovery: preserve the session and completed TLC/CC work; do not reset either dataset.
4. Verify actual Lab execution and Portal progress using CDP/Phoenix. HTTP 202 alone is insufficient. Record the failed and replacement Lab task IDs separately, even if they belong to the same Agent trial.

One restart plus one same-step redispatch is the default recovery for this error. If it still fails or the normal UI cannot redispatch, preserve the evidence and report the blocker rather than looping or bypassing the UI. This recovery was verified on 2026-09-15: CC changed from a no-idle rejection to running after mock restart and a fresh idle heartbeat, retaining the same CC trial and sample cartridge.

Report a short outcome: the last verified step; Analyze parameter, dispatch, running, and execution-finished results; report coverage; terminal reload behavior; the per-vial result card and its Mind evidence; the **Preview report** outcome (new tab opened, PDF rendered inline, downloaded filename and byte count against the Lab-stored object); the role edits and their persistence across a pre-Confirm reload; whether the Confirm control was reachable in the UI; and the FP landing checks. State that FP was opened but **not dispatched**. Link the CDP/Phoenix evidence, with `X-Amz-Signature` redacted from any presigned URL. A later successful attempt does not erase earlier failures, and this test does not authorize code fixes, configuration rewrites, or issue creation.

### Result-stage history — two fixed defects worth recognising

Both were found on 2026-09-18 and are fixed. They are recorded so a future run recognises
the symptoms instead of re-deriving them, and so a regression is named rather than guessed.

- **Analyze results vanished on refresh** (Agent `a468ee51` + Portal `2bd0833d`). The
  per-vial state lived only in the live SSE overlay and `hydrateFromSnapshot` reset it;
  the snapshot now carries `analysis.lcms.{processing,results,raw_reports}` and hydrate
  rebuilds the card from it. Symptom of a regression: after reload the card reads
  `0/1 vials analyzed` / `Awaiting analysis` / `not reported` and the role `<select>`
  disappears while the database still holds the result.
- **The Confirm control never appeared live** (Agent `1b1985c6`). The pending
  `RESULT_REVIEW` decision was minted without a `form_requested`, so a live page never
  showed the gate. Symptom of a regression: the Result pane header reads `Completed` right
  after the vial settles and no `form_requested(result_review)` follows the Analyze
  terminal in session history.

Both halves live in Agent Python. `make dev` runs `uv run python -m app.main` with **no
`--reload`**, so an Agent fix is not on the bench until the service is restarted — check
the `:8800` process start time before trusting a green or red result.
