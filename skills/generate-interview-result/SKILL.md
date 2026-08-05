---
name: generate-interview-result
description: Generate an evidence-based hiring decision from a candidate resume, job description, and interview notes or summary, then deliver it in a Feishu interview-result document based on an existing template. Use when asked to create, fill, or update an interview evaluation, feedback, recommendation, or result document for HR, especially from PDF resumes/JDs, interview transcripts, and Feishu wiki/docx templates.
---

# Generate an interview result

Treat Feishu as the delivery surface, not the source of the hiring judgment. Build the evaluation from the resume, JD, and interview evidence before formatting it for HR.

## Inputs

Require these four inputs:

1. Candidate resume
2. Job description
3. Interview notes, transcript, or summary
4. Feishu template or candidate-specific destination document

Infer facts already present in the sources. Ask only when a missing or ambiguous input would materially change the decision or the write target.

## Workflow

### 1. Read every source before judging

- Use the available URL/PDF reading skills for resumes and JDs. For PDFs, inspect the rendered pages as well as extracted text when layout could change meaning.
- Fetch the Feishu document read-only before any write. Use the available `lark-doc` and `lark-wiki` skills and follow their authentication, copy, update, and verification rules.
- Prefer Feishu API/CLI access over browser scraping. Use `--as user` for user-owned documents.
- Treat automated transcripts as noisy. Normalize obvious transcription errors, but do not silently invent missing facts, names, dates, or pronouns.

### 2. Build an evidence matrix

Read [`references/assessment-rubric.md`](references/assessment-rubric.md) completely before rating. Derive the role's core dimensions, weights, and genuinely non-waivable requirements from the JD before interpreting the candidate against the bar.

Separate the evidence into four columns while reasoning:

| Dimension | Meaning |
|---|---|
| JD requirement | Mark as hard requirement or preference |
| Resume claim | Candidate-provided claim; not automatically verified |
| Interview evidence | What the candidate demonstrated, explained, or failed to explain |
| Assessment | Met, partially met, unmet, or not tested, with confidence |

Apply these rules:

- Distinguish negative evidence from missing coverage. “Not tested” is not a weakness.
- Prefer concrete interview evidence over keyword matching, while preserving resume claims as unverified when appropriate.
- Do not accuse the candidate of misrepresentation unless the evidence directly establishes it. Describe the observable depth gap instead.
- Ignore protected or non-job-relevant personal attributes.
- Surface conflicts between sources and resolve them conservatively.

### 3. Choose the recommendation

Apply the reference rubric's four-level anchors, evidence hierarchy, coverage rule, and decision rules. Use the template's recommendation labels, mapping them to Strong Hire, Hire, Hold, and No Hire when needed.

Do not mechanically reject on résumé prestige, degree, employer, title, or years of experience. Treat a requirement as a gate only when HR marks it non-waivable or it is required by law, safety, location, schedule, certification, or operation. Otherwise assess whether the candidate demonstrates the capability and operating level the requirement represents.

Before finalizing, challenge the weakest judgment and the biggest blind spot. If missing live coding, code review, system design, or production evidence limits confidence, record that as an evaluation boundary rather than a candidate weakness.

### 4. Draft for the template

Follow the template's existing headings, labels, checkbox semantics, and visual style. Preserve bilingual labels when present.

Write in this order when the template supports it:

1. Recommendation callout with a concise reason
2. Interview basic information
3. Recommendation checkbox or selection
4. Core strengths
5. Key risks or improvement areas
6. Overall summary and decision
7. Evaluation boundary, when material

Apply the summary principles in the reference. Keep the tone factual and suitable for an internal HR record. Anchor each strength and risk to evidence, distinguish below-bar evidence from `not tested`, and state recommendation confidence when the template permits. Avoid inflated language, personality judgments, unsupported metrics, or generic filler.

### 5. Deliver safely in Feishu

Classify the supplied Feishu link before writing:

- **Shared template**: create a copy and fill the copy. Never overwrite the original template.
- **Candidate-specific result document**: update only the intended document.
- **Ambiguous target**: show the discovered title and ask whether to copy or edit.

Use read-only discovery first:

```bash
lark-cli docs +fetch --doc "<feishu-url>" --detail full --as user --format json
lark-cli wiki +node-get --node-token "<feishu-url>" --as user --format json
```

For a wiki template, copy it into the intended parent or space. If the command requires `--yes`, obtain explicit user confirmation before running the high-risk write.

After copying, fetch the copy again. Prefer targeted `str_replace` or `block_replace` updates so styles and resources survive. Use a full overwrite only when all of these are true:

- the target is a newly created copy;
- the user asked to fill the whole document;
- the fetched copy contains no resource blocks or content that must be preserved; and
- the replacement recreates the complete template structure.

Never reuse stale block IDs after an operation that invalidates them.

### 6. Verify before reporting completion

Re-fetch the completed Feishu document and confirm:

- title and candidate name are correct;
- exactly one recommendation is selected;
- strengths, risks, summary, and decision are non-empty;
- no sample candidate, `XXX`, `TODO`, or template filler remains;
- claims remain consistent with the source evidence;
- the final URL opens the candidate result, not the template; and
- the original template is unchanged when a copy was created.

If any check fails, fix it and verify again. Do not report completion from a successful write response alone.

## Final response

Lead with the result and the Feishu link. State the recommendation and whether the original template remained unchanged. Mention a material evaluation boundary in one short line; omit process narration.

## Failure handling

- **Feishu access failure**: inspect user authentication and scopes; do not fall back to unauthenticated browser scraping for a private document.
- **Conflicting candidate identity or role**: stop before writing and ask for clarification.
- **Missing source**: state which input is missing and do not manufacture an assessment.
- **Write or verification failure**: leave the original template untouched, report the exact failure, and provide any safe draft already produced.
