# Project State

Last updated: 2026-09-08

## Product

`wp-elementor-prep` is a deterministic, AI-free Figma plugin that audits and safely prepares approved desktop Figma layouts for structures that map cleanly to WordPress Elementor.

Runtime must not require generative AI or an external AI backend.

## Current phase

**P4 candidate transaction/rollback is merge-ready on `feat/p4-transaction-engine` / PR #13 with final CI green. P3 validator is merged to `main`; issue #4 is closed.**

## Completed

- P0 foundation merged via PR #1.
- P1 Audit-Only MVP merged via PR #10; issue #2 closed.
- P2 deterministic classifier semantics merged via PR #11; issue #3 closed.
- P3 deterministic integrity + rendered pixel validator merged via PR #12; issue #4 closed.
- Five materially different real-template audit/semantic calibration set completed: Marcus, Doctor, Esthetic, Lawyer and Legacy mixed.
- P3 validates root geometry, text-content fingerprints, image-fill fingerprints, section-relative anchors and section-level rendered PNG pixel drift.
- P3 representative no-op render calibration passed on Marcus About, Journey and Contact.
- P4 pure transaction state machine implemented around `clone -> transform candidate -> validate -> commit/swap OR discard`.
- Transformer receives only the candidate handle; the approved original is never passed to candidate transform code.
- Commit is unreachable until P3 validation returns `passed: true`.
- Transform failure, validation crash and validation rejection discard the candidate without committing.
- Cleanup failure and commit-stage failure are surfaced explicitly with auditable transaction events.
- Successful commit returns small serializable evidence; large PNG/node snapshots are not stored in transaction metadata.
- Concrete `FigmaCandidateTransactionAdapter` implemented with off-layout candidate staging, stale-parent/transaction guards, root-boundary replacement, hidden bounded backup and compact clientStorage undo token.
- Auto Layout child properties are restored after root insertion, matching Figma parent-context behavior.
- `restoreLastCommit()` restores the retained original root and removes the committed candidate when the checkpoint is still valid.
- `finalizeLastCommit()` explicitly accepts the latest commit and removes the retained backup checkpoint.
- Only one pending undo checkpoint is allowed; a second commit is rejected until the prior checkpoint is restored or finalized.
- Pure unit fixtures prove forced transform failure and rejected validation leave the approved original unchanged and candidate cleanup occurs.
- Live isolated Figma calibration proved forced candidate failure leaves the original root/index/geometry/content unchanged and removes the candidate.
- Live manual-parent root swap + undo restored the original exactly and left zero temporary nodes.
- Live vertical Auto Layout parent root swap + undo preserved sibling order, `layoutAlign`, `layoutGrow`, `layoutPositioning`, resolved geometry and exact restoration; cleanup left zero temporary nodes.
- Final P4 documentation/checkpoint head `1880f27aa5bd2efb086500f5eed59beb3b32e6a0` passed CI: typecheck, tests and build.

## In progress

- Mark PR #13 ready and merge P4.
- Close issue #5 after merge.
- Start P5 conservative high-confidence Safe Fix recipes.

## Next phases

- P5: conservative high-confidence Safe Fix recipes.
- P6: advanced timeline/carousel/milestone/page normalization recipes.
- P7: batch queue for 60+ frames/pages.
- P8: optional versioned Elementor exporter adapters.

## Calibration references

See:

- `docs/GOLDEN_CALIBRATION.md`
- `docs/CROSS_TEMPLATE_CALIBRATION.md`
- `docs/P3_VALIDATOR_DESIGN.md`
- `docs/P3_PIXEL_CALIBRATION.md`
- `docs/P4_TRANSACTION_DESIGN.md`
- `docs/P4_LIVE_TRANSACTION_CALIBRATION.md`

## Safety status

General Safe Fix recipes remain disabled. P4 mutation infrastructure is candidate-isolated and has only been live-calibrated on disposable synthetic Frames, not on approved customer sections.

## Production mutation gate

Before P5 can mutate an approved section:

- P4 must be merged with green CI,
- a recipe must be high-confidence and explicitly supported,
- transformation must run only on the staged candidate,
- full P3 validation must pass before root swap,
- low-confidence/ambiguous cases must remain REVIEW,
- the bounded undo checkpoint must remain available after commit.

## Release target

Current merged usable line: Audit-Only + P3 read-only validator. Next milestone after P4 merge: P5 conservative Safe Fix recipes behind the P3/P4 gates.
