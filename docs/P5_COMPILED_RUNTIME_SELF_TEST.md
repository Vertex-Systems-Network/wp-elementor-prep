# P5 compiled runtime self-test

The P5 branch now contains a developer-only disposable self-test that exercises the actual compiled runtime chain instead of a direct Figma-script approximation.

## Exact path under test

`SafeRecipePlan -> runSafeFixTransaction -> P4 candidate clone -> candidate-only transform -> FullFrameValidator -> plugin UI Canvas pixel decode/diff -> P4 commit/discard -> bounded restore`

## Safety properties

- The self-test never uses the user's selected design.
- It creates synthetic fixtures off-canvas under the `__P5RuntimeCalibration__` prefix.
- It refuses to start while a real P4 undo checkpoint is pending.
- Forced rejection intentionally introduces visible spacing drift after a valid recipe so rejection depends on returned rendered-pixel evidence.
- Passing calibration must commit only after full P3 passes, then restore the retained original and clear the checkpoint.
- Synthetic parents/candidates are removed before the self-test returns.

## Running it

Build/import the development plugin and invoke:

`Plugins -> Pella Elementor Prep -> Developer: P5 Runtime Self-Test`

The plugin UI must remain open because `FullFrameValidator` delegates PNG decoding and pixel comparison to the UI Canvas broker.

## Pass conditions

Forced-rejection path:

- transaction state is `REJECTED`,
- validation report is failed,
- pixel metrics are present,
- candidate is deleted,
- original remains in its approved parent/slot.

Pass/restore path:

- transaction state is `COMMITTED`,
- validation report passes,
- pixel metrics are present,
- candidate commits through P4,
- original restores successfully,
- pending undo checkpoint is cleared.

Final cleanup must report zero `__P5RuntimeCalibration__` top-level fixture nodes.

This self-test is a developer calibration command only. It does not expose general production Safe Fix mutation.
