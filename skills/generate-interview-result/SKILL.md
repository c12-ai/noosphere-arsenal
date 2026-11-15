---
name: generate-interview-result
description: Prepare a structured technical interview or generate an evidence-based hiring decision from a candidate resume, job description, and interview evidence, then deliver it in a Feishu interview document based on an existing template. Use when asked to prepare candidate-specific questions or create, fill, or update an interview evaluation, feedback, recommendation, or result document for HR, especially from PDF resumes/JDs, interview transcripts, and Feishu wiki/docx templates.
---

# Prepare and generate an interview result

Treat Feishu as the delivery surface, not the source of the hiring judgment. Build interview questions and evaluations from the resume, JD, and interview evidence before formatting them for HR.

## Inputs

Use the inputs required by the requested mode:

1. Candidate resume
2. Job description or an unambiguous request to use the current default role
3. Feishu template or candidate-specific destination document
4. Interview notes, transcript, or summary for post-interview evaluation

For the current C12 AI full-stack role, read [`references/current-ai-fullstack-jd.md`](references/current-ai-fullstack-jd.md) completely and use it when the user does not supply another JD. A JD supplied in the current request always overrides the default. If the target role is ambiguous, ask before applying the default.

Infer facts already present in the sources. Ask only when a missing or ambiguous input would materially change the decision or the write target.

## Workflow

### 1. Read every source before judging

- Use the available URL/PDF reading skills for resumes and JDs. For PDFs, inspect the rendered pages as well as extracted text when layout could change meaning.
- When using the current default role, read the role reference completely before deriving questions or ratings.
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

### 3. Prepare the interview when requested

When the user asks for interview preparation or has not supplied interview evidence:

- Do not make a hiring recommendation or select a recommendation checkbox.
- Map each question to a JD dimension, résumé claim or gap, evidence sought, and follow-up probe.
- Prioritize end-to-end ownership, cross-system boundaries and data flow, full-stack implementation, AI-assisted development and verification, and practical evolution judgment for the current default role.
- Prefer project deep dives, debugging or review scenarios, and a bounded work sample over trivia. Use fundamentals only when they test a role-relevant implementation decision.
- Calibrate scope by demonstrated experience. For junior candidates, accept runnable and published internship, coursework, or personal projects as valid delivery evidence; do not require large production-system scale.
- Write the question list into a copied or candidate-specific Feishu document, preserve the template, and label untested dimensions `NT`.

### 4. Choose the recommendation after the interview

Apply the reference rubric's four-level anchors, evidence hierarchy, coverage rule, and decision rules. Use the template's recommendation labels, mapping them to Strong Hire, Hire, Hold, and No Hire when needed.

Use only explicitly confirmed non-waivable requirements as hiring gates, including those confirmed by HR or the hiring manager and requirements imposed by law, safety, location, schedule, certification, or operation. For the current C12 AI full-stack role, Drake confirmed on 2026-11-15 that a bachelor's degree in computer science or a clearly related discipline is a hard gate; follow the role reference and send ambiguous discipline matches to HR for verification. This role-specific decision takes precedence over general rubric advice about education. For other requirements, assess demonstrated capability rather than inferring extra gates from résumé prestige, employer, title, or years of experience.

Before finalizing, challenge the weakest judgment and the biggest blind spot. If missing live coding, code review, system design, or production evidence limits confidence, record that as an evaluation boundary rather than a candidate weakness.

### 5. Draft for the template

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

### 6. Deliver safely in Feishu

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

#### Mandatory original-resume attachment for Drake's workflow

When creating or updating a candidate-specific Feishu interview document for Drake, attach the original resume file at the end of the document after writing the body:

- Use the exact local resume file supplied for that candidate and upload it as a file attachment with the `lark-doc` workflow (`docs +media-insert --type file`). Do not substitute extracted Markdown, screenshots, or a rewritten resume for the original file.
- Drake granted standing approval for this candidate-resume-to-candidate-document upload workflow on 2026-09-02. Do not ask him for attachment confirmation again. This standing approval is limited to the supplied candidate resume and that candidate's Feishu interview document; it does not authorize sending the resume elsewhere or reusing it for another purpose.
- Attach only to a candidate-specific document or a newly created template copy. Never attach a candidate resume to the shared template itself.
- Treat the attachment as required output. If the file is missing, unreadable, or the upload fails, report the exact blocker and do not claim the Feishu deliverable is complete.

### 7. Verify before reporting completion

Re-fetch the completed Feishu document and confirm:

- title and candidate name are correct;
- for interview preparation, no recommendation is selected and the question section is non-empty;
- for post-interview evaluation, exactly one recommendation is selected and strengths, risks, summary, and decision are non-empty;
- no sample candidate, `XXX`, `TODO`, or template filler remains;
- claims remain consistent with the source evidence;
- the final URL opens the candidate result, not the template; and
- the original template is unchanged when a copy was created; and
- for Drake's workflow, the original resume appears as a file attachment with the correct filename at the end of the candidate document.

If any check fails, fix it and verify again. Do not report completion from a successful write response alone.

## Final response

For interview preparation, lead with the Feishu link and the main areas the question set covers. For post-interview evaluation, lead with the recommendation and Feishu link. State whether the original template remained unchanged. Mention a material evaluation boundary in one short line when applicable; omit process narration.

## Failure handling

- **Feishu access failure**: inspect user authentication and scopes; do not fall back to unauthenticated browser scraping for a private document.
- **Conflicting candidate identity or role**: stop before writing and ask for clarification.
- **Missing source**: state which input is missing and do not manufacture an assessment.
- **Write or verification failure**: leave the original template untouched, report the exact failure, and provide any safe draft already produced.
- **Resume attachment failure in Drake's workflow**: keep the completed body intact, report that the deliverable is incomplete, and retry only against the same candidate document and the exact supplied resume file.
