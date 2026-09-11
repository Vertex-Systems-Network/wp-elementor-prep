# P13 Runtime Evidence + Plugin/CLI Parity

Status: IMPLEMENTATION SLICE — REAL FIGMA RUNTIME CAPTURE STILL REQUIRED  
Issue: #159  
Roadmap: #119  
P12 final gate: #84 remains separate and required for production release acceptance

## Purpose

P13 Build-Ready Score 2.0 is already implemented and calibrated against the retained accepted P9/P10 Pella Nova snapshot. This slice adds an evidence path that proves the same analyzer result was produced inside real Figma Desktop and can be compared deterministically with the CLI result.

The evidence path is read-only. It does not grant Safe Fix authority, production acceptance, publishing authority or release authority.

## Plugin runtime evidence

Every successful single-frame Audit builds a bounded P13 runtime evidence bundle from the exact audit result already shown in the plugin UI.

The bundle contains:

- schema version and `acceptanceAuthority: false`;
- capture timestamp and plugin version;
- compiled GitHub Actions build identity (`sourceSha`, run id, run number);
- whether the build identity is traceable;
- whether the capture came from a real Figma file rather than the `local-file` fallback;
- Figma file/page/frame identity;
- compact audit-v1 summary;
- complete versioned Build-Ready Score 2.0 / Responsive Risk v1 report;
- canonical serialized Build-Ready JSON.

The latest valid bundle is retained in `figma.clientStorage` under a versioned key. Storage is best-effort and bounded to 512,000 UTF-8 bytes. Invalid, contradictory, oversized or schema-incompatible evidence fails closed and is not persisted as valid evidence.

## Developer evidence viewer

The development manifest exposes:

`Developer: P13 Runtime Evidence`

The viewer shows:

- Build-Ready score/status;
- Responsive Risk level and HIGH count;
- coverage and blocker count;
- audit-v1 score/status;
- real-Figma-context eligibility;
- traceable-CI-build eligibility;
- file/page/frame identity;
- source SHA and Actions run identity;
- Build-Ready run id;
- capture timestamp;
- copyable bounded evidence JSON.

The command is deliberately absent from `manifest.release.template.json`. The production release menu is not expanded by this developer evidence workflow.

## Parity rules

Plugin and CLI Build-Ready reports are compared semantically. Only `generatedAt` is ignored because it is runtime metadata. All other analyzer facts must match, including:

- Build-Ready and Responsive Risk versions;
- run id;
- structural hash;
- config hash;
- analyzer version;
- config;
- score/status;
- category results;
- responsive summary;
- findings and rule versions;
- evidence coverage;
- limitations.

A parity candidate is accepted only when all of the following are true:

1. the plugin evidence build identity is a traceable 40-character source SHA plus numeric GitHub Actions run id/number;
2. the plugin evidence came from a real Figma file (`fileKey !== "local-file"`);
3. plugin and CLI reports have the same deterministic run identity;
4. semantic mismatch count is zero.

Even then the receipt carries `acceptanceAuthority: false` and `productionAcceptance: false`.

## Offline intake

Run:

```bash
npm run p13:runtime-parity -- \
  --plugin-evidence=/absolute/path/p13-runtime-evidence.json \
  --cli-report=/absolute/path/build-ready-report.json \
  --out=dist-p13/p13-runtime-parity-receipt.json
```

Exit code `0` means the evidence qualifies as a semantic parity candidate. Exit code `2` means parity or provenance requirements did not pass. The generated receipt remains non-authorizing in both cases.

## Real Figma acceptance sequence

For the retained Pella Nova baseline:

1. build/import a traceable CI development artifact containing this slice;
2. open the known accepted Pella Nova Figma file/frame used for P9/P10 calibration;
3. run Audit on exactly that Frame;
4. open `Developer: P13 Runtime Evidence`;
5. copy the evidence JSON without editing it;
6. run the current CLI `audit:snapshot` against the corresponding canonical snapshot;
7. run `npm run p13:runtime-parity` on the plugin evidence and CLI `build-ready-report.json`;
8. review the receipt independently;
9. perform a separate P13 internal acceptance review.

If the live Figma frame has changed since the retained P10 snapshot, exact parity against the old snapshot must fail. That is expected and must not be bypassed; a fresh corresponding canonical snapshot/CLI result is required instead.

## Authority boundary

This slice does not:

- mutate the Figma source;
- unlock Safe Fix;
- change audit-v1 scoring/backlog semantics;
- make target-specific Elementor/Gutenberg/code claims;
- add network access;
- satisfy P12 publisher/account/2FA evidence;
- submit or approve a Figma Community release;
- mark P13 production accepted merely because implementation tests pass.
