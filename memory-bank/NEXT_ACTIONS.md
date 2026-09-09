# Next Actions

Last updated: 2026-09-10

## Current policy

Manual/runtime/end-to-end product testing is deferred until P12.

For now:
- continue implementation where safe;
- preserve P5/P6/P7 safety/provenance locks;
- do not fabricate Figma runtime evidence;
- do not call validation-pending modules production-accepted;
- preserve latest P5→main `CODE_CONFLICT` truth from PR #85.

## Mandatory order

1. Inspect/process open Issues.
2. Inspect open PR/MR.
3. Continue the highest-priority unblocked implementation item.
4. Synchronize README + memory-bank state.
5. Reserve final manual/runtime/end-to-end acceptance for P12 unless the user changes this policy.

## Current queue

Core/runtime validation-pending:
- #6 — P5 Safe Fix;
- #7 — P6 Advanced structures;
- #8 — P7 Batch queue.

Release expansion:
- #81 — P9 Backlog generator;
- #82 — P10 npm/CLI runner + supported Figma source adapters;
- #83 — P11 Normal Figma plugin packaging/distribution;
- #84 — P12 Final integrated validation/release acceptance.

P8 Elementor exporter remains deferred.

## P5/P6/P7 state while testing is deferred

Canonical P5 #488 provenance/preflight/archive plumbing is hardened.

Latest Integration Readiness #90 established P5 → current main as `CODE_CONFLICT`, including `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, README and memory-bank files. Historical integration proof #37 / CI #500 is superseded.

When P12 reaches P5 closure:
1. collect real imported-Figma/rendered-pixel evidence;
2. pass current-main `runtime:closure-intake`;
3. re-run integration readiness against the then-current main;
4. resolve the exact current conflict set;
5. preserve current-main source/output-overlap safety, CI/status tooling and closure/runbook hardening while integrating P5 runtime code;
6. complete the final integration gate before merging #6.

P6 #494 and P7 #490 remain reference artifacts. Their final fresh artifacts and runtime closure belong to the P12 final line after P5 merges.

## Immediate implementation order

### 1. P9 — backlog generator / #81

Implement a deterministic structured backlog from audit/prep findings.

Required categories:
- `ERROR`;
- `WARNING`;
- `INFO`;
- `IMPROVEMENT`.

Required item data:
- deterministic fingerprint/id;
- category/severity/priority;
- rule/finding code;
- file/page/frame/section/node context when available;
- title/explanation;
- evidence/confidence;
- proposed action/recipe candidate;
- auto-fix eligibility;
- firstSeen/lastSeen/occurrences;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK state.

Outputs:
- `backlog.json`;
- `backlog.md`;
- category/severity counts;
- deterministic dedupe;
- run-to-run delta;
- plugin UI export;
- CLI-compatible export.

Backlog generation must remain non-mutating.

### 2. P10 — npm/CLI / #82

Use the same deterministic scanner/classifier/scoring/backlog core as the plugin.

Target commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Initial source adapters:
- official Figma REST URL/file-key adapter;
- canonical versioned snapshot/package-path adapter.

Future local Figma bridge may be added only if a documented supported mechanism exists.

Raw `.fig` rule:
- do not build an undocumented proprietary parser;
- `/path/file.fig` returns `UNSUPPORTED_FIG_LOCAL_FILE` until a supported bridge exists;
- the error must direct users to URL/file-key or canonical snapshot input.

CLI outputs:
- audit JSON/Markdown;
- backlog JSON/Markdown;
- machine-usable exit codes;
- summary-only mode;
- output-directory controls;
- no token/credential leakage.

### 3. P11 — normal Figma plugin distribution / #83

Complete production distribution around the existing classic-plugin runtime:
- production plugin ID/manifest;
- dev vs release commands;
- reproducible release package;
- normal user commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- hide developer-only self-test/evidence commands from normal release UI where appropriate;
- local development import instructions;
- private/team/organization distribution guidance;
- Community submission package/checklist;
- icon/cover/screenshots/description/category/tags/support details;
- versioning/changelog/update process;
- privacy/network declaration;
- release provenance metadata.

Community approval is not automatic and remains subject to Figma review.

### 4. P12 — final integrated validation / #84

Only after implementation is complete, run:
- final release artifact provenance/reproducibility;
- local development-plugin import;
- normal Figma plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh then-current-main conflict resolution preserving #85 requirements;
- P6 fresh final-line positive/refusal acceptance;
- P7 fresh final-line 60+ sequential queue + active cancellation;
- P9 backlog categories/dedupe/delta/export;
- P10 Figma URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity and deterministic outputs;
- P11 distribution/release package readiness;
- final closure-intake;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be production-accepted / 100%.

## Progress tracking

- Historical P0–P7 core progress remains `93%`.
- P9–P12 release expansion starts at `0%` planning baseline.
- Track implementation and final validation separately.
- Do not count P12 manual/runtime checks before they actually run.
