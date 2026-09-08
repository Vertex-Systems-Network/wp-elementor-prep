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
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering/evidence tooling complete; embedded P5 proof path hardening in progress before real-Figma acceptance (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Last verified functional head | CI |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a59485e` | ✅ #320 |
| P6 | `feat/p6-advanced-structures` | `35a8b01` | ✅ #330 |
| P7 | `feat/p7-batch-queue-core` | `3915774` | ✅ #309 |

README/docs-only synchronization commits may be newer than the functional heads above. The listed head is the latest code/test head whose full install -> typecheck -> test -> build -> Figma bundle-integrity pipeline was explicitly verified.

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth
- ✅ direct-push CI verifies canonical branch development without PR churn
- ✅ canonical P5 proof minting is deterministic and closure evidence is bounded, persisted, reopenable and copyable
- ✅ P6 now embeds the same P5 closure-evidence bundle/storage/viewer contract as canonical P5
- ✅ a single imported P6 build can run `Developer: P5 Runtime Self-Test`, persist/reopen the prerequisite evidence, then continue directly to P6 clone calibration
- ✅ P6 embedded evidence storage is observational; storage failure cannot change proof or transaction outcomes
- ✅ P6 embedded evidence loader rejects malformed nested data, invalid pixel values and accepted-without-proof contradictions
- ✅ P6 positive clone-calibration acceptance viewer reports PASS/FAIL + exact reasons
- ✅ P6 bounded preservation-refusal evidence captures complete `NO_CANDIDATE` decisions without AuditNode trees/PNG/candidate objects
- ✅ P6 refusal acceptance requires explicit preservation-sensitive `PRESERVE` evidence and rejects hidden page-flow `CALIBRATE` candidates
- ✅ P6 dedicated refusal viewer/export reports `Preservation refusal acceptance: PASS/FAIL`
- ✅ P6 developer runtime routes `NO_CANDIDATE` to refusal evidence and `COMPLETED/BLOCKED` to calibration evidence
- ✅ P7 retains qualifying 60+ completed stress and active-frame cancellation evidence in separate bounded slots
- ✅ P7 runtime inspector/viewer reports combined retained runtime Acceptance PASS/FAIL with exact failures
- ⚠️ P7 latest `main.ts` audit found legacy direct `result.passed` P5 proof minting despite earlier tracker wording; deterministic proof-path hardening is now the active priority before P7 runtime acceptance
- ✅ latest verified functional CI green: P5 #320, P6 #330, P7 #309

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

- [ ] first finish/verify the embedded P5 deterministic proof-path hardening now in progress
- [ ] P5 deterministic runtime proof valid in the imported P7 build
- [ ] execute realistic 60+ frame imported-Figma batch run
- [ ] retain completed stress evidence with max processor concurrency `1`
- [ ] request cancellation during a genuinely long active Full P3 operation
- [ ] retain settled active-frame cancellation evidence
- [ ] open the P7 runtime evidence viewer and require overall Acceptance PASS
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
