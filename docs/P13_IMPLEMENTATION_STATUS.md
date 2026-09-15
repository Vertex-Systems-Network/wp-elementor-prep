# P13 Implementation Status

Status: IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING  
Issues: #153, #155, #157, #159  
Roadmap: #119  
Date: 2026-09-15

## Sequencing

Per the user-directed roadmap sequencing recorded in #119, P13 implementation, tests, CI and non-authorizing development may proceed before the remaining P12 live publisher evidence is collected.

This does **not** waive #84. Production acceptance, release authorization and any final commercial release still require the remaining P12 internal publisher/account/2FA evidence and final exit review.

P13 repository implementation is complete, but genuine runtime acceptance is not. #159 remains open for real Figma Desktop evidence, exact plugin/CLI parity review and a separate internal P13 acceptance decision.

## Implemented foundation

P13 is additive and leaves audit score v1 unchanged. It includes:

- `Build-Ready Score 2.0` report/version types;
- `Responsive Risk v1` report/version types;
- deterministic structural/config fingerprinting and stable analyzer-bound run identity;
- analyzer identity `p13-core-v2`;
- explicit evidence coverage and `INSUFFICIENT_EVIDENCE` fail-closed behavior;
- bounded per-rule penalty aggregation;
- target-agnostic responsive-risk detectors justified by retained `AuditNode` facts;
- plugin and CLI integration through the same shared deterministic core;
- machine-readable `build-ready-report.json` export;
- plugin UI summary clearly labeled as non-authorizing P13 evidence.

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

## Implemented real-plugin evidence + parity path

The #159 implementation path is present in the repository and remains read-only/non-authorizing:

- successful single-frame plugin Audit builds a bounded P13 runtime-evidence bundle from the exact audit/Build-Ready result shown by the plugin;
- evidence is bound to plugin/build identity plus Figma file/page/frame context and the complete versioned Build-Ready report;
- latest valid evidence is stored through bounded `figma.clientStorage` handling;
- replacement begins by quarantining/invalidation of the previous slot so a failed fresh persistence attempt cannot silently expose older evidence as current;
- invalid, contradictory, oversized or unsupported evidence fails closed;
- the development-only `Developer: P13 Runtime Evidence` viewer exposes inspectable/copyable evidence while the release manifest remains unchanged;
- `npm run p13:runtime-parity` performs offline semantic comparison of plugin evidence against the corresponding CLI Build-Ready report;
- parity ignores only explicitly allowed runtime metadata and requires analyzer-bound deterministic identity plus zero semantic mismatches;
- offline parity was aligned to `p13-core-v2`; stale analyzer identity or forged/inconsistent run identity fails closed;
- runtime/parity receipts explicitly remain `acceptanceAuthority: false` and `productionAcceptance: false`.

PR #160 added the runtime-evidence/viewer/parity path, PR #162 hardened stale-evidence replacement, and PR #294 aligned the offline parity contract to analyzer-v2 identity. These implementation merges do not themselves satisfy #159.

## Real-baseline calibration

The merged plugin/CLI deterministic core was calibrated against the already-retained accepted P9/P10 Pella Nova canonical snapshot without committing the private design snapshot to this repository.

The calibration found and corrected false-positive pressure in the initial responsive-risk implementation:

- intentional/manual layered overlaps no longer become responsive HIGH findings from geometry alone and are retained as LOW zero-penalty advisory evidence;
- known clipped carousel geometry is not duplicated as a generic HIGH clipping defect;
- absolute image composition and small controlled clipping are review-level rather than HIGH;
- horizontal density requires either an applicable configured reference-width probe or direct current-width overflow.

Retained real-baseline facts remain:

- audit v1: `75 / REVIEW`;
- Build-Ready v2: `85 / REVIEW`;
- analyzed coverage: `1152 / 1152` (`100%`);
- Responsive Risk: `MEDIUM` with `0` responsive HIGH findings;
- Responsive Risk category: `70 / REVIEW`;
- blocker count: `0`;
- two independent snapshot runs produced byte-identical audit, backlog and Build-Ready JSON outputs for the retained calibration candidate.

Full aggregate provenance and hashes are retained in `docs/P13_REAL_BASELINE_CALIBRATION_2026-09-11.md`.

## Explicitly deferred rather than guessed

- `RR_LONG_UNBREAKABLE_CONTENT`: actual text token contents are not retained;
- `RR_BREAKPOINT_SPACING_PRESSURE`: normalized gap/padding constraints are not retained;
- `RR_MIN_WIDTH_STACK_PRESSURE`: min/intrinsic sizing modes are not retained;
- strong fixed-width text reflow claims: font metrics and horizontal sizing constraints are not retained;
- strong media responsiveness claims: media sizing modes are not retained.

These limitations remain emitted in reports so the implementation cannot present partial retained evidence as a complete responsive audit.

## Runtime acceptance state

P13 is **IMPLEMENTATION COMPLETE / RUNTIME ACCEPTANCE PENDING**.

Repository tests, connected/read-only metadata drift screening, generated traceable development artifacts and synthetic parity checks are supporting evidence only. They do not prove that the current P13 result was produced inside genuine Figma Desktop on the intended real frame and they do not create acceptance authority.

#159 must remain open until all of the following genuine steps occur:

1. use an appropriately traceable P13 development artifact in real Figma Desktop;
2. run Audit on the intended accepted real frame;
3. copy the exact `Developer: P13 Runtime Evidence` JSON unchanged;
4. produce the corresponding current CLI `build-ready-report.json` for the same deterministic source state;
5. run the current `p13:runtime-parity` intake and obtain zero semantic mismatches with all provenance requirements satisfied;
6. independently review the parity receipt;
7. perform a separate internal P13 runtime-acceptance review.

If the live Figma source has drifted, parity against an old retained snapshot must fail rather than be forced. A fresh corresponding canonical snapshot/CLI result is required.

Even a successful #159 runtime/parity review does not waive P12 #84. Final production release authority remains separately gated by the retained P12 publisher/account/2FA evidence and final exit review.
