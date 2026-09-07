# P5 Safe Recipe Design

Date: 2026-09-08

## Goal

P5 provides the first conservative candidate-only structural fixes for approved Figma sections after P3 validation and P4 transaction safety are in place.

The invariant is:

`audit -> classify -> plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded restore/finalize`

No P5 recipe mutates the approved original directly.

## Implemented P5 v1 recipe set

| Detection contract | Recipe | Minimum confidence | Candidate mutation | Elementor intent |
|---|---|---:|---|---|
| `vertical-stack` | Vertical Stack | 90% | strict `VERTICAL` Auto Layout | column/flex container |
| `horizontal-row` | Horizontal Row | 90% | strict `HORIZONTAL` Auto Layout | row/flex container |
| `two-column` | Two Column | 92% | strict `HORIZONTAL` Auto Layout | two-child row container |
| `facts-list <- vertical-stack` | Facts List | 92% | strict `VERTICAL` Auto Layout | stacked fact/list container |
| `footer-columns <- horizontal-row` | Footer Columns | 92% | strict `HORIZONTAL` Auto Layout | footer column row |
| `repeated-cards <- grid` | Simple Card Grid | 94% | strict fixed-track `GRID` | repeated-card grid container |
| `metric-grid <- grid` | Metric Grid | 95% | strict fixed-track `GRID` | KPI/stat grid container |
| `social-link-strip <- horizontal-row` | Social/Link Strip | 95% | strict `HORIZONTAL` Auto Layout | compact social/link row |

Below a recipe gate the plan remains `REVIEW`; P5 never falls back to a guessed mutation.

Carousel, timeline and advanced milestone/page-normalization structures remain deferred to P6.

## Structural target mapping

P4 clones receive new descendant node IDs. P5 therefore does not use original descendant IDs to locate candidate targets after cloning.

Before mutation, the planner resolves the classifier target in the audited original tree and stores a child-index path from the section root:

`section root -> child index -> child index -> target`

Because the P4 candidate is an exact clone before transformation, this path maps deterministically to the corresponding candidate target. If the path no longer resolves, mutation is refused.

## Planner decisions

Every detection becomes one of:

- `ELIGIBLE` — supported recipe and all confidence/safety gates pass,
- `REVIEW` — potentially useful but unsafe, ambiguous or below threshold,
- `NOOP` — target already uses the matching Auto Layout/Grid mode,
- `UNSUPPORTED` — pattern is intentionally outside P5 scope.

Explainable reason codes are stored with every plan.

## Hard safety blockers

P5 refuses automatic mutation when:

- confidence is below the recipe threshold,
- target cannot be resolved on the current audited tree,
- a special visual preservation role is on/inside the target,
- visible direct children are absolute-positioned,
- a grid is fragmented,
- grid semantics are ambiguous,
- the pattern is carousel/timeline,
- semantic and geometric classifier contracts do not match the requested recipe,
- another committed Safe Fix still has a pending restore/finalize checkpoint.

Low-confidence or ambiguous cases remain `REVIEW`; there is no fallback guessing behavior.

## Linear transform contract

The linear transformer is shared only by recipes whose classifier contracts match exactly:

- Vertical Stack -> `VERTICAL`,
- Horizontal Row -> `HORIZONTAL`,
- Two Column -> `HORIZONTAL`,
- Facts List only when `facts-list <- vertical-stack` -> `VERTICAL`,
- Footer Columns only when `footer-columns <- horizontal-row` -> `HORIZONTAL`,
- Social/Link Strip only when `social-link-strip <- horizontal-row` -> `HORIZONTAL`.

Before changing a staged candidate Frame, the transformer re-checks stricter live geometry than the classifier:

- at least two visible direct children,
- no visible absolute-positioned direct child,
- layer order already matches visual flow order,
- cross-axis origins aligned within 1 px,
- primary-axis gaps uniform within 1 px,
- no direct-child overlap,
- all direct-child geometry remains inside the target bounds.

