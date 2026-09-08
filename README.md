# WP Elementor Prep

Deterministic Figma structure auditor and safe-prep engine for WordPress Elementor.

The project prepares approved desktop Figma designs for Elementor **without visually redesigning them** and without depending on external generative AI in the core runtime.

`Figma selection -> Audit -> classify -> plan -> candidate clone -> safe transform -> Full P3 validation -> P4 commit/discard -> restore/finalize -> report`

## Live development status

> **Progress policy:** this README must be updated at the end of every meaningful development batch with the latest verified CI, canonical branch state, blockers and next actions.

**Open PR/MR:** `0`

| Phase | Scope | Current status |
|---|---|---|
| P0 | Specification + architecture | ✅ Complete |
| P1 | Scanner, discovery, scoring | ✅ Complete |
| P2 | Deterministic classification + semantic roles | ✅ Complete |
| P3 | Geometry/content/image/rendered-pixel validator | ✅ Complete |
| P4 | Candidate transaction + rollback/checkpoint | ✅ Complete |
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 Engineering + closure-evidence tooling complete; imported-Figma runtime acceptance pending (#6) |
| P6 | Advanced structures + clone-only calibration | 🟡 Engineering + prerequisite/closure evidence tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering + evidence/provenance/proof hardening complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Last verified functional head | CI |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a59485e` | ✅ #320 |
| P6 | `feat/p6-advanced-structures` | `35a8b01` | ✅ #330 |
| P7 | `feat/p7-batch-queue-core` | `0c4a3dd` | ✅ #371 |

README/docs-only synchronization commits may be newer than the functional heads above. The listed head is the latest code/test head whose full install -> typecheck -> test -> build -> Figma bundle-integrity pipeline was explicitly verified.

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth
- ✅ direct-push CI verifies canonical branch development without PR churn
- ✅ canonical P5 proof minting is deterministic and closure evidence is bounded, persisted, reopenable and copyable
- ✅ P6 embeds the same P5 prerequisite/closure-evidence contract, allowing P5 proof + P6 clone calibration in one imported build
- ✅ P7 retains qualifying 60+ completed stress and active-frame cancellation evidence in separate bounded slots
- ✅ P7 runtime inspector/viewer reports combined retained runtime Acceptance PASS/FAIL with exact failures
- ✅ P7 stress and cancellation scenarios must originate from the same traceable CI-built plugin bundle
- ✅ compiled P7 evidence is stamped with Git source SHA, GitHub Actions run ID and run number; local/legacy/untraceable evidence cannot satisfy runtime acceptance
- ✅ audited P7 `main.ts` stale direct `result.passed -> createP5RuntimeProof()` path was removed
- ✅ embedded P7 P5 self-test now mints/revokes proof only through `updateP5RuntimeProofFromCalibration()` and the deterministic P5 acceptance assessor
- ✅ P7 now embeds bounded P5 prerequisite closure evidence storage/viewer tooling; the same imported P7 build can run P5 self-test, copy/reopen the P5 evidence, then run the batch scenarios
- ✅ P5 evidence persistence remains observational and cannot change proof, transaction or batch outcomes
- ✅ P7 source-contract regression prevents reintroducing direct `createP5RuntimeProof` or top-level `if (result.passed)` proof gating in the plugin entrypoint
- ✅ active-frame cancellation evidence path re-audited: external cancellation is attributed at the post-processor poll and production lifecycle automatically injects/persists the bounded recorder
- ✅ P7 CI #371 passed install, typecheck, all tests, build, compiled-bundle integrity/provenance verification and artifact upload
- ✅ verified P7 artifact: `figma-plugin-dist-371`
- ✅ artifact digest: `sha256:6d245bd01433265c1a0efb123d3181e722edc630d098948efb83d4b5f426f945`
- ✅ latest verified functional CI green: P5 #320, P6 #330, P7 #371

## Remaining real-runtime acceptance

The remaining open issues are intentionally limited to evidence that GitHub CI cannot manufacture because it must run through the **actual imported compiled Figma development plugin and its UI iframe Canvas pixel broker**.

### P5 — issue #6

- [ ] import the canonical development artifact in Figma desktop
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require `P5 Compiled Runtime Acceptance: PASS`
- [ ] verify rendered-pixel forced reject, commit -> restore and commit -> finalize paths
- [ ] require checkpoint cleanup and `0` leftovers
- [ ] copy/reopen the persisted bounded P5 acceptance JSON

Production Safe Fix mutation stays locked until this proof passes.

### P6 — issue #7

- [ ] in the same imported P6 build, run P5 runtime self-test and require persisted P5 Acceptance PASS
- [ ] optionally reopen prerequisite evidence with `Developer: P5 Runtime Evidence`
- [ ] run disposable page-flow clone calibration and require positive Acceptance PASS
- [ ] collect image-bearing real-template calibration evidence
- [ ] verify pass/reject/failure cleanup with `0` leftovers
- [ ] run the same developer command on a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require `Preservation refusal acceptance: PASS`
- [ ] export refusal evidence containing the explicit `PRESERVE` plan and preserve-node IDs

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] import `figma-plugin-dist-371` (or a newer verified canonical P7 artifact) and keep that exact build loaded for both scenarios
- [ ] in that same build run `Developer: P5 Runtime Self-Test` and require `P5 Compiled Runtime Acceptance: PASS`
- [ ] copy/reopen the P5 prerequisite evidence with `Developer: P5 Runtime Evidence`
- [ ] execute realistic 60+ frame imported-Figma batch run
- [ ] retain completed stress evidence with `finalTotalCount >= 60`, all frames terminal and max processor concurrency `1`
- [ ] record actual elapsed/runtime data and truthful memory availability/sample points
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence with a matching recorded processor attempt
- [ ] require both retained scenarios to contain the same traceable source SHA, Actions run ID and run number
- [ ] open `Developer: P7 Runtime Evidence` and require overall Runtime Acceptance PASS
- [ ] copy/export the combined acceptance bundle for closure evidence

## Safety invariants

- Approved original design is the visual source of truth.
- Never mutate on low confidence or ambiguous structure.
- Candidate-only mutation; transformer never receives the approved original.
- Full P3 validation is mandatory before P4 commit.
- Rendered-pixel evidence is part of production validation.
- Only one unresolved restore/finalize checkpoint may exist.
- Batch processing is strictly sequential: max one processor at a time.
- Cancellation is cooperative and cannot silently bypass an in-flight transaction/checkpoint.
- Runtime acceptance evidence must be traceable to the exact CI-built plugin used to collect it.
- Unsupported or ambiguous constructs are reported/refused, never guessed.
- No external AI/network dependency in the deterministic core runtime.

## Current P5 recipe gates

- Vertical Stack >= 90%
- Horizontal Row >= 90%
- Two Column >= 92%
- Facts List >= 92%
- Footer Columns >= 92%
- non-fragmented Repeated Card Grid >= 94%
- Metric Grid >= 95%
- Social/Link Strip >= 95%

Advanced timeline/carousel/fragmented synthesis remains P6-preservation/calibration territory and is not silently enabled as a P5 mutation.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

Import the generated development plugin from `dist/manifest.json` after configuring a valid Figma plugin ID.

Canonical engineering detail also lives in `memory-bank/PROJECT_STATE.md`, `memory-bank/ROADMAP.md`, `memory-bank/NEXT_ACTIONS.md`, and the phase-specific files under `docs/`.

## Golden fixture

The Marcus Vane desktop page is the first broad calibration fixture and includes hero, two-column, cards, metrics, timeline/journey, carousel/media, milestones and footer patterns. It is a fixture only; production logic must remain generic and deterministic.
