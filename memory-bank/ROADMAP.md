# Roadmap

Last updated: 2026-09-10

| Module / Phase | Scope | Status | Progress | Progress Bar | Blocker / Next |
|---|---|---|---:|---|---|
| AI-native governance/tooling | Memory-bank, issue/PR-first lifecycle, CI/integration/artifact tooling | COMPLETE | 100% | `██████████` | Keep status + artifact registry synchronized after every batch |
| P0 | Specification, architecture, repository foundation | COMPLETE | 100% | `██████████` | None |
| P1 | Audit-Only scanner, discovery, scoring, report UI | COMPLETE | 100% | `██████████` | None |
| P2 | Deterministic classifier semantics + evidence | COMPLETE | 100% | `██████████` | None |
| P3 | Geometry/content/image + rendered-pixel validation | COMPLETE | 100% | `██████████` | None |
| P4 | Candidate transaction + rollback | COMPLETE | 100% | `██████████` | None |
| P5 | Conservative Safe Fix recipes + exact-build proof | IMPLEMENTED / VALIDATION DEFERRED | 94% | `█████████░` | Keep locked; final real-Figma acceptance moves to P12 |
| P6 | Advanced timeline/carousel/milestone/page normalization | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Final integrated line + acceptance in P12 |
| P7 | Sequential multi-frame/page batch queue | IMPLEMENTED / FINAL INTEGRATION PENDING | 80% | `████████░░` | Final integrated line + stress/cancel acceptance in P12 |
| P8 | Optional Elementor schema exporters | DEFERRED | N/A | `──────────` | Re-evaluate after normalization line stabilizes |
| P9 | Actionable backlog generator | PLANNED | 0% | `░░░░░░░░░░` | Implement ERROR/WARNING/INFO/IMPROVEMENT backlog + dedupe/delta/export (#81) |
| P10 | npm/Node CLI + source adapters | PLANNED | 0% | `░░░░░░░░░░` | Shared core + Figma URL/file key + canonical snapshot path (#82) |
| P11 | Normal Figma plugin distribution | PLANNED | 0% | `░░░░░░░░░░` | Production manifest/package + private/Community-ready distribution (#83) |
| P12 | Final integrated validation/release acceptance | PLANNED FINAL GATE | 0% | `░░░░░░░░░░` | Run all deferred manual/runtime/end-to-end acceptance only after implementation scope is complete (#84) |

## Progress interpretation

**Current core delivery line (P0–P7):** `█████████░ 93%`

This preserves the previously verified core progress and does not pretend newly added release-expansion work was already part of that denominator.

**Expanded release modules (P9–P12):** `0%` implementation/validation at planning baseline.

P8 remains optional/deferred and is not counted as an active release blocker unless explicitly reactivated.

## Validation policy change

Per current project direction, manual/runtime/end-to-end testing is deferred until P12.

Before P12:
- implementation may continue;
- safety locks and exact-build provenance rules remain in place;
- no Figma runtime evidence may be fabricated;
- P5/P6/P7 must not be called production-accepted merely because engineering is implemented;
- automated repository safeguards may still exist, but they are not final product acceptance.

P12 is the single integrated acceptance phase for the completed implementation line.

## P0–P4

Complete and merged. The core line provides deterministic scanning/classification, semantic/preservation evidence, geometry/content/image integrity, rendered-pixel validation, candidate-only transaction isolation, Full P3-before-P4 commit, and bounded restore/finalize checkpoint behavior.

## P5 — issue #6

Engineering and exact-artifact offline verification are complete on canonical #488. Main-side preflight/archive/provenance plumbing is already hardened.

The previous immediate real-Figma acceptance requirement is no longer a reason to stop unrelated planned implementation. P5 remains safety-locked and validation-pending until P12, where the real imported-plugin/rendered-pixel/closure-intake matrix will be executed.

## P6 — issue #7

Engineering is complete on reference head `9a6ae3b` / CI #494 PASS. Final production integration still depends on the final accepted P5 line and a fresh exact artifact. That integration/acceptance work is part of the P12 final matrix unless an earlier implementation-only integration branch becomes necessary.

## P7 — issue #8

Engineering is complete on reference head `cbfdb66` / CI #490 PASS. Final production integration and realistic 60+ stress/cancellation acceptance remain deferred to P12.

## P8

Optional Elementor exporter adapters remain intentionally deferred; issue #9 is closed as not planned for the active release line.

## P9 — actionable backlog / issue #81

Build a first-class structured improvement queue from audit/runtime findings.

Required categories:
- ERROR;
- WARNING;
- INFO;
- IMPROVEMENT.

Required behavior:
- deterministic IDs/fingerprints;
- severity/priority;
- context and evidence;
- proposed action/recipe;
- auto-fix eligibility;
- lifecycle state;
- dedupe;
- run-to-run delta;
- JSON + Markdown outputs;
- plugin UI and CLI export.

## P10 — npm/Node CLI / issue #82

Expose the same deterministic analysis core through Node/npm.

Supported initial source adapters:
- official Figma REST URL/file-key input;
- canonical versioned snapshot/package path.

A raw proprietary `.fig` path must not be reverse-engineered by an undocumented parser. Until a supported bridge exists, it must fail clearly with `UNSUPPORTED_FIG_LOCAL_FILE` and point to supported alternatives.

Target examples:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

## P11 — Figma plugin distribution / issue #83

Package the same core as a normal user-facing Figma plugin with:
- production plugin ID/manifest;
- release-safe command surface;
- development vs release variants;
- reproducible package;
- local/private/team install guidance;
- Community submission assets/checklist;
- privacy/network declaration;
- versioning/update process.

Community approval remains subject to Figma review.

## P12 — final integrated validation / issue #84

Final matrix must include:
- release artifact provenance;
- local dev-plugin import;
- normal plugin install/run;
- P5 rendered-pixel reject/restore/finalize + zero leftovers;
- P6 positive/refusal acceptance;
- P7 realistic 60+ sequential queue + active cancellation;
- P9 backlog category/dedupe/delta/export quality;
- P10 Figma URL/file-key CLI;
- P10 canonical snapshot path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity;
- deterministic outputs;
- final closure-intake;
- P11 distribution/release-package readiness;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be marked 100% / production-accepted.

## Mandatory roadmap execution policy

For every future development cycle:

1. inspect/process open Issues;
2. inspect open PR/MR;
3. continue the highest-priority unblocked implementation item;
4. synchronize memory-bank + README state;
5. distinguish implementation progress from final validation progress;
6. preserve safety/provenance locks while validation is deferred;
7. run the final manual/runtime/end-to-end validation only in P12 unless the user explicitly changes that policy.
