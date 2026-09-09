# Next Actions

Last updated: 2026-09-10

## Current project policy

Manual/runtime/end-to-end product testing is deferred until P12 final integrated validation.

For now:
- continue implementation;
- keep safety/provenance locks intact;
- do not fabricate Figma runtime evidence;
- do not call validation-pending modules production-accepted;
- do not repeatedly stop development for unavailable manual testing.

## Mandatory work order

1. Inspect/process open Issues.
2. Inspect open PR/MR.
3. Continue highest-priority unblocked implementation work.
4. Synchronize plan/status/memory-bank.
5. Reserve final manual/runtime/end-to-end acceptance for P12 unless the user explicitly changes this policy.

## Current issue queue

Core/runtime validation-pending:
- #6 — P5 Safe Fix;
- #7 — P6 Advanced structures;
- #8 — P7 Batch queue.

New implementation scope:
- #81 — P9 Backlog generator;
- #82 — P10 npm/CLI runner + supported Figma source adapters;
- #83 — P11 Normal Figma plugin packaging/distribution;
- #84 — P12 Final integrated validation/release acceptance.

P8 Elementor exporter remains deferred.

## Immediate implementation order

### 1. P9 — backlog generator / #81

Implement a deterministic structured backlog from audit/prep findings.

Required categories:
- `ERROR`;
- `WARNING`;
- `INFO`;
- `IMPROVEMENT`.

Required backlog item data:
- deterministic fingerprint/id;
- category/severity/priority;
- rule/finding code;
- file/page/frame/section/node context;
- title/explanation;
- evidence/confidence;
- proposed action/recipe candidate;
- auto-fix eligibility;
- firstSeen/lastSeen/occurrences;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK state.

Outputs:
- `backlog.json`;
- `backlog.md`;
- counts by category/severity;
- dedupe;
- run-to-run delta;
- plugin UI export;
- CLI-compatible export.

Backlog generation must remain non-mutating.

### 2. P10 — npm/CLI / #82

Refactor/share analysis modules so plugin and CLI use the same deterministic core.

Planned commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Input adapter plan:
- official Figma REST API URL/file-key adapter;
- canonical versioned snapshot/package-path adapter;
- future local Figma bridge only when a supported mechanism exists.

Raw `.fig` rule:
- do not build an undocumented proprietary parser;
- `/path/file.fig` must return `UNSUPPORTED_FIG_LOCAL_FILE` until a supported bridge exists;
- error must point users to URL/file-key or canonical snapshot input.

CLI outputs:
- audit JSON/Markdown;
- backlog JSON/Markdown;
- machine-usable exit codes;
- output-directory controls;
- summary-only mode;
- no credential/token leakage.

### 3. P11 — normal Figma plugin distribution / #83

Complete production distribution around the existing classic-plugin manifest/runtime:

- production plugin ID/manifest generation;
- dev vs release command surface;
- reproducible release package;
- user commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- hide developer-only self-test/evidence commands from normal release UI where appropriate;
- local development import instructions;
- private/team/organization distribution guidance;
- Community submission package/checklist;
- icon/cover/screenshots/description/tags/support details;
- versioning/changelog/update process;
- privacy/network declaration;
- release provenance metadata.

Community approval is not automatic and remains subject to Figma review.

### 4. P12 — final integrated validation / #84

Only after planned implementation is complete, run the full product matrix:

- release artifact provenance/reproducibility;
- local development-plugin import;
- normal Figma plugin install/run;
- P5 real rendered-pixel reject/restore/finalize + zero leftovers;
- P6 positive + preservation-refusal acceptance;
- P7 realistic 60+ sequential batch + active Full-P3 cancellation;
- P9 backlog categories/dedupe/delta/export;
- P10 official URL/file-key CLI;
- P10 canonical snapshot path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity;
- deterministic report/backlog outputs;
- closure-intake on final artifacts/evidence;
- P11 distribution/release-package readiness;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be called production-accepted / 100%.

## Core P5/P6/P7 state while testing is deferred

P5 canonical #488 provenance/preflight plumbing is already hardened. Real Desktop/runtime acceptance remains pending.

P6 #494 and P7 #490 remain engineering/reference artifacts. Final exact-build integration artifacts and runtime acceptance belong to the final integrated release line/P12.

Do not modify their acceptance history or fabricate closure receipts merely to unblock new P9/P10/P11 implementation.

## Progress tracking

- Core P0–P7 historical progress remains `93%`.
- New release-expansion P9–P12 starts at `0%` planning baseline.
- Track implementation and final validation separately.
- Do not count P12 manual/runtime checks as completed before they actually run.
