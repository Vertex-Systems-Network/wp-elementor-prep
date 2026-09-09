# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor with two planned user surfaces:

1. a normal Figma plugin;
2. an npm/Node CLI using supported Figma source adapters.

The product will also generate a structured continuous-improvement backlog from audit/prep findings.

## Current direction

The core P0–P7 engineering line is substantially implemented. Manual/runtime/end-to-end product testing is now intentionally deferred until the final integrated P12 validation phase.

This means development may continue without repeatedly blocking on unavailable manual Figma testing, but:

- safety locks remain active;
- exact-build/provenance rules remain authoritative;
- no runtime evidence may be fabricated;
- implementation-complete is not the same as production-accepted.

## Repository baseline

Latest verified main before this planning branch: `698940369635b6f40972e6404e7e7ff71b57ea14` from PR #79.

PR #79 hardened the real-Figma runbook so current-main `runtime:closure-intake` is the final closure boundary and direct packaged verifier execution is diagnostic-only.

## Current issue queue

Core/runtime:
- #6 — P5 Safe high-confidence Auto Layout recipes;
- #7 — P6 Advanced structures;
- #8 — P7 60+ Frame batch queue.

Expanded release scope:
- #81 — P9 actionable backlog generator;
- #82 — P10 npm/CLI + supported Figma source adapters;
- #83 — P11 normal Figma plugin packaging/distribution;
- #84 — P12 final integrated validation/release acceptance.

P8 Elementor exporter remains deferred/not part of the active release blocker set.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep issue/PR/status/provenance state synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | IMPLEMENTED / VALIDATION DEFERRED | 94% | Keep safety-locked; final real-Figma proof in P12 |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | Final integrated line + runtime acceptance in P12 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | Final integrated line + 60+ stress/cancel acceptance in P12 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | PLANNED | 0% | Implement structured backlog (#81) |
| P10 npm/CLI | PLANNED | 0% | Implement shared-core source adapters + CLI (#82) |
| P11 Figma plugin distribution | PLANNED | 0% | Implement release package/distribution layer (#83) |
| P12 final validation | PLANNED FINAL GATE | 0% | Execute all deferred manual/runtime/end-to-end testing (#84) |

## Progress interpretation

Core P0–P7 progress remains `93%` under the original denominator.

P9–P12 are a newly added release-expansion scope and start at `0%`. They are tracked separately so adding scope does not rewrite already verified historical progress.

## P5 current technical state

Canonical P5 artifact:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI #488;
- artifact `figma-plugin-dist-488`;
- raw ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Current-main exact-artifact preflight/archive/provenance calibration is already complete. Real imported-Figma acceptance remains pending and is now scheduled into P12 rather than blocking unrelated implementation work.

## P6/P7 current technical state

P6 reference artifact #494 and P7 reference artifact #490 remain engineering/reference builds. Final production integration still requires fresh exact artifacts on the final merged line.

That final integration + runtime acceptance is part of P12 unless an implementation-only integration branch becomes necessary earlier.

## P9 — backlog architecture

Backlog categories:
- ERROR;
- WARNING;
- INFO;
- IMPROVEMENT.

Backlog items will carry deterministic IDs, severity/priority, context, evidence/confidence, proposed action, auto-fix eligibility, lifecycle state, occurrence history and run-to-run delta.

Outputs:
- `backlog.json`;
- `backlog.md`;
- plugin UI backlog view/export;
- CLI-compatible output.

## P10 — npm/CLI architecture

Plugin and CLI share one deterministic analysis core.

Planned source adapters:
- `FigmaRestSourceAdapter` for official Figma cloud URL/file key;
- `CanonicalSnapshotSourceAdapter` for our own versioned snapshot/package path;
- future `LocalFigmaBridgeAdapter` only if a supported safe mechanism exists.

Raw local `.fig` files must not be parsed with an undocumented proprietary parser. Until a supported bridge exists, `.fig` path input fails explicitly with `UNSUPPORTED_FIG_LOCAL_FILE` and points to URL/file-key or canonical snapshot alternatives.

Target commands include:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

## P11 — Figma plugin distribution

The repository already has a classic-plugin manifest shape. P11 completes the production layer:

- real production plugin ID/manifest;
- dev vs release commands;
- reproducible package;
- normal user commands (Audit, Backlog, Safe Fix/Prep, Batch, Export Report);
- local/private/team distribution guidance;
- Community-ready submission assets/checklist;
- versioning/changelog/update policy;
- privacy/network declaration.

Community listing remains subject to Figma review.

## P12 — final validation

P12 is the only phase that marks the expanded release production-accepted.

Required validation matrix includes:
- local development-plugin import;
- normal plugin install/run;
- P5 real rendered-pixel reject/restore/finalize + zero leftovers;
- P6 positive/refusal acceptance;
- P7 60+ sequential queue + active cancellation;
- P9 backlog categories/dedupe/delta/export;
- P10 URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity;
- deterministic outputs;
- closure-intake on final artifacts;
- P11 release package/distribution readiness;
- Windows/macOS CLI path behavior where applicable.

## Immediate development target

Do not spend the current cycle on manual/runtime testing.

After this planning update is merged, implementation should proceed with the highest-priority new unblocked module: **P9 backlog generator (#81)**, followed by **P10 CLI (#82)** and **P11 distribution (#83)**, while P12 remains the final integrated acceptance gate.
