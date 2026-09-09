# Roadmap

Last updated: 2026-09-10

## Active release line

| Module / Phase | Status | Progress | Validation / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep issue/PR-first lifecycle, CI/status and artifact provenance synchronized |
| P0–P4 core | IMPLEMENTATION COMPLETE | 100% | Integrated behavior is covered again in P12 |
| P5 Safe Fix | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Retain #488; final real Figma + closure/integration validation in P12 |
| P6 advanced structures | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Retain #494 as engineering reference; fresh integrated P12 build required |
| P7 batch queue | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | Retain #490 as engineering reference; final 60+ stress/cancel in P12 |
| P8 exporter adapters | DEFERRED | N/A | Outside active release line |
| P9 actionable backlog | IMPLEMENTATION COMPLETE / P12 VALIDATION PENDING | 100% | PR #87 implements core/delta/UI/export; final product validation in P12 |
| P10 npm/CLI + input adapters | NEXT | 0% | Figma REST + canonical snapshot adapters, deterministic CLI/report/backlog outputs |
| P11 normal Figma plugin package | PLANNED | 0% | Production manifest/commands/package/distribution/Community submission assets |
| P12 final integrated validation | PLANNED | 0% | One integrated manual/runtime/end-to-end validation + release acceptance phase |

Overall active progress is derived in README as the rounded mean of active numeric module rows. Deferred `N/A` rows are excluded.

## Current policy change

Issue #84 supersedes the earlier stop-and-test-after-each-runtime-module cadence for the current release. Implementation may continue behind safety locks until P9–P11 are finished. P5/P6/P7 real Figma/runtime acceptance is not waived; it is **deferred and consolidated into P12**.

Do not close production acceptance gates, unlock unvalidated mutation paths, or claim release readiness before P12.

## P5 — issue #6

Engineering is complete on canonical head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`, artifact #488.

The artifact is registered in `config/runtime-artifacts.json` schema v3 as the canonical P5 provenance reference. Current main-side tooling has already verified its exact build identity, retained ZIP digest, `5/5` immutable file hashes and id-excluded manifest semantic SHA.

Final real Desktop self-test/rendered-pixel/cleanup/closure intake and then-current-main integration proof remain required, but they are now scheduled in P12 rather than blocking P9–P11 implementation.

## P6 — issue #7

Engineering is complete on `9a6ae3b29e2f70ebbd987a686856c2957f590b75` / #494. The current artifact remains reference-only. P12 must integrate P6 onto the final P5/main line, build/register a fresh exact artifact, run image-bearing positive + preservation-refusal scenarios and closure intake.

## P7 — issue #8

Engineering is complete on `cbfdb66db531da8613582c84523265e42dad63a2` / #490. The current artifact remains reference-only. P12 must integrate P7 onto the final P5/main line, build/register a fresh exact artifact, run realistic 60+ sequential stress + genuinely active Full-P3 cooperative cancellation and closure intake.

## P9 — issue #81

PR #87 implements the actionable backlog layer:

- stable semantic fingerprint/id;
- ERROR/WARNING/INFO/IMPROVEMENT categories;
- severity/priority/source/code/context/evidence/action metadata;
- OPEN/RESOLVED/REGRESSED/ACCEPTED_RISK lifecycle;
- NEW/RESOLVED/REGRESSED/UNCHANGED delta;
- repeated-occurrence dedupe and durable resolved history;
- generic runtime-finding input;
- JSON + Markdown serialization;
- persistent consecutive-run delta in plugin clientStorage;
- plugin UI backlog view/export;
- no design mutations.

After automated CI and merge, P9 remains validation-pending until P12.

## P10 — issue #82

Next implementation target. Build a shared-core CLI/source-adapter layer with:

- Figma REST source by URL/file key using explicit token/scopes;
- canonical versioned snapshot source for offline path-based operation;
- deterministic plugin/CLI parity for equivalent snapshots;
- audit/backlog JSON + Markdown outputs and script-friendly exit codes;
- no secret/token leakage into reports;
- explicit `UNSUPPORTED_FIG_LOCAL_FILE` for raw `.fig` unless a documented supported adapter exists.

## P11 — issue #83

After P10, package the same deterministic core as a normal Figma plugin:

- dev vs release manifest/menu surfaces;
- user-facing commands;
- developer-only command hiding where appropriate;
- reproducible release package/provenance;
- local/private/team distribution instructions;
- Community submission checklist/assets/privacy/versioning.

## P12 — issue #84

Final integrated validation covers all deferred manual/runtime/release obligations: P5/P6/P7, P9 backlog, P10 CLI/source adapters, P11 package/install/distribution, deterministic parity, final closure intake and release readiness.

Only P12 may promote the release to production accepted / 100% final validation.

## Mandatory execution policy

1. inspect/process Issues;
2. inspect/fix/merge PR/MR;
3. continue highest-priority unblocked implementation;
4. run status/typecheck/tests/build/integration checks;
5. update memory-bank/README and artifact registry when canonical artifact state changes;
6. never synthesize manual/runtime evidence to advance progress.
