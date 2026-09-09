# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma audit/safe-prep engine for WordPress Elementor.

Final planned user surfaces:
1. a normal Figma plugin;
2. an npm/Node CLI for supported Figma inputs;
3. structured continuous-improvement backlog outputs.

## Current policy

Manual/runtime/end-to-end product testing is deferred until P12 final integrated validation.

Before P12:
- implementation may continue where safe;
- production safety locks and exact-build provenance remain active;
- no runtime evidence may be fabricated;
- implementation-complete is not production-accepted;
- latest integration-conflict facts must be preserved.

## Repository baseline

Latest main baseline for this planning update: `6526d1c9784e07becaa065c039ba5f00f9fb674b` from PR #85.

PR #85 corrected an important integration assumption: latest Integration Readiness #90 reports canonical P5 → current main as `CODE_CONFLICT`, not docs-only. Conflicts include `.github/workflows/ci.yml`, `scripts/prepare-figma-import.mjs`, README and memory-bank files. Historical integration proof #37 / CI #500 is superseded for merge authorization.

The final P5 integration resolution must preserve current-main source/output-overlap safety, CI/status tooling and closure/runbook hardening.

## Current issue queue

Core/runtime validation-pending:
- #6 — P5 Safe Fix;
- #7 — P6 Advanced structures;
- #8 — P7 Batch queue.

Release-expansion implementation:
- #81 — P9 actionable backlog generator;
- #82 — P10 npm/CLI + supported Figma source adapters;
- #83 — P11 normal Figma plugin packaging/distribution;
- #84 — P12 final integrated validation/release acceptance.

P8 Elementor exporter remains deferred.

## Module state

| Module | Status | Progress | Blocker / Next |
|---|---|---:|---|
| AI-native governance/tooling | COMPLETE | 100% | Keep Issues/PR/status/provenance synchronized |
| P0–P4 core audit/validation/transaction | COMPLETE | 100% | None |
| P5 Safe Fix | IMPLEMENTED / VALIDATION DEFERRED | 94% | P12 real Figma closure → fresh then-current-main `CODE_CONFLICT` resolution preserving #85 requirements → merge #6 |
| P6 advanced structures | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5 merge: fresh exact artifact + positive/refusal closure #7 |
| P7 batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | P12 after P5 merge: fresh exact artifact + 60+ stress/cancel closure #8 |
| P8 exporter adapters | DEFERRED | N/A | Re-evaluate later |
| P9 backlog generator | PLANNED | 0% | Implement #81 |
| P10 npm/CLI | PLANNED | 0% | Implement #82 |
| P11 Figma plugin distribution | PLANNED | 0% | Implement #83 |
| P12 final validation | PLANNED FINAL GATE | 0% | Run all deferred final acceptance #84 |

## Progress interpretation

Historical P0–P7 core progress remains `93%` under its original denominator.

P9–P12 are new release-expansion scope and start at `0%` planning baseline.

## P5 current technical state

Canonical P5:
- branch `feat/p5-safe-recipes`;
- head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e`;
- CI #488;
- artifact `figma-plugin-dist-488`;
- ZIP SHA-256 `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09`;
- manifest semantic SHA-256 `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`.

Current-main exact-artifact preflight/archive/provenance calibration is complete. Real imported-Figma acceptance remains pending and is now scheduled for P12.

After that closure passes, P5 still requires a fresh integration resolution against the then-current main because PR #85 establishes current `CODE_CONFLICT` status. The resolution must preserve current-main helper-overlap safety and hardened CI/status/closure contracts.

## P6/P7 current technical state

P6 #494 and P7 #490 remain engineering/reference artifacts. Their final production integration requires fresh exact artifacts after the final P5 merge. Those integrated runtime scenarios belong to P12.

## P9 — backlog architecture

Categories:
- ERROR;
- WARNING;
- INFO;
- IMPROVEMENT.

Each backlog item should carry deterministic identity, severity/priority, rule code, Figma context, explanation, evidence/confidence, proposed action, auto-fix eligibility, occurrence history and lifecycle state.

Outputs:
- `backlog.json`;
- `backlog.md`;
- summary counts;
- deterministic dedupe;
- run-to-run delta;
- plugin UI export;
- CLI export.

Backlog generation is non-mutating.

## P10 — npm/CLI architecture

Plugin and CLI share one deterministic scanner/classifier/scoring/backlog core.

Planned adapters:
- `FigmaRestSourceAdapter` for official Figma URL/file-key access;
- `CanonicalSnapshotSourceAdapter` for our versioned snapshot/package paths;
- future `LocalFigmaBridgeAdapter` only if a documented supported mechanism exists.

Raw proprietary `.fig` files must not be parsed through undocumented reverse engineering. Until a supported bridge exists, `.fig` path input returns `UNSUPPORTED_FIG_LOCAL_FILE` and points to URL/file-key or canonical snapshot alternatives.

Target commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

## P11 — Figma plugin distribution

Complete the production layer around the existing classic-plugin manifest/runtime:
- production plugin ID/manifest;
- dev/release command surfaces;
- reproducible release package;
- user commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- local/private/team distribution guidance;
- Community submission package/checklist;
- release assets/versioning/support/privacy/network metadata.

Community publication remains subject to Figma review.

## P12 — final validation

P12 validates the completed implementation line:
- release artifact provenance/reproducibility;
- local dev-plugin import;
- normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P5 closure intake + fresh current-main conflict resolution preserving PR #85 requirements;
- P6 fresh-artifact positive/refusal acceptance;
- P7 fresh-artifact 60+ sequential queue + active cancellation;
- P9 backlog category/dedupe/delta/export quality;
- P10 Figma URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity and deterministic outputs;
- P11 release/distribution package readiness;
- final closure-intake;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be production-accepted / 100%.

## Immediate development target

Do not spend the current development cycle on manual/runtime product testing.

After the P9–P12 planning update lands, proceed with:
1. P9 backlog generator (#81);
2. P10 CLI/source adapters (#82);
3. P11 normal Figma distribution (#83);
4. P12 final validation (#84).
