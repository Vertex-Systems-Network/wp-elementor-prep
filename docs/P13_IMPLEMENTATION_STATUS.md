# P13 Implementation Status

Status: IMPLEMENTATION IN PROGRESS / PRODUCTION ACCEPTANCE BLOCKED BY P12 FINAL RELEASE GATE  
Issues: #153, #155  
Roadmap: #119  
Date: 2026-09-11

## Sequencing

Per the user-directed roadmap sequencing recorded in #119 comment `5637327490`, P13 implementation, tests, CI and non-authorizing development may proceed before the remaining P12 live publisher evidence is collected.

This does **not** waive #84. Production acceptance, release authorization and any final commercial release still require the remaining P12 internal publisher/account/2FA evidence and final exit review.

## First implementation slice — deterministic core

The initial P13 slice is additive and leaves audit score v1 unchanged. It introduces:

- `Build-Ready Score 2.0` report/version types;
- `Responsive Risk v1` report/version types;
- deterministic structural/config fingerprinting and stable run identity;
- explicit evidence coverage and `INSUFFICIENT_EVIDENCE` fail-closed behavior;
- bounded per-rule penalty aggregation;
- target-agnostic responsive-risk detectors that can be justified from the current normalized `AuditNode` facts;
- explicit limitations for rule families that need source facts not yet retained.

Implemented detector families in this slice:

- horizontal density/contraction pressure;
- clipping/overflow dependency from retained geometry;
- bounded non-overlay sibling collision;
- content-bearing absolute-positioning dependency (review-only);
- geometry-only media wrapper advisory;
- fixed-resize long-text advisory with zero penalty because font metrics/sizing constraints are not retained.

Additional Build-Ready evidence in this slice:

- Auto Layout/manual-flow structure debt;
- deep-nesting advisory;
- repeated sibling structural-width drift advisory;
- generic layer-name handoff debt.

## Second implementation slice — plugin + CLI integration

Issue #155 binds the same deterministic P13 core into both real audit entry paths while keeping audit v1 and backlog semantics separate:

- plugin audit computes `buildBuildReadyReport(root, {}, report.generatedAt)` from the same normalized selected-frame root used by audit v1;
- CLI `audit:figma` and `audit:snapshot` compute `buildBuildReadyReport(snapshot.root, {}, report.generatedAt)` from the same canonical root;
- CLI retains the existing audit/backlog files and adds `build-ready-report.json`;
- CLI summary output adds a separate `buildReady` object, while `--fail-on` continues to use the existing backlog threshold only;
- plugin `audit-result` adds the Build-Ready report and serialized JSON without granting mutation authority;
- plugin UI displays a clearly labeled `P13 IMPLEMENTATION CANDIDATE` summary and offers a separate `build-ready-report.json` download;
- the UI states that the report is target-agnostic, read-only analysis and does not present it as production acceptance.

A real CLI execution contract test runs `audit:snapshot` through `scripts/run-cli.mjs`, verifies the existing audit/backlog artifacts remain present, and verifies the versioned Build-Ready artifact and summary output.

## Explicitly deferred rather than guessed

- `RR_LONG_UNBREAKABLE_CONTENT`: actual text token contents are not retained;
- `RR_BREAKPOINT_SPACING_PRESSURE`: normalized gap/padding constraints are not retained;
- `RR_MIN_WIDTH_STACK_PRESSURE`: min/intrinsic sizing modes are not retained;
- strong fixed-width text reflow claims: font metrics and horizontal sizing constraints are not retained;
- strong media responsiveness claims: media sizing modes are not retained.

These limitations are emitted in every report so a partial implementation cannot present itself as a complete responsive audit.

## Acceptance state

Green implementation/integration PRs prove only the deterministic P13 implementation slices. P13 remains production-unaccepted until calibration against retained real-file/plugin evidence, plugin/CLI semantic parity on that retained evidence, and the final P12 release gate are complete.
