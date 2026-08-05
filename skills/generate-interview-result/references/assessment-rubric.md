# Evidence-based interview assessment rubric

This is a synthesis of public hiring guidance, not a reproduction of any company's proprietary scorecard. Last reviewed: 2026-08-04.

## Contents

1. Public-source synthesis
2. Assessment principles
3. Evidence strength
4. Rating scale
5. Technical and AI rubric
6. Decision rules
7. Summary principles
8. Sources

## Public-source synthesis

| Source | Publicly stated signal | Apply in this skill |
|---|---|---|
| OpenAI | Consistent process; not credential-driven; values demonstrated potential, collaboration, communication, feedback, skills assessments, solution design, code quality, performance, and testing | Prefer demonstrated ability over pedigree; assess implementation quality and learning velocity |
| Anthropic | Values what candidates can do rather than where they learned it; uses live coding for technical roles; looks for thoughtfulness, clarity, judgment, direct evidence, and mission interest | Weight work evidence and reasoning more than labels, degrees, or keyword count |
| Google DeepMind | Describes a rigorous, fair, transparent, role-specific process; skills interviews test competencies required for success; final interviews add team goals, culture, mission, and values | Define role competencies before judging; separate core-skill evidence from team and mission context |
| Microsoft | Uses structured interviews against role requirements; evaluates problem solving, design, real code, testing, security, edge cases, AI/ML evaluation, collaboration, judgment, adaptability, and growth mindset | Evaluate the engineering lifecycle, not trivia alone; include safety, testing, and learning behavior |
| Amazon | Assigns interviewers different competencies; evaluates system design for practicality, accuracy, efficiency, reliability, optimization, and scalability; evaluates code for robustness, maintainability, readability, and tests; uses specific behavioral evidence and metrics | Cover independent dimensions; require concrete past behavior and production outcomes for seniority claims |
| U.S. OPM | Defines structured interviews as job-related competency assessments using the same predetermined questions, order, rating scale, and standards | Use consistent, behaviorally anchored ratings and distinguish missing evidence from negative evidence |

## Assessment principles

1. **Define the bar before judging the person.** Derive competencies, weights, and genuinely non-waivable requirements from the JD before rating candidate evidence. Do not change the bar to fit the candidate.
2. **Measure job-relevant capability, not pedigree.** Treat degrees, employers, titles, and years as context or level signals. Prefer direct evidence of the required capability. Only treat a credential or duration as a gate when HR marks it non-waivable or it is legally, operationally, or safety required.
3. **Prefer demonstrated work.** Give the most weight to live work, work samples, source review, and detailed project evidence. A résumé claim alone is weak evidence.
4. **Assess reasoning as well as answers.** Look for problem framing, clarifying questions, assumptions, tradeoffs, iteration, and response to new constraints.
5. **Assess the full delivery lifecycle.** For engineers, include design, implementation, testing, security, observability, performance, failure handling, and maintenance—not only algorithms or terminology.
6. **Calibrate to role level.** Judge the scope, ambiguity, independence, consequences, and cross-team influence expected at the target level. Do not grade a junior and a staff candidate against the same behavioral anchors.
7. **Separate dimensions.** Do not let one impressive project or one weak answer dominate unrelated competencies. Score each core dimension from its own evidence.
8. **Distinguish `not tested` from `did not meet`.** Missing interview coverage is a process limitation, not candidate evidence.
9. **Use behavior, not personality labels.** Record what the candidate did, explained, verified, or could not demonstrate and why that matters to the role.
10. **Make values evidence-based and job-related.** Assess observable collaboration, integrity, feedback response, ownership, safety judgment, and mission reasoning. Do not score personal similarity or vague “culture fit.”
11. **Control bias and leakage.** Ignore protected attributes and non-job-relevant personal information. Do not infer capability from names, schools, accent, appearance, nationality, age, family status, or other protected/contextual cues.
12. **Keep the human accountable.** The generated result organizes evidence and makes a recommendation; it must not claim to be an objective or automated employment decision.

## Evidence strength

Tag every important claim with the strongest available evidence level:

| Level | Evidence | Examples |
|---|---|---|
| A | Direct demonstration | Live coding, work sample, source review, debugging session, design exercise, reproducible artifact |
| B | Detailed verified deep dive | Clear personal contribution, constraints, alternatives, failure modes, metrics, and follow-up answers |
| C | Specific behavioral account | STAR/STAR(R) example with concrete action, result, reflection, and plausible scope |
| D | Unverified assertion | Résumé bullet, technology keyword, general self-description, or interviewer inference |

Use A/B evidence for decisive technical conclusions when available. Do not upgrade a repeated D claim into stronger evidence merely because it appears in multiple candidate-provided sources.

## Rating scale

Use a four-point scale to avoid an ambiguous midpoint. Add `NT` for not tested.

| Rating | Anchor |
|---|---|
| 4 — Exceeds | Demonstrates capability above the target level, handles ambiguity independently, surfaces important tradeoffs and failure modes, and supports the answer with strong evidence |
| 3 — Meets | Demonstrates the target-level capability accurately and independently, explains key choices, and handles normal edge cases |
| 2 — Mixed / below bar | Shows partial capability but needs material prompting, misses important tradeoffs, or lacks the depth/independence required at this level |
| 1 — Does not meet | Gives materially incorrect or unsafe reasoning, cannot demonstrate the capability after reasonable probing, or lacks a core requirement for the work |
| NT — Not tested | The interview material does not contain enough evidence to rate this dimension |

For each dimension, retain: rating, evidence level, one supporting observation, one counter-signal, confidence, and any verification needed.

