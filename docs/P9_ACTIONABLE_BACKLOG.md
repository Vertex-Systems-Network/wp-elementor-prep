# P9 Actionable Backlog

P9 converts deterministic audit/runtime findings into a reusable improvement queue. It is a reporting layer only: generating, viewing or exporting a backlog never authorizes a design mutation.

## Core API

`src/core/backlog.ts` is intentionally Figma/Node neutral so the same model can be used by the plugin now and the P10 CLI/source adapters later.

Primary API:

```ts
generateBacklog(report, options)
serializeBacklogJson(backlog)
serializeBacklogMarkdown(backlog)
```

`GenerateBacklogOptions` can supply optional file/page context, generic runtime findings, and a previous backlog document for delta calculation.

## Schema v1

Each backlog item contains:

- stable `id` + semantic `fingerprint`;
- category: `ERROR`, `WARNING`, `INFO`, or `IMPROVEMENT`;
- severity + priority;
- status: `OPEN`, `RESOLVED`, `REGRESSED`, or `ACCEPTED_RISK`;
- delta: `NEW`, `RESOLVED`, `REGRESSED`, or `UNCHANGED`;
- source + finding/rule code;
- title + explanation;
- proposed action + optional recipe candidate;
- `autoFixEligible` safety flag;
- optional confidence;
- `firstSeen`, `lastSeen`, occurrence count;
- aggregated file/page/frame/section/node contexts;
- aggregated evidence entries.

## Fingerprint and dedupe contract

Fingerprint identity deliberately excludes volatile Figma node IDs, timestamps, context names and evidence values. It is derived from the semantic category/code/title/action/recipe identity using two deterministic 32-bit FNV-1a passes.

This means the same semantic warning appearing in repeated sections/frames aggregates into one backlog item while retaining each distinct context/evidence occurrence.

The fingerprint is not a security primitive. Its purpose is deterministic queue identity and run-to-run matching.

## Delta lifecycle

Given a previous backlog:

- present now + absent before → `NEW` / `OPEN`;
- present in both → `UNCHANGED` and remains `OPEN` unless it was `ACCEPTED_RISK`;
- absent now + present before → `RESOLVED`;
- previously `RESOLVED` + present again → `REGRESSED`;
- resolved history is retained through further clean runs so a later recurrence is still classified as `REGRESSED`, not forgotten as a new finding.

The plugin persists the previous per-file/page/frame backlog through `figma.clientStorage` so consecutive audits can produce meaningful deltas. Future P10 adapters can provide the prior document explicitly instead.

## Audit mapping

Existing `AuditFinding` values map as follows:

- `error` → `ERROR`, high severity, P1;
- `warning` → `WARNING`, medium severity, P2;
- `info` → `INFO`, low severity, P3.

Non-PASS sections with a deterministic `recommendedRecipe` additionally produce an `IMPROVEMENT` item.

P9 never upgrades a recipe candidate into mutation permission. Audit-derived recipe backlog items are emitted with `autoFixEligible: false`; P5+ safety gates remain authoritative for any mutation eligibility.

## Runtime findings

`RuntimeBacklogFinding` allows later P5/P6/P7/P12 runtime signals to enter the same model without coupling the backlog engine to those modules. The default runtime category is fail-safe `ERROR`, and auto-fix eligibility defaults to `false`.

## Outputs

The plugin UI shows active backlog counts/items and exports:

- `backlog.json` — complete schema-v1 machine-readable document;
- `backlog.md` — deterministic human-readable summary/table.

These serializers are also the P10 CLI-compatible output boundary.

## Validation policy

Automated tests cover mapping, stable fingerprints, repeated-occurrence dedupe, durable resolved history, regressions, accepted-risk preservation, runtime input, JSON/Markdown serialization, plugin persistence wiring and UI export controls.

Per issue #84, manual/runtime/end-to-end product acceptance is deferred to P12 final integrated validation. P9 implementation can be complete before that point, but it must not be described as production-accepted until the P12 matrix passes.