Only then does it apply fixed-size Auto Layout using measured padding and gap. It does not reorder layers. After Figma layout conversion, the original root width/height is restored and direct-child geometry must still match within 0.5 px or the transform is refused.

## Grid transform contract

Simple Card Grid and Metric Grid share the strict fixed-grid transformer only when their semantic contract is present and `fragmentedCellCandidate` is false.

The grid analyzer requires:

- a complete rectangular occupancy,
- row-major visual/layer order,
- consistent fixed column widths and row heights,
- uniform column and row gaps,
- in-bounds padding,
- no hidden/absolute direct children that would invalidate layout reconstruction.

The candidate receives explicit Figma `GRID` mode, fixed row/column counts, fixed track sizes, measured gaps/padding and exact original root-size restoration. Direct-child geometry must remain equivalent after conversion.

## Mandatory full-P3 validation

A successful local recipe transform is never sufficient for commit.

Every `ELIGIBLE` production action must run through:

1. P4 clone of the approved original,
2. recipe transform on the staged candidate only,
3. full P3 geometry/content/image validation,
4. rendered PNG export,
5. plugin-UI Canvas pixel decode and diff,
6. P4 commit only when the entire validation report passes,
7. otherwise candidate discard with the approved original untouched.

## Compiled runtime proof gate

Production mutation is version-gated by a local compiled-runtime proof.

`Developer: P5 Runtime Self-Test` (also exposed as the UI `Runtime self-test` action) creates disposable off-canvas fixtures and exercises the actual compiled path:

`SafeRecipePlan -> runSafeFixTransaction -> P4 clone -> candidate transform -> FullFrameValidator -> UI Canvas pixel broker -> P4 reject/commit -> restore`

The proof is stored only when the complete self-test passes. A missing, malformed or stale gate-version proof keeps Safe Fix mutation locked. A failed rerun clears the proof.

This prevents a read-only preview from becoming a production mutation control merely because recipe code exists.

## Production Safe Fix UI contract

The UI always re-audits the currently selected Frame before mutation and never trusts a stale preview plan.

When the compiled runtime proof is valid and no checkpoint is pending:

- each currently `ELIGIBLE` plan may expose an explicit `Apply this Safe Fix` action,
- the selected target/recipe is re-resolved from fresh classifier output,
- full P3 validation remains mandatory,
- `REJECTED`/`FAILED` candidates are discarded safely,
- a `COMMITTED` result creates one bounded restore/finalize checkpoint.

While a checkpoint is pending, all further mutation is locked until the user chooses one of:

- **Restore original** — remove the committed candidate and return the retained approved original to its exact slot,
- **Finalize fix** — explicitly accept the committed candidate and irreversibly remove the retained previous-original backup.

Only one checkpoint can exist at a time.

## Calibration evidence

Implemented recipe primitives have disposable exact-geometry/render evidence. Real image-bearing clone calibration also passed on materially different desktop roots from six template families with:

- exact root geometry,
- exact direct-child geometry,
- preserved image counts,
- byte-identical exported PNGs,
- approved originals unchanged,
- `0` temporary nodes.

See:

- `P5_LINEAR_LIVE_CALIBRATION.md`
- `P5_END_TO_END_TRANSACTION_CALIBRATION.md`
- `P5_SEMANTIC_AND_GRID_LIVE_CALIBRATION.md`
- `P5_METRIC_SOCIAL_LIVE_CALIBRATION.md`
- `P5_REAL_TEMPLATE_IMAGE_CALIBRATION.md`
- `P5_COMPILED_RUNTIME_SELF_TEST.md`

## P5 completion gate

P5 is complete only when:

- all eight v1 recipes remain confidence/semantic/geometry gated,
- every mutation operates on a P4 staged candidate only,
- full P3 validation is mandatory before commit,
- low-confidence/ambiguous cases remain non-mutating,
- the imported compiled plugin runtime self-test passes end-to-end,
- the gated production Safe Fix UI is CI-green,
- restore/finalize behavior remains bounded and explicit,
- final PR review passes and P5 is merged.
