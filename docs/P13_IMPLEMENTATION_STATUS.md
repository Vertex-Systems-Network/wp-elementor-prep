# P13 Implementation Status

Status: IMPLEMENTATION IN PROGRESS / REAL-BASELINE CALIBRATION CANDIDATE RETAINED / PRODUCTION ACCEPTANCE BLOCKED BY P12 FINAL RELEASE GATE  
Issues: #153, #155, #157  
Roadmap: #119  
Date: 2026-09-11

## Sequencing

Per the user-directed roadmap sequencing recorded in #119, P13 implementation, tests, CI and non-authorizing development may proceed before the remaining P12 live publisher evidence is collected.

This does **not** waive #84. Production acceptance, release authorization and any final commercial release still require the remaining P12 internal publisher/account/2FA evidence and final exit review.

## Implemented foundation

P13 is additive and leaves audit score v1 unchanged. It now includes:

- `Build-Ready Score 2.0` report/version types;
- `Responsive Risk v1` report/version types;
- deterministic structural/config fingerprinting and stable run identity;
- explicit evidence coverage and `INSUFFICIENT_EVIDENCE` fail-closed behavior;
- bounded per-rule penalty aggregation;
- target-agnostic responsive-risk detectors justified by retained `AuditNode` facts;
- plugin and CLI integration through the same shared deterministic core;
- machine-readable `build-ready-report.json` export;
- plugin UI summary clearly labeled as a P13 implementation candidate.

Implemented detector families:

- horizontal density/contraction pressure;
- clipping/overflow dependency from retained geometry and known deterministic layout semantics;
- bounded sibling collision review with preservation-aware handling for manual/layered composition;
- content-bearing absolute-positioning dependency;
- geometry-only media wrapper advisory;
- fixed-resize long-text advisory with zero penalty where stronger source facts are not retained.

Additional Build-Ready evidence:

- Auto Layout/manual-flow structure debt;
- deep-nesting advisory;
- repeated sibling structural-width drift advisory;
- generic layer-name handoff debt.

## Real-baseline calibration

The merged plugin/CLI implementation was calibrated against the already-retained accepted P9/P10 Pella Nova canonical snapshot without committing the private design snapshot to this repository.

The calibration found and corrected false-positive pressure in the initial responsive-risk implementation:

- intentional/manual layered overlaps no longer become responsive HIGH findings from geometry alone and are retained as LOW zero-penalty advisory evidence;
- known clipped carousel geometry is not duplicated as a generic HIGH clipping defect;
- absolute image composition and small controlled clipping are review-level rather than HIGH;
- horizontal density requires either an applicable configured reference-width probe or direct current-width overflow.

Final retained real-baseline candidate:

- audit v1 remains exactly `75 / REVIEW`;
- Build-Ready v2 is `85 / REVIEW`;
- analyzed coverage is `1152 / 1152` (`100%`);
- Responsive Risk is `MEDIUM` with `0` responsive HIGH findings;
- Responsive Risk category is `70 / REVIEW`;
- blocker count is `0`;
- two independent snapshot runs produced byte-identical audit, backlog and Build-Ready JSON outputs.

Full aggregate provenance and hashes are retained in `docs/P13_REAL_BASELINE_CALIBRATION_2026-09-11.md`.

## Explicitly deferred rather than guessed

- `RR_LONG_UNBREAKABLE_CONTENT`: actual text token contents are not retained;
- `RR_BREAKPOINT_SPACING_PRESSURE`: normalized gap/padding constraints are not retained;
- `RR_MIN_WIDTH_STACK_PRESSURE`: min/intrinsic sizing modes are not retained;
- strong fixed-width text reflow claims: font metrics and horizontal sizing constraints are not retained;
- strong media responsiveness claims: media sizing modes are not retained.

These limitations remain emitted in every report so a partial implementation cannot present itself as a complete responsive audit.

## Acceptance state

A green calibration PR establishes the deterministic core/integration and retained real-source calibration candidate. P13 still remains production-unaccepted until retained real Figma plugin/runtime P13 evidence and a separate final P13 internal acceptance review are completed. Final production release authority also remains blocked by P12 #84.
