---
name: draft-release-notes
description: Draft or review evidence-based, project-wide BIC release notes in English, Simplified Chinese, or both across service repositories. Use when asked to prepare a BIC release note, release summary, or customer-facing change summary; this skill drafts content but does not publish a GitHub Release, tag code, or deploy an environment.
---

# Draft BIC release notes

Create one concise BIC-wide release narrative from changes that may span several repositories. Organize the note around what users and operators experience, while preserving component versions, migration work, known issues, and verification evidence.

Read [references/microsoft-release-note-pattern.md](references/microsoft-release-note-pattern.md) for the Microsoft-derived structure and writing rules. Use the template that matches the requested deliverable:

- English: [assets/release-note-template.md](assets/release-note-template.md)
- Simplified Chinese: [assets/release-note-template-zh-CN.md](assets/release-note-template-zh-CN.md)

For a bilingual deliverable, produce the complete English note followed by the complete Chinese note. Omit empty optional sections instead of publishing placeholders.

## Establish the release boundary

Before gathering changes, resolve:

- release name or date and whether it is a production release or prerelease;
- audience and destination;
- output language: English, Simplified Chinese, or bilingual;
- included repositories or components;
- previous released tag or SHA and candidate tag, branch, or SHA for each component;
- deployment status and target environment, if the note should mention rollout.

Use facts already supplied in the conversation or a release task. Recheck release and deployment state immediately before drafting because task records can become stale after rollout. If the requested language cannot be resolved from the request or destination, ask whether the deliverable should be English, Simplified Chinese, or bilingual. Ask Drake when ambiguity changes release inclusion or would force an unsupported factual claim. Otherwise preserve both facts in author notes. Never infer a boundary from the newest branch, tag, or deployment. Drafting authorization does not authorize tagging, publishing, deployment, issue edits, or other external writes.

## Gather evidence

Read `Production-PRD.md` before describing product behavior or acceptance rules, and read `docs/wiki/Commits-and-Releases.md` for BIC's release-note policy. Treat these sources in descending order of authority:

1. Drake's explicit release decisions and approved release task or PRD.
2. Published tags/releases and exact Git comparisons for each included repository.
3. Merged pull requests, their linked Issues, and acceptance or verification evidence.
4. Current source and tests when they clarify shipped behavior.
5. Commit messages and Trellis notes as leads that require confirmation.

Prefer read-only Git and GitHub queries. Useful commands include:

```bash
gh release list --repo <owner/repo>
gh release view <tag> --repo <owner/repo> --json tagName,targetCommitish,publishedAt,isPrerelease,body,url
gh api repos/<owner>/<repo>/git/ref/tags/<tag>
gh api repos/<owner>/<repo>/git/tags/<tag-object-sha>
gh api repos/<owner>/<repo>/compare/<base>...<head>
gh pr view <number> --repo <owner/repo> --json title,body,mergedAt,labels,closingIssuesReferences,url
git -C <repo> log --first-parent --oneline <base>..<head>
```

Use exact repository paths and compare boundaries. Resolve a tag reference through any annotated tag object until it reaches a commit; `targetCommitish` can name a branch and is not proof of the tagged commit. Do not treat the meta-repository history as service history. Do not include an open or unmerged change unless the release decision explicitly includes its exact SHA.

## Build the BIC-wide story

- Merge related frontend, Agent, Lab, device, shared-contract, and infrastructure changes into one user outcome. Avoid repeating the same feature under every repository.
- Lead with the practical result: what changed, who notices it, and what they need to do.
- Separate new behavior from fixes and match the content to the stated audience. For a product-team audience, focus on user experience, availability, scope, product decisions, and user-visible limitations. Omit migrations, server configuration, deployment commands, CI counts, and other operator instructions.
- An action belongs in the note only when the stated audience owns that action. Translate engineering constraints into their product impact under **Product notes** instead of asking non-engineering readers to change a server.
- Include internal CI or refactoring only for an engineering audience, or when its product impact is material and can be stated without implementation detail.
- For each known issue, state impact, affected scope, workaround when verified, and a tracking link. Never turn an unverified suspicion into a known issue.
- Include upcoming changes only when they are approved and materially affect preparation for this release.
- Record every included component's version and exact SHA. Mark unchanged components explicitly only when doing so prevents rollout confusion.
- Preserve the published **release range** and the environment's **deployed-from revision** separately when their baselines differ.

Write in plain, customer-centered language. Use sentence-case headings, short sentences, active voice, and bullets that begin with the outcome. Keep implementation names in the evidence links or component table unless readers need them to act.

## Keep bilingual versions aligned

When producing Chinese or bilingual notes:

- Translate meaning for a product audience rather than translating word by word.
- Keep product and workflow names such as BIC, Analyze, LCMS, Filter Vial, Monitor, FP, and PostTLC unchanged unless the product has an approved localized name.
- Keep versions, revisions, IDs, URLs, and code-like values unchanged.
- Preserve the same factual claims, scope, limitations, component rows, and evidence links in both languages.
- Do not shorten one language version or add a claim that is absent from the other.
- Use natural Simplified Chinese headings and sentences; do not expose engineering jargon when the audience is the product team.

## Validate the draft

Before returning the note:

1. Trace every behavior, fix, risk, migration step, and verification claim to a PR, Issue, comparison, test result, or release decision.
2. Reconcile duplicate or contradictory claims across repositories.
3. Confirm versions, tag-to-commit SHAs, dates, prerelease status, compare links, and deployment wording from live evidence.
4. Distinguish **released**, **deployed**, **verified**, and **planned**. Do not use one as proof of another.
5. Link deployment and verification claims to a durable deployment log or coordination record. If none exists, retain the claim only when supported by the supplied record and identify the missing evidence in separate author notes.
6. Remove empty sections, unsupported adjectives, internal task history, and commit-by-commit noise.
7. For bilingual notes, compare the two versions for factual and link parity.
8. Re-read from the audience's perspective: the first paragraph must explain the release value, and risks or required actions must be easy to find.

Return the audience-ready Markdown first. Put unresolved evidence in a separate **Author notes** block after the draft; do not mix internal evidence gaps into the product-facing release note unless they describe a real product limitation. If asked to save the draft, write only to the requested local path. Publishing or updating a GitHub Release requires a separate explicit request.
