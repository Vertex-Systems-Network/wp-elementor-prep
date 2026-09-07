# P7 Batch Queue Safety Contract

P7 scales the proven single-frame workflow without changing its correctness model. The batch layer is a scheduler only.

## Canonical execution rule

Every frame must continue to use the existing single-frame lifecycle:

`audit -> classify/plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded checkpoint`

The batch layer must never bypass validation, share mutation candidates between frames, or run two frame transactions concurrently.

## Queue memory contract

`BatchQueueState` stores only compact execution metadata:

- frame id/name
- status
- attempt count
- compact error text
- skip reason
- inter-frame pause reason

It must not retain `AuditNode` trees, exported PNG bytes, candidate Figma nodes, snapshots, or full validation reports between items.

## Versioned skip key

A caller supplies a versioned `runKey`, for example:

`plugin-v7:recipes-v3`

A frame with the same previously recorded key is initialized as `SKIPPED / ALREADY_PROCESSED`. A changed plugin/recipe key makes that frame pending again.

Only **durably finalized `SUCCEEDED`** frames may receive the current run key.

`batch-run-metadata.ts` and `p7-run-metadata-storage.ts` enforce compact, bounded, fail-closed persistence through Figma `clientStorage`.

## Sequential scheduling

At most one item may be `RUNNING`.

A frame failure settles that item as `FAILED`; remaining pending frames stay available. Batch completion may therefore contain a mixture of succeeded, failed and skipped results.

## Canonical P5 result mapping

`p7-p5-outcome.ts` converts the existing `SafeFixRuntimeResult` into scheduler semantics without performing mutation:

- no P5 transaction -> `SKIPPED`
- `COMMITTED` **with commit evidence** -> `CHECKPOINT_PENDING`
- `COMMITTED` without commit evidence -> fail closed as `FAILED`
- Full P3 `REJECTED` -> isolated frame `FAILED` with validator finding detail
- P5 `FAILED` -> isolated frame `FAILED` preserving transaction error/stage

This prevents a committed-but-reversible mutation from being misreported as batch success.

## Commit is not yet success

A P5 candidate can pass Full P3 and commit while one bounded restore/finalize checkpoint remains pending. That committed state is reversible, so P7 must **not** mark it as durable success yet.

The queue distinguishes:

- `RUNNING` — active single-frame transaction
- `AWAITING_CHECKPOINT` — mutation committed, but restore/finalize decision is still pending
- `SUCCEEDED` — checkpoint was explicitly finalized; durable success
- `SKIPPED / RESTORED_CHECKPOINT` — committed change was explicitly restored; not a success and receives no run key

A canonical P7 single-frame processor should feed its `SafeFixRuntimeResult` through `p5SafeFixResultToBatchOutcome()`.

### Resolution rules

`resolveBatchCheckpoint(state, 'FINALIZED')`

- `AWAITING_CHECKPOINT -> SUCCEEDED`
- allows successful run-key persistence
- queue may continue when other safety gates are clear

`resolveBatchCheckpoint(state, 'RESTORED')`

- `AWAITING_CHECKPOINT -> SKIPPED / RESTORED_CHECKPOINT`
- no successful run key is recorded
- avoids incorrectly skipping a restored frame on a later run

`resumeBatchQueue()` cannot bypass `AWAITING_CHECKPOINT`; explicit resolution is mandatory first.

## Real P5 checkpoint action composition

`p7-checkpoint-resolution.ts` composes queue bookkeeping with the existing P5 actions:

- `restoreP7BatchCheckpoint()` calls `restoreLastSafeFix()` first and advances the queue only when restore returns commit evidence
- `finalizeP7BatchCheckpoint()` calls `finalizeLastSafeFix()` first and advances the queue only when finalize returns `true`
- null restore evidence / false finalize results fail closed and leave `AWAITING_CHECKPOINT` unchanged
- no P5 action is called if no batch item owns a checkpoint

This means queue bookkeeping can never claim that a checkpoint was resolved before the actual P5 operation succeeds.

## Defensive P5 checkpoint gate

`p7-checkpoint-gate.ts` queries the existing async `hasPendingSafeFixCheckpoint()` between frame transactions.

`p7-batch-runtime.ts` composes that real P5 checkpoint gate with the sequential runner while keeping the actual single-frame processor injected.

The intended lifecycle is:

`P5 result -> CHECKPOINT_PENDING -> AWAITING_CHECKPOINT/PAUSED -> real FINALIZE or RESTORE succeeds -> queue resolution -> next frame`

The checkpoint gate is read-only; it never auto-restores or auto-finalizes.

## Cancellation

Cancellation is cooperative between frame transactions.

- an in-flight transaction is never interrupted by the batch layer
- pending items become `CANCELLED`
- an `AWAITING_CHECKPOINT` item remains unresolved and keeps the queue paused
- cancellation completes only after that checkpoint is explicitly finalized/restored

This prevents cancellation from becoming an implicit checkpoint action.

## Resume

Resuming ordinary paused/cancelled work clears non-checkpoint pauses, restores cancelled items to pending, and retries failed items by default. Durable successes and version-matched skips are preserved. Unresolved checkpoints cannot be resumed around.

## Current stress and regression evidence

`tests/p7-batch-stress.test.ts` exercises a 60-frame synthetic queue with:

- six version-matched skips
- two isolated synthetic validation failures
- 52 successful frames
- maximum processor concurrency of exactly one
- 100% terminal progress
- compact queue entry shape checks

Additional suites prove:

- pending frames cannot start while a checkpoint pause is active
- async pause checks are awaited
- P7 runtime composition stops on the P5 checkpoint gate
- committed-but-unresolved frames are not counted as succeeded/finished
- unresolved checkpoints cannot receive persisted run keys
- FINALIZED checkpoints become durable success only after P5 finalize succeeds
- RESTORED checkpoints become terminal non-success skips only after P5 restore succeeds
- false/null P5 checkpoint actions leave queue state unchanged
- resume cannot bypass an unresolved checkpoint
- cancellation cannot silently resolve a checkpoint
- canonical P5 committed results map to `CHECKPOINT_PENDING`, not success
- malformed committed results without commit evidence fail closed
- persisted run metadata remains bounded and fail-closed
- Figma storage read failure does not trigger corrupt replacement writes

This is core/runtime-seam evidence only. Real Figma batch memory/cancellation calibration remains required before P7 is production-ready.

## Remaining production gates

1. Implement/inject the canonical single-frame Figma processor using the existing P5 planning/runtime seams; do not duplicate P5 mutation logic.
2. Add UI progress/cancel/pause/resume plus explicit restore/finalize controls backed by the checkpoint-resolution adapter.
3. Invoke run metadata persistence only after durable `SUCCEEDED` transitions.
4. Run realistic 60+ frame calibration in Figma and record peak memory/runtime evidence.
5. Prove cancellation during a long real validation cycle settles safely after the active transaction/checkpoint lifecycle.
6. Keep P7 stacked behind P5 until P5 runtime proof and merge are complete.
