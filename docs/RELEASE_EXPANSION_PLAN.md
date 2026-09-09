# Release Expansion Plan — P9 to P12

Date: 2026-09-10

This plan extends the current P0–P7 core with three implementation modules and one final integrated validation phase.

## Current policy

Manual/runtime/end-to-end product testing is deferred until P12.

Before P12:
- continue implementation where safe;
- preserve safety/provenance locks;
- do not fabricate Figma observations;
- do not call validation-pending modules production-accepted;
- preserve the latest P5→main `CODE_CONFLICT` integration truth from PR #85.

## P9 — Actionable backlog / #81

Generate a deterministic backlog from audit/prep findings.

Categories:
- `ERROR` — blocking failures/invariant violations;
- `WARNING` — risky or ambiguous structures requiring review;
- `INFO` — non-blocking observations/context;
- `IMPROVEMENT` — actionable opportunities for Elementor-readiness, consistency, performance, accessibility or maintainability.

Each item should include:
- deterministic fingerprint/id;
- category, severity and priority;
- rule/finding code;
- file/page/frame/section/node context when available;
- title and explanation;
- evidence/confidence;
- proposed action/recipe candidate;
- auto-fix eligibility;
- firstSeen/lastSeen/occurrences;
- lifecycle state such as OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK.

Outputs:
- `backlog.json`;
- `backlog.md`;
- category/severity summary;
- deterministic dedupe;
- run-to-run delta;
- plugin UI export;
- CLI export.

Backlog generation is non-mutating.

## P10 — npm/Node CLI / #82

Use the same deterministic analysis core as the Figma plugin.

Initial supported inputs:
- official Figma URL/file key through the Figma REST API;
- canonical versioned snapshot/package file path produced by our own plugin/adapter.

Target commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

A convenience dispatcher may later accept URL, file key or supported path through one `--input` flag.

### Raw `.fig` rule

Do not add an undocumented parser for proprietary raw `.fig` files.

Until a documented/supported bridge exists:

```text
/path/file.fig -> UNSUPPORTED_FIG_LOCAL_FILE
```

The CLI must direct the user to a Figma URL/file key or canonical snapshot path rather than guessing.

Planned adapters:
- `FigmaRestSourceAdapter`;
- `CanonicalSnapshotSourceAdapter`;
- future `LocalFigmaBridgeAdapter` only if a safe supported mechanism exists.

CLI outputs:
- audit JSON/Markdown;
- backlog JSON/Markdown;
- machine-usable exit codes;
- summary-only mode;
- configurable output directory;
- no token/credential leakage into outputs.

## P11 — Normal Figma plugin distribution / #83

Make the product usable like other Figma plugins.

Planned work:
- production plugin ID/manifest;
- development vs release command/menu variants;
- reproducible release package containing required runtime/UI/assets only;
- normal user commands: Audit, Backlog, Safe Fix/Prep, Batch, Export Report;
- hide developer-only self-test/evidence commands from normal release UI where appropriate;
- local development import instructions;
- private/team/organization distribution guidance;
- Figma Community submission package/checklist;
- icon, cover/thumbnail, screenshots, description, category/tags and support contact;
- versioning/changelog/update process;
- privacy/network declaration;
- release provenance/build metadata.

Community publication remains subject to Figma review and is not assumed to be automatic.

## P12 — Final integrated validation / #84

After implementation is complete, run one integrated validation matrix covering:
- final release artifact provenance/reproducibility;
- local development-plugin import;
- normal Figma plugin install/run;
- P5 real rendered-pixel reject/restore/finalize + zero leftovers;
- current-main P5 conflict resolution after closure, preserving #85 safety requirements;
- P6 positive + preservation-refusal scenarios on a fresh final-line artifact;
- P7 realistic 60+ sequential queue + active Full-P3 cancellation on a fresh final-line artifact;
- P9 backlog categories/dedupe/delta/export;
- P10 official URL/file-key CLI;
- P10 canonical snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity on equivalent snapshots;
- deterministic report/backlog output;
- final `runtime:closure-intake` on registered artifacts/evidence;
- P11 distribution/release-package readiness;
- Windows/macOS CLI path handling where applicable.

Only after P12 passes should the expanded release be called production-accepted / 100%.

## Planned implementation order

1. P9 / #81
2. P10 / #82
3. P11 / #83
4. P12 / #84 final integrated validation

P8 Elementor export remains optional/deferred.
