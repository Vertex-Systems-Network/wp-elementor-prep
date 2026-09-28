# P15–P18 evidence register — 2026-09-29

Status: IMPLEMENTED EVIDENCE INVENTORY / FOUR PHASE EXITS NOT SATISFIED
Owner gate: #846

This register consolidates retained evidence for the pre-P19 program. It is an evidence index, not a production certificate. A green repository workflow proves the changed code passed its checks; it does not prove a real Elementor, Gutenberg, Figma visual or production target outcome.

## Phase register

| Phase | Retained implementation evidence | Verification references | Current exit status | Missing evidence / refusal boundary |
|---|---|---|---|---|
| P15 Elementor | Deterministic Template JSON candidate, selected-frame extraction, explicit responsive/style mappings, controlled WordPress 6.8 + Elementor 4.2.4 proof, read-only Image/Container MEDIA diagnostics | README P15 row; `docs/P15_PACKAGE_13_14_ASSET_PROBE_2026-09-28.md`; P15 workflow receipts on exact PR heads | `IMPLEMENTATION_PARTIAL / TARGET_EXIT_PENDING` | Temporary Figma URLs returned HTML/Site Unavailable instead of source bytes. No durable WordPress media mapping, browser image-load proof or Figma-vs-import spacing comparison. Do not claim package parity, download readiness or production acceptance. |
| P16 Gutenberg | Native candidate/receipt chain, offline evidence-retention manifest/validator, bounded local JSON I/O and dated R0 contract | `docs/P16_GUTENBERG_R0_CONTRACT_2026-09-29.md`; `docs/PRE_P19_EVIDENCE_EXIT.md`; CI/P12 receipts | `IMPLEMENTATION_PARTIAL / AUTHENTICATED_TARGET_PENDING` | No genuine authenticated WordPress target receipt, native editor/import/render observation or target-managed media proof. Caller metadata and offline parser validation do not grant target authority. |
| P17 Web export/code-to-design | Static export/import safety preflight, neutral Web IR, deterministic IR-to-HTML/CSS package, package validation and controlled local Chrome render | `docs/P17_VISUAL_COMPARISON_CONTRACT_2026-09-29.md`; P17 runtime receipt references in README and memory-bank | `IMPLEMENTATION_PARTIAL / SOURCE_COMPARISON_PENDING` | No genuine source capture bound to the exact IR hash, calibrated geometry/pixel comparison or accepted static Web-to-Figma fixture. Local Chrome is not visual parity; arbitrary JavaScript remains blocked. |
| P18 Framework adapters | Neutral IR foundation, bounded React TypeScript/plain-CSS SDK, deterministic refusal tests, pinned React/Vite build/render receipt and dated framework R0 matrix | `docs/P18_REACT_R0_R1_2026-09-28.md`; `docs/P18_FRAMEWORK_R0_MATRIX_2026-09-29.md`; README P18 row | `REACT_SLICE_RETAINED / BROADER_ADAPTERS_PENDING` | Existing receipt keeps visual comparison and production acceptance open. Next.js/Vue/Svelte/Angular/Astro require separate emitters, pinned fixtures and render receipts. One React slice cannot certify other frameworks or NestJS. |

## Evidence state model

- `IMPLEMENTATION_PARTIAL`: bounded code/contracts exist and repository checks can validate them.
- `TARGET_EXIT_PENDING`: target-specific live/import/render evidence is still absent.
- `AUTHENTICATED_TARGET_PENDING`: an authenticated target and retained receipt are required.
- `SOURCE_COMPARISON_PENDING`: a genuine source capture and calibrated comparison are required.
- `BROADER_ADAPTERS_PENDING`: each framework needs its own implementation and proof.
- `BLOCKED_EXTERNAL_INPUT`: required source bytes, account access or target runtime is unavailable; no synthetic substitute is accepted.

## Exact-head verification rule

For every evidence PR, retain the PR head SHA, workflow conclusions, review-thread result and artifact/receipt references. A successful CI/P12/CodeQL workflow validates repository contracts only. It must not be copied into a target-acceptance field unless the corresponding real target observation is retained.

## Exit decision rule

P15, P16, P17 and P18 can close separately only after a scope-specific internal review confirms the required evidence. P19 remains frozen until all four exits are retained. P12 #84, P13 #159, repository admin #287 and P27 #182 remain independent gates.

## Evidence intake order

1. P15: source image bytes and target-managed media/import receipt.
2. P16: authenticated WordPress/Gutenberg editor/import/render receipt.
3. P17: genuine source screenshot bound to exact IR plus calibrated comparison.
4. P18: first framework-specific fixtures after the retained React slice, each with exact build/render/source-binding receipts.

No item in this register authorizes credentials, external account changes, paid services, production deployment or marketplace submission.
