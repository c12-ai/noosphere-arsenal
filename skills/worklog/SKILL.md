---
name: worklog
description: Record this conversation's completed work, research, or requested to-do in the user's Obsidian weekly note under today's date. Use when the user invokes $worklog, asks to log work, or asks to record a worklog to-do.
---

# Worklog in Obsidian

Write a concise entry in the user's voice. Honor a specific request such as “record this one to-do” before summarizing the wider conversation. Use the `obsidian-cli` skill for vault selection and Obsidian CLI commands. Do not read or write the vault through direct filesystem operations.

## Locate the note

1. Resolve the target vault from the user's instruction or existing user configuration, including the `obsidian-cli` skill. Pass `vault=<name>` explicitly when known. If several vaults remain plausible, ask which one to use. If Obsidian is closed or the CLI cannot reach the vault, report the blocker; do not guess a different vault.
2. Get the actual local date with the shell. Use only these shell lookups for date resolution:

   ```bash
   date +%G-W%V
   date '+%a, %b %-d'
   ```

   The first output is the weekly note stem. The second gives today's heading, `## <today>`. Do not calculate either from conversation timestamps.
3. Use the user's configured weekly and research folders when provided. Otherwise use `2 - Weekly Notes/<week-stem>.md` and `6 - Area/` as overridable conventions. Read the exact weekly note with Obsidian CLI. Create it through Obsidian CLI if it does not exist; an access error is not evidence that the note is absent.

## Choose the entry

Use the user's requested scope first. If no scope was given, choose the dominant branch. A conversation can contain research, implementation, and to-dos; do not automatically log all three.

### A. Research or investigation

When the findings need a reusable explanation, create one standalone note in the research folder. Name it for the topic, without a date prefix. If the exact note name exists, add a short disambiguator rather than replacing it, and report the chosen name. Write a self-contained account of the question, evidence, findings, and conclusion. Add one weekly bullet under today that links to it:

```markdown
- [[Topic]] — one sentence stating the finding.
```

### B. Implementation or completed task

Write one weekly bullet of one to three sentences stating what was done and the result. For substantial work across areas, use one main bullet with indented sub-bullets. Do not create a standalone note for this branch.

### C. Action items

Write checkboxes for the actions the user needs to take. If the user asked to log one to-do, write that one checkbox and stop; do not add a retrospective of the conversation. Keep each item to about one sentence. Indent steps beneath a larger item only when that helps action.

```markdown
- [ ] Do the specific next action.
```

## Add a supported `#承接` entry

On every run, check whether the conversation shows that the user took on a responsibility that belonged to someone else. Add one `#承接` bullet for each evidenced case under today unless the user explicitly limited this invocation to a single entry or only a specified to-do. Keep that explicit scope rather than adding unrelated bullets. Do not infer responsibility merely because the user worked hard or helped another team. Record the work, proper owner, time spent, and reason; use `未知` for any field the conversation does not establish.

```markdown
- #承接 <做了什么> — 本该：<谁负责> · 耗时：<多久> · 原因：<为什么接>
```

## Write and verify

1. Use Obsidian CLI to read the exact weekly note before writing. If today's `##` heading exists, append the new entry **inside that section**, before the next same-level heading. Prefer the CLI's heading-targeted append when available (`heading=<today>`). If the heading does not exist, add it at the end, then the entry. If the CLI cannot target a section, use `obsidian eval` with an atomic vault process that preserves the rest of the note. Do not replace, deduplicate, or revise earlier entries; a second invocation adds another entry.
2. For branch A, create and verify the standalone note before adding its weekly wikilink. Use Obsidian CLI for both operations.
3. Read back the affected note or section through Obsidian CLI. Confirm the entry is under today's heading, earlier text remains intact, and any branch A link points to the created note.
4. Report in one or two lines: branch A/B/C, weekly note and today's heading, plus the standalone path for A. Mention a disambiguated topic name or a CLI blocker when applicable.

Keep each weekly item under three sentences. Write findings and tasks in the user's voice, with no chat transcript or filler.
