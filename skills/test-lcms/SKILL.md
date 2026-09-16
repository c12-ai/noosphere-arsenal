---
name: test-lcms
description: Run the BIC TLC-to-CC-to-Analyze LCMS test scenario through the Portal using CDP and Phoenix evidence, with lab demo and agent test resets before each full attempt. Use when asked to test this LCMS workflow from parameter setting through dispatch, running, and finished Analyze execution.
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

**Fixed endpoint:** test Analyze parameter setting, readiness, dispatch, and running through **execution finished**. Stop at Analyze execution completion; do not confirm Analyze results or advance to FP. Do not ask for the stopping point again. Verify the completed Monitor survives reload without advancing the workflow.

The current prompt no longer names the workflow steps, but the plan still comes back as the fixed five — TLC, Column Chromatography, Analyze, Fraction Collection, Rotary Evaporation — with FP present and locked behind Analyze (observed on aws-test, 2026-09-16). So the stop rule still applies: FP appears in the plan and must be left alone.

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
4. Check the CC result's product-tube assignment against **A1 and A2**. If Mind already returns A1/A2, keep it without editing. Otherwise, use the result editor to set the product-tube assignment to A1/A2, then save. This is Drake's scenario-specific target (corrected 2026-09-16), not a claim that Mind classified those tubes as product. Record the original result and any human correction; this supersedes the earlier A1/A3 workaround.
5. Verify A1 and A2 are selected as product in the saved result, then **confirm the result** to advance to Analyze. Check that Analyze's source evidence reflects the accepted result. These CC source labels are separate from the TLC sample/crude tube positions in box 1.

### Analyze

1. Open the task's parameter form. Exercise parameter setting through the UI: select applicable CC source tubes and available analysis methods, fill required fields, save/confirm, and check that the submitted and retained values match the visible choices.
2. Record exact source tube IDs, method names, and other configured parameters. Distinguish source tubes selected by the user from physical filter vials allocated by Lab.
3. Exercise readiness and dispatch. Observe validation failures if they occur, correct inputs through the UI, and retain the evidence. Recheck `talos.mock` idle before robot preparation dispatch.
4. Verify the dispatch request and acceptance in CDP, the corresponding Phoenix tool/span evidence, and the resulting task identity/status. Distinguish accepted, running, completed, and failed; claim only the state observed.
5. Follow **running execution** in Monitor: verify robot/mock sample preparation, then the separate LCMS device execution. Record their step/task/execution identities and progress evidence; identify which messages belong to preparation, device execution, or Lab report collection. Dispatch acceptance alone is not a pass.
6. Wait for **Analyze execution finished**. Verify every expected vial report has been durably stored and associated with its execution/vial, then confirm the backend completed state and Portal's localized **Execution completed** state agree. Robot preparation success, device acceptance, heartbeat progress, or report URLs alone do not establish completion.
7. Verify the terminal Monitor remains completed after a normal reload, then stop. Leave the session intact. Do not perform Analyze result confirmation or FP actions; report FP as outside this test's scope. If execution fails or cannot finish within a bounded wait appropriate to the configured run, preserve evidence and report the failed/blocked step rather than claiming completion.

## UI mechanics verified on aws-test, 2026-09-16

These cost real time to work out. They are observations about how the Portal behaves, not product rules.

- **Material slots are inert until an item exists.** Clicking a rack cell does nothing on its own, and the shelf's pre-existing tubes are not selectable that way. The order is: pick the type, press **Add**, press that item's **Assign slot**, and only then do the empty cells become buttons. Repeat per tube, switching the type between them.
- **The dispatch control differs per stage.** TLC and CC end in **Confirm Dispatch**. Analyze uses **Next** twice — once to open the material panel, then **Validate Readiness**, then **Next** again to dispatch. Do not hunt for a Confirm Dispatch button on Analyze.
- **Listbox options ignore synthetic clicks.** Selecting a value in the tube-type or stage dropdown needs real keyboard input: focus the combobox, `Enter` to open, `ArrowDown`, `Enter`. Native `<select>` elements are fine to set directly.
- **The terminal Monitor text changes after reload.** Live it reads "Execution completed. All expected reports have been received." After a reload the same completed state renders as "Execution complete. Evidence delivered." with the Lab task ID. Both mean completed — match on the Analyze stage showing **Done** plus the Lab task being `Completed`, not on the exact sentence.
- **Confirm completion from Lab, not only the Portal.** The decisive line is `Analyze task <id> completed — every expected vial report received` in `bic-lab-service` logs, preceded by one `Uploaded file object to s3://.../<execution>/<vial>/report` per vial.
- **Both attempts produced identical Mind CC output** (peaks at 5.79 / 10.12 / 11.25, product peak spanning A2+A3), so the A1/A2 correction in the CC section is needed every run, not occasionally.
- On aws-test the LCMS device is `BIC-device-service` running the **fake** provider (`DEVICE_PROVIDER=fake`, scenario `happy`), deployed 2026-09-16. Reports are generated demo PDFs, not measurements.

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

Report a short outcome: the last verified step; Analyze parameter, dispatch, running, and execution-finished results; report coverage; terminal reload behavior; and any blocker. State that FP was not run. Link the CDP/Phoenix evidence. A later successful attempt does not erase earlier failures, and this test does not authorize code fixes, configuration rewrites, or issue creation.
