# Release Expansion Plan — P9 to P12

Date: 2026-09-10

This plan extends the current P0–P7 core with three implementation modules and one final integrated validation phase.

## Policy

Manual/runtime/end-to-end product testing is deferred until P12.

Before P12:
- continue implementation;
- preserve safety/provenance locks;
- do not fabricate Figma observations;
- do not call validation-pending modules production-accepted.

## P9 — Actionable backlog / #81

Generate a deterministic backlog from audit/prep findings.

Categories:
- ERROR
- WARNING
- INFO
- IMPROVEMENT

Outputs:
- backlog.json
- backlog.md
- category/severity summary
- deterministic dedupe
- run-to-run delta
- plugin UI export
- CLI export

## P10 — npm/Node CLI / #82

Use the same deterministic core as the Figma plugin.

Supported initial inputs:
- official Figma URL/file key through the REST API;
- canonical versioned snapshot/package file path.

Target commands:

```bash
npm run audit:figma -- --url "https://www.figma.com/design/<file-key>/<name>"
npm run audit:figma -- --file-key "<file-key>"
npm run audit:snapshot -- --input "/path/to/figma-snapshot.json"
npm run backlog:generate -- --input "/path/to/audit-report.json" --out "/path/to/output"
```

Raw `.fig` files are proprietary. Do not add an undocumented parser. Until a supported bridge exists, raw `.fig` path input must fail explicitly with `UNSUPPORTED_FIG_LOCAL_FILE` and direct the user to a Figma URL/file key or canonical snapshot path.

## P11 — Normal Figma plugin distribution / #83

Make the product usable like other Figma plugins:
- production plugin ID/manifest;
- dev/release command variants;
- reproducible release package;
- user-facing Audit / Backlog / Safe Fix-Prep / Batch / Export Report commands;
- local development import;
- private/team distribution guidance;
- Community-ready submission package/checklist;
- release assets, versioning, changelog, support and privacy/network declaration.

Community publication remains subject to Figma review.

## P12 — Final integrated validation / #84

After implementation is complete, validate:
- P5 real imported-plugin/rendered-pixel acceptance;
- P6 positive/refusal acceptance;
- P7 realistic 60+ queue + active cancellation;
- P9 backlog categories/dedupe/delta/export;
- P10 URL/file-key CLI and snapshot-path CLI;
- raw `.fig` supported/unsupported behavior;
- plugin/CLI parity and deterministic outputs;
- P11 normal plugin install/run and release-package readiness;
- final artifact provenance and closure-intake;
- Windows/macOS path handling where applicable.

Only after P12 passes should the expanded release be marked production-accepted / 100%.

## Planned implementation order

1. P9 / #81
2. P10 / #82
3. P11 / #83
4. P12 / #84 final validation

P8 Elementor export remains optional/deferred.
