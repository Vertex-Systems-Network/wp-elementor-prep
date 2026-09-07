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

`batch-run-metadata.ts` provides the compact persistence codec for these successful keys:

- unknown schema versions fail closed to empty metadata,
- malformed entries are ignored,
- only `SUCCEEDED` frames receive the current run key,
- caller-provided previous keys are never overwritten during hydration,
- metadata storage is bounded by pruning the oldest completion records.

The codec is storage-agnostic; the later Figma runtime adapter can persist it through `figma.clientStorage` without coupling clientStorage into the queue core.

## Sequential scheduling

At most one item may be `RUNNING`.

A frame failure settles that item as `FAILED`; remaining pending frames continue. Batch completion may therefore contain a mixture of succeeded, failed and skipped results.

## Bounded-checkpoint compatibility

P5 intentionally retains one bounded restore/finalize checkpoint after a successful Safe Fix and blocks another mutation while that checkpoint is pending.

Therefore P7 must **not** immediately start the next frame after a committed mutation.

The queue now supports a non-destructive `PAUSED` state:

- `shouldPause` is evaluated only between frame transactions,
- a running frame is never interrupted,
- pending frames remain `PENDING`,
- the current successful frame remains `SUCCEEDED`,
- the pause reason explains the unresolved safety gate,
- `resumeBatchQueue` clears the pause only after the caller has resolved the external condition.

The intended P5 integration is:

`frame transaction settles -> checkpoint pending? -> PAUSED -> user/system restore or finalize -> resume -> next frame`

This makes the checkpoint lifecycle explicit instead of silently finalizing or bypassing undo protection.

## Cancellation

Cancellation is cooperative between frame transactions.

- pending items become `CANCELLED`
- the in-flight frame is not interrupted by the batch layer
- the existing single-frame transaction must finish, reject or rollback first
- the queue then settles as `CANCELLED`

This prevents cancellation from leaving a half-mutated Figma candidate.

## Resume

Resuming clears an inter-frame pause, converts cancelled items back to pending, and retries failed items by default. Successful and version-matched skipped items are preserved and are not repeated.

## Current stress evidence

`tests/p7-batch-stress.test.ts` exercises a 60-frame synthetic queue with:

- six version-matched skips
- two isolated synthetic validation failures
- 52 successful frames
- maximum processor concurrency of exactly one
- 100% terminal progress
- compact queue entry shape checks

Additional regression suites prove:

- pending frames cannot start while a checkpoint pause is active,
- a checkpoint appearing during one frame takes effect only after that frame settles,
- resume does not repeat an already successful frame,
- persisted run metadata records successes only and remains bounded.

This is core-state evidence only. Real Figma runtime memory calibration remains required before P7 can be considered production-ready.

## Remaining production gates

1. Wire a Figma adapter to the proven P5 single-frame runtime without duplicating mutation logic.
2. Connect the adapter's pending-checkpoint state to `shouldPause` and require explicit restore/finalize before resume.
3. Add UI progress/cancel/pause/resume controls.
4. Persist the compact run metadata through `figma.clientStorage`.
5. Run realistic 60+ frame calibration in Figma and record peak memory/runtime evidence.
6. Prove cancellation during a long validation cycle settles safely after the active transaction.
7. Keep P7 stacked behind P5 until P5 runtime proof and merge are complete.