## Technical and AI rubric

Use these as default weights for a technical AI/full-stack role. Adjust weights by at most 5 points per dimension from the JD **before** rating the candidate, and keep the total at 100. Mark the role's core dimensions explicitly.

| Dimension | Default weight | Evidence to seek |
|---|---:|---|
| Role-critical technical depth | 20 | Correct fundamentals and applied depth in the role's frontend, backend, data, ML/LLM, robotics, or domain stack |
| Problem framing and reasoning | 15 | Clarifies goals, decomposes ambiguity, states assumptions, compares alternatives, updates from feedback |
| Practical execution and code quality | 15 | Working implementation, debugging, readable and maintainable code, appropriate abstractions, tool fluency |
| System design and technical judgment | 15 | Interfaces, data flow, state, concurrency, scalability, cost, performance, tradeoffs, evolution, operability |
| Evaluation, testing, reliability, safety, and security | 15 | Success criteria, tests, edge cases, observability, fallback behavior, permissions, privacy, threat/failure analysis |
| Ownership, impact, and production experience | 10 | Personal contribution, decisions owned, measurable result, incident/maintenance experience, learning from failure |
| Communication and collaboration | 5 | Clear explanations, listening, cross-functional work, disagreement handling, feedback response |
| Learning agility, judgment, and mission alignment | 5 | Ramps into new domains, admits uncertainty, learns from evidence, applies responsible judgment to the mission |

For non-coding roles, replace “code quality” with the closest job-relevant work sample while keeping direct demonstration and role-level calibration.

### AI/Agent overlay

For AI, LLM, Agent, or embodied-AI roles, explicitly probe these within the relevant dimensions:

- model/tool behavior, data and retrieval quality, state and memory, orchestration, latency, cost, and observability;
- evaluation design: measurable task success, representative eval sets, regression tests, and error taxonomy;
- reliability: hallucination handling, tool-result validation, retries, fallbacks, idempotency, and human escalation;
- safety/security: least privilege, sandboxing, prompt/tool injection, data privacy, auditability, and failure containment;
- production judgment: distinguishing a demo from a dependable system and explaining evidence for claimed improvements;
- for robotics/embodied systems: concurrency, real-time constraints, hardware/protocol boundaries, physical safety, recovery, and operator control.

Do not award depth for naming techniques without explaining mechanism, tradeoff, validation, and failure modes.

## Decision rules

Use ratings to organize judgment, not to create false precision. Do not include numeric scores in the HR document unless its template requires them.

1. **Check non-waivable gates first.** Limit these to requirements explicitly marked by HR or required by law, safety, location, schedule, certification, or operation. Years of experience or a degree are not automatic gates when equivalent capability can be directly demonstrated.
2. **Check coverage.** Do not issue Hire or Strong Hire if a core dimension is `NT` or if less than roughly 70% of the weighted rubric has usable evidence. Use Hold only when a targeted follow-up can realistically resolve the missing evidence.
3. **Strong Hire.** All core dimensions are at least 3, several are 4, decisive claims have A/B evidence, and the candidate clearly operates above the target level.
4. **Hire.** All core dimensions meet the target bar, material risks are manageable through normal onboarding, and evidence is sufficient for the role's consequences.
5. **Hold.** A small number of decisive dimensions are `NT` or one core dimension is a plausible 2 that a specific work sample or follow-up can resolve. State the exact next assessment. Never use Hold as a polite No Hire.
6. **No Hire.** A non-waivable gate fails, strong evidence shows a core dimension at 1, multiple core dimensions remain below bar, or the candidate's demonstrated operating level is materially below the role.
7. **Confidence.** Mark the recommendation High, Medium, or Low confidence from evidence strength, coverage, source consistency, and interview quality. Lower confidence changes the next action, not the observed facts.

## Summary principles

Write the result so HR and the hiring manager can trace the decision to evidence:

1. **Decision first:** recommendation, target role/level, and one-sentence rationale.
2. **Strongest evidence:** 2–4 role-relevant strengths, each tied to a demonstrated behavior or artifact.
3. **Material risks:** 2–4 gaps that affect performance at the target level; explain impact without exaggeration.
4. **Evidence boundary:** identify important `NT` areas, missing direct assessments, transcript uncertainty, or unverified résumé claims.
5. **Next action:** proceed, reject for this role, or run one specific additional assessment. Mention a better-fit level only when supported by evidence.

Use these writing rules:

- Write “could not explain transaction isolation when asked” rather than “weak database engineer.”
- Write “not assessed in this interview” rather than treating missing coverage as failure.
- State which résumé metrics or ownership claims were not independently verified.
- Do not average away a safety-critical failure with unrelated strengths.
- Do not compare the candidate with unnamed candidates or use vague rank language.
- Do not repeat the full résumé; include only evidence that changes the hiring decision.
- Keep the recommendation consistent across callout, checkbox, risks, and final summary.

## Sources

- [OpenAI interview guide](https://openai.com/interview-guide/)
- [Anthropic careers — How we hire](https://www.anthropic.com/careers)
- [Google DeepMind careers — Interview process](https://deepmind.google/careers/)
- [Microsoft — How we hire](https://careers.microsoft.com/v2/global/en/hiring-tips)
- [Microsoft — Technical interviewing](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html)
- [Amazon — SDE III interview preparation](https://amazon.jobs/content/en-gb/how-we-hire/sde-iii-interview-prep)
- [U.S. Office of Personnel Management — Structured interviews](https://www.opm.gov/policy-data-oversight/assessment-and-selection/structured-interviews)
