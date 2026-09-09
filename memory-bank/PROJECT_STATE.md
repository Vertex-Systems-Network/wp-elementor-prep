# Project State

Last updated: 2026-09-10

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma structure auditor and safe-prep engine for WordPress Elementor. Core analysis/backlog logic is designed to be shared by the Figma plugin and the upcoming P10 CLI/source adapters.

## Current release policy

Issue #84 defines the current release direction: **finish the planned implementation scope first, then batch manual/runtime/end-to-end product acceptance into P12 final integrated validation.**

Consequences:

- do not fabricate runtime evidence;
- do not unlock production mutations from implementation-only claims;
- P5/P6/P7 can be engineering-complete while their real Figma acceptance remains deferred;
- P9/P10/P11 implementation may proceed without repeatedly stopping for manual Figma tests;
- 100% implementation completion does not mean production acceptance before P12.

## Mandatory execution order

1. Issues first.
2. PR/MR second.
3. Highest-priority unblocked development third.
4. Verification + README/memory-bank synchronization before completion.

See `docs/AI_NATIVE_PLAN.md`, `AGENTS.md`, and decision D-012.

## Current repository state

- Base used for P9: `main` `6526d1c9784e07becaa065c039ba5f00f9fb674b` from PR #85.
- Post-merge CI #620 + Integration Readiness #92 passed on that base.
- Open release-line issues: #6, #7, #8, #81, #82, #83, #84.
- PR #87 implements P9 actionable backlog.
- P5/P6/P7 canonical feature heads/artifacts remain unchanged by P9.
- Next implementation after P9 is P10 #82, then P11 #83, followed by P12 #84 final integrated validation.

## Module state

| Module | State | Implementation / validation meaning |
|---|---|---|
| Governance + P0–P4 | implementation complete | automated repository checks remain active; P12 re-validates integrated release behavior |
| P5 #6 | implementation complete / P12 validation pending | canonical #488 retained; real Desktop/rendered-pixel/closure + fresh final integration deferred to P12 |
| P6 #7 | implementation complete / P12 validation pending | #494 retained as engineering reference; fresh integrated P12 artifact required |
| P7 #8 | implementation complete / P12 validation pending | #490 retained as engineering reference; fresh integrated stress/cancel validation required |
| P8 | deferred | outside active release denominator |
| P9 #81 | implementation complete on PR #87 / P12 validation pending | deterministic backlog, delta, JSON/Markdown, plugin UI/export |
| P10 #82 | next | npm/CLI runner, Figma REST + canonical snapshot adapters, explicit raw `.fig` refusal |
| P11 #83 | planned | normal plugin packaging/distribution/release surface |
| P12 #84 | planned | one final integrated runtime/manual/release validation matrix |

## P9 actionable backlog

P9 adds `src/core/backlog.ts` as a pure plugin/CLI-neutral engine.

Implemented contract:

- ERROR / WARNING / INFO / IMPROVEMENT categories;
- deterministic semantic fingerprint/id independent of volatile Figma IDs/timestamps;
- severity, priority, source and finding code;
- optional file/page/frame/section/node contexts;
- explanation/evidence/confidence/action/recipe metadata;
- fail-safe auto-fix eligibility;
- OPEN / RESOLVED / REGRESSED / ACCEPTED_RISK states;
- NEW / RESOLVED / REGRESSED / UNCHANGED delta;
- semantic dedupe with retained occurrence contexts/evidence;
- durable resolved history so later return is REGRESSED;
- generic runtime finding input;
- deterministic JSON/Markdown serializers;
- Figma `clientStorage` prior-run persistence;
- plugin UI summary/view and `backlog.json` / `backlog.md` exports;
- no P9 design mutation path.

See `docs/P9_ACTIONABLE_BACKLOG.md`.

## Runtime artifact registry

`config/runtime-artifacts.json` is runtime artifact registry schema v3.

Registered references:

- P5 #488 / head `810d98d6e09cb4cf3fe4758fcb07e87734254a8e` / digest `9422e83511a82b1dd2b4de8e52a67a70a252799d0922a52ef92addfb0b253a09` / manifest semantic SHA `640b8cf980c1ff43230656fc453c9f581ad5aa4ad35da45e766e53bfd00ccf46`;
- P6 #494 / head `9a6ae3b29e2f70ebbd987a686856c2957f590b75` / reference only;
- P7 #490 / head `cbfdb66db531da8613582c84523265e42dad63a2` / reference only.

Main-side provenance tooling still enforces non-symlink/stable descriptor reads, exact build identity, immutable file hashes, id-excluded manifest semantic equality, optional raw ZIP digest binding, strict evidence intake and verified-byte in-memory verifier execution.

The canonical #488 package/archive preflight calibration is complete, but this does not count as real Figma acceptance.

## P12 validation obligations retained

P12 must eventually perform the real integrated checks that earlier phases intentionally defer, including P5/P6/P7 runtime observations, final artifact registration/closure intake, P9 backlog behavior, P10 CLI/source parity, P11 plugin install/distribution surface, deterministic outputs and cross-platform CLI path/error handling.

Production acceptance, production mutation unlocks and public/Community release readiness remain unavailable until P12 passes.

## Immediate target

Complete/merge P9 #81 as implementation-complete/validation-pending, then start P10 #82. Manual/runtime acceptance should not interrupt P10/P11 implementation unless a concrete safety defect requires it.
