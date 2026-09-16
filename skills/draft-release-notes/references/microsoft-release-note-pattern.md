# Microsoft-derived release-note pattern

Researched from public Microsoft sources on 2026-09-16. Microsoft does not expose one universal public release-note template; its public guidance and examples establish a repeatable pattern that this skill adapts for BIC.

## Sources

- [Microsoft Learn style and voice quick start](https://learn.microsoft.com/en-us/contribute/content/style-quick-start): focus on the reader's task, use everyday words and simple sentences, put important information first, and make content easy to scan.
- [Top 10 tips for Microsoft style and voice](https://learn.microsoft.com/en-us/style-guide/top-10-tips-style-voice): use fewer words, write conversationally, get to the point quickly, be brief, and use sentence-style capitalization.
- [Design planning](https://learn.microsoft.com/en-us/style-guide/design-planning): start from a consistent template, limit heading levels, use built-in list and table structures, and keep layouts predictable.
- [Validation OS 2026.04 release notes](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/validation-os-release-notes/2604?view=windows-11): a compact Microsoft release-note example organized around release identity, what's new, known issues, upcoming changes, and additional resources.
- [Windows release health](https://learn.microsoft.com/en-us/windows/release-health/): separates release notes from known issues and resolved issues so readers can assess rollout risk.
- [Azure DevOps release notes generator](https://learn.microsoft.com/en-us/samples/azure-samples/azure-devops-release-notes/azure-devops-release-notes-generator/): demonstrates generating Markdown notes from release and work-item evidence.

## Applied BIC structure

The stable core is:

1. Release identity and a short outcome summary.
2. What's new.
3. Improvements and resolved issues.
4. Upgrade or compatibility actions.
5. Known issues and verified workarounds.
6. Verification and rollout status.
7. Component versions and exact revisions.
8. Full change log and supporting links.

“Upcoming changes” is optional. Use it only for an approved change that current readers need to prepare for. “Upgrade and compatibility,” “Verification,” and the component table are BIC-specific additions needed for a multi-repository laboratory platform.

## Writing rules

- Put the customer or operator outcome before implementation detail.
- Use one idea per bullet and front-load the distinguishing words.
- Use sentence case for headings.
- State required action directly and place it before background.
- Prefer concrete scope and evidence over claims such as “better,” “seamless,” or “more robust.”
- Avoid a raw commit list. Group changes by user outcome, then link the detailed comparisons.
