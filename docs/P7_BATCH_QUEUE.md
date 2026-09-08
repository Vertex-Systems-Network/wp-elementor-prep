# P7 Batch Queue Safety Contract

P7 scales the proven single-frame workflow without changing its correctness model. The batch layer is a scheduler/orchestrator only.

## Canonical execution rule

Every frame continues to use the existing single-frame lifecycle:

`audit -> classify/plan -> clone candidate -> transform candidate -> full P3 validate -> P4 commit OR discard -> bounded checkpoint`

The batch layer must never bypass validation, share mutation candidates between frames, or run two frame transactions concurrently.

## Queue memory contract

`BatchQueueState` stores only compact execution metadata:

- current live frame id/name
- status
- attempt count
- compact error text
- skip reason
- inter-frame pause reason

It must not retain `AuditNode` trees, exported PNG bytes, candidate Figma nodes, snapshots, or full validation reports between items.

## Live Figma node identity contract

P4 root commits replace the approved original with a cloned candidate, so the committed Frame has a **new Figma node id**. P7 therefore treats `BatchQueueItem.frameId` as the current live Frame identity rather than immutable input identity.

- P5 `COMMITTED` evidence moves the queue item to the candidate `committedNodeId`.
- `FINALIZED` and `FINALIZED_CONTINUE` retain that committed live id.
- P5 restore evidence switches the queue item back to the restored original id.
- run-key metadata is written against the final live id only.

This prevents re-audit/resume from targeting a deleted original and prevents success metadata from being stored under stale ids.

## Versioned skip key

`createBatchRunKey()` is the canonical key builder. It combines:

- plugin version
- Safe Recipe schema version
- batch schema version
- P5 runtime-proof gate version

Any compatibility-sensitive version change produces a different key and forces re-audit instead of trusting stale success metadata.

A frame with the same previously recorded key is initialized as `SKIPPED / ALREADY_PROCESSED`.

Only **durably complete `SUCCEEDED`** frames may receive the current run key.

`batch-run-metadata.ts`, `p7-run-metadata-storage.ts` and `p7-batch-lifecycle.ts` enforce compact, bounded, fail-closed persistence through Figma `clientStorage`.

## Sequential scheduling

At most one item may be `RUNNING`.

A frame failure settles that item as `FAILED`; remaining pending frames stay available. Batch completion may therefore contain a mixture of succeeded, failed and skipped results.

`p7-batch-runner.ts` owns scheduling only. `p7-single-frame-processor.ts` owns the production adapter into the already-existing P5 proof/planner/transaction seams.

## Canonical single-frame processor

`createFigmaP7SingleFrameProcessor()` performs, for each queued live Frame:

1. verify the current P5 compiled runtime proof
2. fail closed if a checkpoint appeared concurrently
3. resolve the current live Frame id
4. freshly scan/classify/plan the Frame
5. choose one eligible target deterministically by document path
6. fail closed when multiple eligible recipes target the same node ambiguously
7. pass that plan to the existing `runSafeFixTransaction()` + Full P3 validator
8. map the existing P5 result into P7 queue semantics

No P5 transform/commit implementation is duplicated in P7.

A freshly audited Frame with no eligible mutation returns `SUCCEEDED`: it has been fully processed for the current compatibility run-key even though no mutation was necessary.

## Canonical P5 result mapping

`p7-p5-outcome.ts` converts the existing `SafeFixRuntimeResult` into scheduler semantics without performing mutation:

- no P5 transaction -> `SKIPPED`
- `COMMITTED` **with commit evidence** -> `CHECKPOINT_PENDING` + current committed Frame id
- `COMMITTED` without commit evidence -> fail closed as `FAILED`
- Full P3 `REJECTED` -> isolated frame `FAILED` with validator finding detail
- P5 `FAILED` -> isolated frame `FAILED` preserving transaction error/stage

This prevents a committed-but-reversible mutation from being misreported as batch success.

## Commit is not yet success

A P5 candidate can pass Full P3 and commit while one bounded restore/finalize checkpoint remains pending. That committed state is reversible, so P7 does **not** mark it as durable success yet.

The queue distinguishes:

- `RUNNING` — active single-frame transaction
- `AWAITING_CHECKPOINT` — mutation committed, but restore/finalize decision is still pending
- `PENDING` — may include a previously finalized frame that must be re-audited for another Safe Fix
- `SUCCEEDED` — frame is fully processed and eligible for durable run-key persistence
- `SKIPPED / RESTORED_CHECKPOINT` — committed change was explicitly restored; not a success and receives no run key

### Resolution rules

`resolveBatchCheckpoint(state, 'FINALIZED')`

- `AWAITING_CHECKPOINT -> SUCCEEDED`
- use only when completion logic/re-audit proves no additional eligible Safe Fix remains
- allows successful run-key persistence

`resolveBatchCheckpoint(state, 'FINALIZED_CONTINUE')`

