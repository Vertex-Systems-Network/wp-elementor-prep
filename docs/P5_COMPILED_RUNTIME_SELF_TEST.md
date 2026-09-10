# P5 compiled runtime self-test

The P5 branch contains a developer-only disposable self-test that exercises the actual compiled runtime chain instead of a direct Figma-script approximation.

## Exact path under test

`SafeRecipePlan -> runSafeFixTransaction -> P4 candidate clone -> candidate-only transform -> FullFrameValidator -> plugin UI Canvas pixel decode/diff -> P4 commit/discard -> restore/finalize -> deterministic acceptance assessor -> proof gate -> bounded evidence`

## Safety properties

- The self-test never uses the user's selected design.
- It creates synthetic fixtures off-canvas under the `__P5RuntimeCalibration__` prefix.
- It refuses to start while a real P4 undo checkpoint is pending.
- Forced rejection intentionally introduces visible spacing drift after a valid recipe so rejection depends on returned rendered-pixel evidence.
- Passing calibration must commit only after Full P3 passes.
- One passing path restores the retained original and clears the checkpoint.
- A second passing path finalizes the committed candidate, discards the retained previous original and clears the checkpoint.
- Synthetic parents/candidates are removed before the self-test returns.
- Production proof is minted only when the deterministic P5 acceptance assessor independently verifies every required invariant.
- Bounded evidence persistence is observational only; an evidence-storage failure cannot change proof or transaction outcomes.

## Running it

Build/import the canonical development plugin and invoke:

`Plugins -> WP Builders Prepear -> Developer: P5 Runtime Self-Test`

The plugin UI must remain available while validation runs because `FullFrameValidator` delegates PNG decoding and pixel comparison to the UI Canvas broker.

After the run completes, the plugin opens **P5 Compiled Runtime Acceptance** with:

- overall Acceptance `PASS` / `FAIL`,
- runtime proof timestamp when proof was actually minted,
- forced-reject rendered-pixel percentage,
- restore Full P3/pixel/checkpoint evidence,
- finalize Full P3/pixel/checkpoint evidence,
- leftover count,
- exact deterministic failure reasons,
- **Copy bounded acceptance JSON** for closure evidence.

The latest valid evidence is also persisted in client storage and can be reopened later without rerunning the self-test:

`Plugins -> WP Builders Prepear -> Developer: P5 Runtime Evidence`

Missing or structurally corrupt stored evidence is refused rather than guessed.

## Pass conditions

Forced-rejection path:

- transaction state is `REJECTED`,
- validation is rejected,
- real rendered-pixel metrics are present and valid,
- candidate is deleted,
- original remains untouched.

Pass/restore path:

- transaction state is `COMMITTED`,
- Full P3 validation passes,
- rendered-pixel metrics are present and valid,
- candidate commits through P4,
- retained approved original restores successfully,
- pending undo checkpoint is cleared.

Pass/finalize path:

- transaction state is `COMMITTED`,
- Full P3 validation passes,
- rendered-pixel metrics are present and valid,
- committed candidate remains live,
- retained previous original is discarded,
- finalize succeeds,
- pending undo checkpoint is cleared.

Final cleanup must report zero `__P5RuntimeCalibration__` temporary nodes.

The runtime acceptance viewer must report `PASS`, and the copied bounded JSON must contain a non-null runtime proof timestamp. If deterministic acceptance fails, any local proof is revoked and production Safe Fix remains locked.

This self-test is a developer calibration command only. It does not broaden P5 recipe eligibility or bypass P3/P4 safety gates.
