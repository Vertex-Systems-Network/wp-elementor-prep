# Next Actions

Last updated: 2026-09-10

## Current policy

Manual/runtime/end-to-end product testing remains deferred until P12.

For every implementation cycle:
1. inspect open Issues;
2. inspect open PR/MR;
3. continue the highest-priority unblocked implementation item;
4. run repository integrity checks;
5. synchronize README + memory-bank state during the same cycle;
6. never fabricate runtime evidence or describe validation-pending work as production-accepted.

## Current queue

Core/runtime validation-pending:
- #6 — P5 Safe Fix;
- #7 — P6 Advanced structures;
- #8 — P7 Batch queue.

Release expansion:
- #81 — P9 backlog generator: implementation complete via PR #89; P12 validation pending;
- #82 — P10 npm/CLI runner + supported source adapters: implementation complete via PR #93; P12 validation pending;
- #83 — P11 normal Figma plugin packaging/distribution: current implementation target on `feat/p11-release-packaging`;
- #84 — P12 final integrated validation/release acceptance.

P8 Elementor exporter remains deferred.

## Runtime/provenance boundary retained through P11

Canonical P5 #488 provenance/preflight/archive plumbing remains hardened and unchanged by release-expansion work.

Latest authoritative P5 integration state remains `CODE_CONFLICT`. Historical integration proof #37 / CI #500 is superseded. During P12, final P5 closure must be followed by a fresh then-current-main integration resolution preserving helper overlap safety, CI/status tooling, artifact provenance and closure/runbook hardening.

Runtime artifact preflight requires a non-symlink artifact root, stable descriptor identity, immutable file hashes, exact build identity and schema-v3 manifest semantics.

P6 #494 and P7 #490 remain engineering/reference artifacts; fresh final artifacts and their real runtime closure belong to P12 after final P5 integration.

## P9 — implementation complete

Merged in PR #89 at `67d6b3df05c8e4550b3df80f95cb5fabeb77de42`.

Implemented:
- ERROR / WARNING / INFO / IMPROVEMENT backlog model;
- deterministic semantic fingerprints/IDs;
- active category + severity summaries;
- context/evidence/confidence/action data;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK lifecycle;
- NEW / RESOLVED / REGRESSED / UNCHANGED deltas;
- retained resolved history;
- deterministic JSON/Markdown serialization;
- plugin clientStorage history;
- plugin UI backlog view/export;
- stale async audit-result invalidation;
- non-mutating reporting boundary.

Do not call P9 production-accepted until P12 validates real plugin/export/parity behavior.

## P10 — implementation complete

Merged in PR #93 at `7e6aa85958060cc927d8fe09dc5cb88a3feba53e`.

Implemented:
- `npm run audit:figma -- --url ...`;
- `npm run audit:figma -- --file-key ... --node-id ...`;
- `npm run audit:snapshot -- --input ...`;
- `npm run backlog:generate -- --input ...`;
- official Figma REST adapter;
- personal-token and OAuth environment credential modes;
- canonical snapshot schema v1;
- cloud `source-snapshot.json` export;
- fail-closed explicit Frame selection;
- raw `.fig` refusal via `UNSUPPORTED_FIG_LOCAL_FILE`;
- audit/backlog JSON + Markdown;
- previous-backlog delta input;
- summary-only output;
- CI fail thresholds;
- stable exit codes;
- cross-platform Node >=20 esbuild runner;
- persistent `build:cli` bundle;
- source-bound timestamps for cloud/snapshot reproducibility;
- implementation-side adapter and CLI contracts.

Real credentialed Figma REST execution, real snapshot parity, Windows/macOS path behavior and production acceptance remain P12 tasks.

## P11 — immediate work / #83

Active branch: `feat/p11-release-packaging`.

Already implemented on the branch:
- separate release manifest template;
- release capability/menu registry;
- deterministic release package builder requiring real `FIGMA_PLUGIN_ID` and exact source SHA;
- release verifier rejecting placeholder IDs, unexpected files, menu/network drift and provenance/hash mismatches;
- normal-user commands for the capability set currently integrated on main;
- audit report JSON/Markdown exports;
- backlog JSON/Markdown exports;
- developer-only self-test/evidence commands excluded from normal release menu;
- release fixture verification wired into CI;
- Community listing metadata template;
- Community readiness verifier with template vs publishable modes;
- privacy/offline network declaration;
- local/private/team/Community distribution guide;
- generated release output ignored by source control.

### Current P11 sequence

1. finish version/changelog/static release contracts;
2. verify README + PROJECT_STATE + ROADMAP + NEXT_ACTIONS remain synchronized;
3. open P11 PR;
4. run CI: status verification, typecheck, tests, plugin build, CLI build, release fixture verification, Community template verification and import integrity;
5. fix any implementation defects;
6. inspect mergeability/reviews/review threads;
7. merge #83 implementation;
8. close #83 as implementation-complete / P12-validation-pending;
9. update README/memory-bank to P11 100% implementation and P12 sole final gate.

Safe Fix/Prep and Batch must not be exposed in the current normal release menu until their final integrated P12 runtime code exists.

Community publication itself, actual normal-plugin installation, production plugin ID use and final release acceptance remain P12 tasks.

## P12 — final integrated validation

Only after P9–P11 implementation is complete, execute:
- final release artifact provenance/reproducibility;
- local development-plugin import;
- normal Figma plugin install/run;
- P5 self-test + rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh current-main conflict resolution;
- P6 fresh-artifact positive/refusal acceptance;
- P7 fresh-artifact 60+ sequential queue + active cancellation;
- P9 backlog category/dedupe/delta/export behavior;
- P10 real Figma URL/file-key CLI;
- P10 canonical snapshot CLI;
- raw `.fig` refusal/supported-bridge behavior;
- plugin/CLI parity and deterministic outputs;
- P11 distribution/release package readiness;
- Windows/macOS CLI path handling;
- final closure-intake and release exit review.

Only after this matrix passes should the expanded release be treated as production-accepted / 100%.

## Progress tracking

- historical P0–P7 core progress remains `93%`;
- P9 implementation: `100%`, P12 validation pending;
- P10 implementation: `100%`, P12 validation pending;
- P11 implementation: `85%`, branch active;
- P12 final validation: `0%`.