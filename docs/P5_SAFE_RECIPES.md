# P5 Safe Recipe Design

Date: 2026-09-08

## Goal

P5 enables the first conservative candidate-only Auto Layout fixes after P3 validation and P4 transaction safety are in place.

The invariant remains:

`audit -> classify -> plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard`

No P5 recipe may mutate the approved original directly.

## Initial recipe set

Planned P5 recipes:

1. Vertical Stack
2. Horizontal Row
3. Two Column
4. Facts List
5. Footer Columns
6. Simple Card Grid
7. Metric Grid
8. Social/Link Strip

The initial implementation deliberately enables planning before mutation for all recipes. Mutation code is enabled first only for the simplest linear patterns.

## Confidence gates v1

| Detection | Recipe | Minimum confidence | Current mutation status |
|---|---|---:|---|
| `vertical-stack` | Vertical Stack | 90% | candidate transform foundation enabled |
| `horizontal-row` | Horizontal Row | 90% | candidate transform foundation enabled |
| `two-column` | Two Column | 92% | candidate transform foundation enabled |
| `facts-list` semantic | Facts List | 92% | planning only |
| `footer-columns` semantic | Footer Columns | 92% | planning only |
| `repeated-cards` + non-fragmented grid | Simple Card Grid | 94% | planning only |
| ambiguous geometric grid | none | — | REVIEW |
| fragmented grid | none | — | REVIEW |
| carousel/timeline | none | — | deferred to P6 |

Thresholds are intentionally conservative and will be calibrated against live template families before recipe availability expands.

## Structural target mapping

P4 clones receive new descendant node IDs. P5 therefore does not use original descendant IDs to locate candidate targets after cloning.

Before mutation, the planner resolves the classifier target in the audited original tree and stores a child-index path from the section root:

`section root -> child index -> child index -> target`

Because the P4 candidate is an exact clone before the recipe begins, this path maps deterministically to the candidate target. If the path no longer resolves, mutation is refused.

## Planner decisions

Every detection becomes one of:

- `ELIGIBLE` — supported recipe and confidence/safety gates pass,
- `REVIEW` — potentially useful but unsafe or ambiguous for automatic mutation,
- `NOOP` — target already has the matching Auto Layout direction,
- `UNSUPPORTED` — pattern is outside current P5 scope.

Explainable reason codes are stored with each plan.

## Hard safety blockers

The first recipes refuse automatic mutation when:

- confidence is below the recipe threshold,
- target cannot be resolved,
- a special visual preservation role is on/inside the target,
- visible direct children are absolute-positioned,
- a grid is fragmented,
- grid semantics are ambiguous,
- the pattern is carousel/timeline,
- the requested semantic recipe is not implemented.

Low-confidence or ambiguous cases remain REVIEW; there is no fallback guessing behavior.

## Linear Auto Layout transform foundation

Candidate mutation is currently implemented only for:

- Vertical Stack,
- Horizontal Row,
- Two Column (horizontal linear transform).

Before changing a candidate Frame, the transform re-checks stricter live geometry than the classifier:

- at least two visible direct children,
- no visible absolute-positioned child,
- layer order must already match visual flow order,
- cross-axis origins aligned within 1 px,
- primary-axis gaps uniform within 1 px,
- no overlap,
- all child geometry remains inside the target bounds.

Only then does it apply fixed-size Auto Layout using the measured padding and gap. It does not reorder layers.

This local transform result is **not** enough to commit. The entire candidate section must still pass full P3 content/geometry/render validation and then go through P4 commit.

## Why grid/facts/footer mutation is not enabled yet

These recipes may require extra structure, grid track inference or semantic-specific child sizing. Planning is implemented first so confidence and target mapping can be calibrated without prematurely enabling mutation.

## P5 acceptance direction

P5 is complete only when:

- recipe eligibility is confidence-gated,
- every mutation operates on a P4 staged candidate only,
- full P3 validation is mandatory before commit,
- low-confidence cases remain REVIEW,
- each enabled recipe has pure tests + live disposable Figma calibration,
- each enabled recipe has an Elementor mapping documented,
- multi-template success/failure evidence exists before moving to P6.
