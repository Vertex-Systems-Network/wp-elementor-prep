# P7 Batch Queue Safety Contract

P7 scales the proven single-frame workflow without changing its correctness model. The batch layer is a scheduler only.

## Canonical execution rule

Every frame must continue to use the existing single-frame lifecycle:

`audit -> classify/plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded checkpoint`

The batch layer must never bypass validation, share mutation candidates between frames, or run two frame transactions concurrently.

## Queue memory contract

`BatchQueueState` stores only:

- frame id
- frame name
- status
- attempt count
- compact error text
- version-match skip reason
- one compact inter-frame pause reason

It must not retain `AuditNode` trees, exported PNG bytes, candidate Figma nodes, snapshots, or full validation reports between items. Those remain local to the one in-flight single-frame operation and are released before the next item starts.

## Versioned skip key

A caller supplies a versioned `runKey`, for example:

`plugin-v7:recipes-v3`

A frame with the same previously recorded key is initialized as `SKIPPED / ALREADY_PROCESSED`. A changed plugin/recipe key makes that frame pending again.

`batch-run-metadata.ts` provides the compact persistence codec:

- unknown schema versions fail closed to empty metadata,
- malformed entries are ignored,
- only `SUCCEEDED` frames receive the current run key,
- caller-provided previous keys are never overwritten during hydration,
- metadata storage is bounded by pruning the oldest completion records.

`p7-run-metadata-storage.ts` provides the Figma `clientStorage` adapter. It persists only that compact metadata and never stores scene trees, candidates, PNG bytes or validation reports. Storage read failure fails closed to an empty metadata set.

## Sequential scheduling

At most one item may be `RUNNING`.

A frame failure settles that item as `FAILED`; remaining pending frames continue. Batch completion may therefore contain a mixture of succeeded, failed and skipped results.

## Bounded-checkpoint compatibility

P5 intentionally retains one bounded restore/finalize checkpoint after a successful Safe Fix and blocks another mutation while that checkpoint is pending.

Therefore P7 must **not** immediately start the next frame after a committed mutation.

The queue supports a non-destructive `PAUSED` state:

- `shouldPause` is evaluated only between frame transactions,
- sync and async safety gates are supported,
- a running frame is never interrupted,
- pending frames remain `PENDING`,
- the current successful frame remains `SUCCEEDED`,
- the pause reason explains the unresolved safety gate,
- `resumeBatchQueue` clears the pause only after the external condition is resolved.

`p7-checkpoint-gate.ts` queries the existing async `hasPendingSafeFixCheckpoint()` function and returns a pause reason without auto-restoring or auto-finalizing anything.

`p7-batch-runtime.ts` composes that real P5 checkpoint gate with the sequential runner while keeping the actual single-frame processor injected. This preserves the rule that P7 schedules P5 behavior rather than duplicating it.

The intended lifecycle is:

`frame transaction settles -> checkpoint pending? -> PAUSED -> user/system explicitly restore or finalize -> resume -> next frame`

## Cancellation

Cancellation is cooperative between frame transactions.

- pending items become `CANCELLED`
- the in-flight frame is not interrupted by the batch layer
- the existing single-frame transaction must finish, reject or rollback first
- the queue then settles as `CANCELLED`

This prevents cancellation from leaving a half-mutated Figma candidate.

## Resume

Resuming clears an inter-frame pause, converts cancelled items back to pending, and retries failed items by default. Successful and version-matched skipped items are preserved and are not repeated.

## Current stress and regression evidence

`tests/p7-batch-stress.test.ts` exercises a 60-frame synthetic queue with:

- six version-matched skips
- two isolated synthetic validation failures
- 52 successful frames
- maximum processor concurrency of exactly one
- 100% terminal progress
- compact queue entry shape checks

Additional suites prove:

- pending frames cannot start while a checkpoint pause is active,
- a checkpoint appearing during one frame takes effect only after that frame settles,
- async pause checks are awaited before the next frame,
- the P7 runtime composition stops on the checkpoint gate,
- resume does not repeat an already successful frame,
- persisted run metadata records successes only and remains bounded,
- Figma storage adapter read failure fails closed without writing corrupt replacement data.

This is core/runtime-seam evidence only. Real Figma batch memory calibration remains required before P7 can be considered production-ready.

## Remaining production gates

1. Implement the canonical single-frame Figma processor that the P7 runtime will inject; do not duplicate P5 mutation logic.
2. Add UI progress/cancel/pause/resume controls plus explicit restore/finalize checkpoint controls.
3. Invoke the run metadata storage adapter from the real batch lifecycle after successful items settle.
4. Run realistic 60+ frame calibration in Figma and record peak memory/runtime evidence.
5. Prove cancellation during a long validation cycle settles safely after the active transaction.
6. Keep P7 stacked behind P5 until P5 runtime proof and merge are complete.
