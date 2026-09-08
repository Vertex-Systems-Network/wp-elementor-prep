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
| P5 | Conservative high-confidence Safe Fix recipes | 🟡 Engineering complete; imported-Figma runtime acceptance pending (#6) |
| P6 | Advanced structures + clone-only calibration | 🟡 Engineering/evidence tooling complete; real-Figma acceptance pending (#7) |
| P7 | Sequential 60+ frame batch queue | 🟡 Engineering complete; real-Figma stress/cancellation acceptance pending (#8) |
| P8 | Optional Elementor exporter adapters | ⏸ Deferred / issue #9 closed as not planned for current phase |

## Canonical development branches

| Track | Branch | Last verified functional head | CI |
|---|---|---|---|
| P5 | `feat/p5-safe-recipes` | `a3e1f1b` | ✅ #273 |
| P6 | `feat/p6-advanced-structures` | `a9a94f2` | ✅ #284 |
| P7 | `feat/p7-batch-queue-core` | `ecee92f` | ✅ #270 |

README-only synchronization commits may be newer than the functional heads above. The listed head is the latest code/test head whose full install -> typecheck -> test -> build -> Figma bundle-integrity pipeline was explicitly verified.

## Latest development batch — 2026-09-08

- ✅ 0 open PR/MRs; canonical branches remain the direct development source of truth
- ✅ direct-push CI verifies canonical branch development without PR churn
- ✅ P5 deterministic `p5-runtime-proof-v3` acceptance assessor verifies reject/restore/finalize/pixel/cleanup evidence independently
- ✅ P5 proof minting is now gated by that deterministic assessor; top-level `result.passed` alone cannot unlock mutation
- ✅ inconsistent or incomplete P5 evidence revokes local proof and fails closed
- ✅ P6 positive clone-calibration acceptance viewer reports PASS/FAIL + exact reasons
- ✅ P6 bounded preservation-refusal evidence captures complete `NO_CANDIDATE` decisions without AuditNode trees/PNG/candidate objects
- ✅ P6 refusal acceptance requires explicit preservation-sensitive `PRESERVE` evidence and rejects hidden page-flow `CALIBRATE` candidates
- ✅ P6 dedicated refusal viewer/export reports `Preservation refusal acceptance: PASS/FAIL`
- ✅ P6 developer runtime automatically routes `NO_CANDIDATE` to refusal evidence and `COMPLETED/BLOCKED` to calibration evidence
- ✅ P6 embedded P5 self-test uses the same deterministic proof-mint/revoke semantics as canonical P5
- ✅ P7 retains qualifying 60+ completed stress and active-frame cancellation evidence in separate bounded slots
- ✅ P7 runtime inspector/viewer reports combined retained runtime Acceptance PASS/FAIL with exact failures
- ✅ P7 now exports one copyable acceptance bundle containing the assessment + retained stress snapshot + retained cancellation snapshot
- ✅ latest functional CI green: P5 #273, P6 #284, P7 #270

## Remaining real-runtime acceptance

The remaining open issues are intentionally limited to evidence that GitHub CI cannot manufacture because it must run through the **actual imported compiled Figma development plugin and its UI iframe Canvas pixel broker**.

### P5 — issue #6

- [ ] import the canonical development artifact in Figma desktop
- [ ] run `Developer: P5 Runtime Self-Test`
- [ ] require deterministic `p5-runtime-proof-v3` acceptance PASS
- [ ] verify rendered-pixel forced reject, commit -> restore and commit -> finalize paths
- [ ] require checkpoint cleanup and `0` leftovers
- [ ] confirm mutation unlocks only after deterministic acceptance passes

Production Safe Fix mutation stays locked until this proof passes.

### P6 — issue #7

- [ ] P5 deterministic runtime proof valid in the imported build
- [ ] run disposable page-flow clone calibration in real Figma and require positive Acceptance PASS
- [ ] collect image-bearing real-template calibration evidence
- [ ] verify pass/reject/failure cleanup with `0` leftovers
- [ ] run the same developer command on a preservation-sensitive real page that yields `NO_CANDIDATE`
- [ ] require `Preservation refusal acceptance: PASS`
- [ ] export refusal evidence containing the explicit `PRESERVE` plan and preserve-node IDs

P6 production advanced mutation remains intentionally disabled.

### P7 — issue #8

- [ ] P5 deterministic runtime proof valid in the imported build
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