- `AWAITING_CHECKPOINT -> PENDING`
- retains the committed live Frame id
- the same frame is scheduled again and freshly re-audited
- no run-key persistence yet
- prevents multi-fix frames from being marked complete after only their first safe mutation

`resolveBatchCheckpoint(state, 'RESTORED')`

- `AWAITING_CHECKPOINT -> SKIPPED / RESTORED_CHECKPOINT`
- switches identity to the restored original id from real P5 restore evidence
- no successful run key is recorded

`resumeBatchQueue()` cannot bypass `AWAITING_CHECKPOINT`; explicit resolution is mandatory first.

## Re-audit before irreversible finalize

`finalizeP7BatchCheckpointAfterReaudit()` re-audits the current committed Frame **read-only while the P5 checkpoint still exists**.

- more eligible work -> call real P5 finalize -> `FINALIZED_CONTINUE`
- no more eligible work -> call real P5 finalize -> `FINALIZED`
- re-audit error -> do not call finalize; checkpoint remains restorable
- false P5 finalize -> queue bookkeeping is not advanced

This ordering avoids irreversibly deleting the backup before P7 knows whether the frame is complete.

## Real P5 checkpoint action composition

`p7-checkpoint-resolution.ts` composes queue bookkeeping with the existing P5 actions:

- restore calls `restoreLastSafeFix()` first and requires commit evidence
- finalize calls `finalizeLastSafeFix()` first and requires `true`
- null restore evidence / false finalize results fail closed and leave `AWAITING_CHECKPOINT` unchanged
- no P5 action is called if no batch item owns a checkpoint

Queue bookkeeping therefore cannot claim that a checkpoint was resolved before the actual P5 operation succeeds.

## Defensive P5 checkpoint gate

`p7-checkpoint-gate.ts` queries the existing async `hasPendingSafeFixCheckpoint()` between frame transactions.

`p7-batch-runtime.ts` composes that real P5 checkpoint gate with the sequential runner. `runFigmaP7BatchRuntime()` injects the canonical P5-backed processor.

The intended lifecycle is:

`P5 result -> CHECKPOINT_PENDING -> AWAITING_CHECKPOINT/PAUSED -> read-only re-audit -> real FINALIZE or RESTORE -> same-frame retry or next frame`

The checkpoint gate is read-only; it never auto-restores or auto-finalizes.

## Persistence lifecycle

`p7-batch-lifecycle.ts` now owns the production persistence boundary:

- hydrates selected Frame inputs from prior compact finalized metadata
- creates a compatibility-sensitive run key
- runs the real Figma P7 runtime
- persists only items that have reached durable `SUCCEEDED`
- never persists `AWAITING_CHECKPOINT`, `FAILED`, `CANCELLED`, or restored items

## Plugin UI/runtime controls

`main.ts` and `ui.html` now expose bounded multi-Frame operation:

- start from one or more selected Frames
- progress percentage and per-frame status
- cooperative cancel that waits for the active transaction to settle
- retry/resume for failed/cancelled work
- checkpoint restore
- checkpoint finalize + read-only completion re-audit + automatic queue continuation
- error/status messages without retaining heavy audit/render objects in queue state

Manual P5 and P7 mutation operations share an exclusive-operation guard so they are not launched concurrently.

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
- current live Frame ids follow P4 commit/restore swaps
- committed-but-unresolved frames are not counted as succeeded/finished
- unresolved checkpoints cannot receive persisted run keys
- finalized-but-incomplete frames return to PENDING for re-audit
- re-audit happens before irreversible finalize and failure leaves checkpoint intact
- FINALIZED checkpoints become durable success only after P5 finalize succeeds
- RESTORED checkpoints become terminal non-success skips only after P5 restore succeeds
- false/null P5 checkpoint actions leave queue state unchanged
- resume cannot bypass an unresolved checkpoint
- cancellation cannot silently resolve a checkpoint
- canonical P5 committed results map to `CHECKPOINT_PENDING`, not success
- malformed committed results without commit evidence fail closed
- deterministic single-frame processor selection and ambiguity refusal
- persisted run metadata remains bounded and fail-closed
- Figma storage read failure does not trigger corrupt replacement writes
- canonical run keys invalidate on plugin/schema/runtime-proof version changes
- lifecycle persistence writes only durable successes

## Remaining production gates

The code-level P7 lifecycle is now wired. Remaining gates require real imported-Figma runtime evidence rather than more synthetic core wiring:

1. Run realistic 60+ frame calibration in Figma and record peak memory/runtime evidence.
2. Prove cancellation during a long real Full P3 validation settles safely after the active transaction/checkpoint lifecycle.
3. Re-run the P5 imported-plugin runtime proof/smoke gates that P7 depends on.
4. Keep P7 stacked behind P5 until P5 runtime proof and PR #14 merge are complete; then retarget and final-review PR #16.
