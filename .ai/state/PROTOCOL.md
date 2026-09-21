# Delivery-Resilient AI Execution Protocol

Status: CANONICAL / ACTIVE  
Owner issue: #637  
Established: 2026-09-21

This protocol keeps AI-native repository work resumable while minimizing long-turn/message-delivery risk.

## Machine-readable policy constants

- `MAX_LOGICAL_MILESTONES_PER_TURN = 1`
- `MAX_RUNNER_STATUS_FETCHES_PER_TURN = 1`
- `BUSY_WAITING = FORBIDDEN`
- `SLEEP_POLL_LOOPS = FORBIDDEN`
- `CHECKPOINT_BEFORE_EXTERNAL_WAIT = REQUIRED`
- `RUNNER_PENDING_ACTION = CHECKPOINT_AND_END_TURN`
- `RESUME_TRIGGER = NEXT_USER_CONTINUE`
- `DEFAULT_DEFERABLE_RUNNER_CLASS = PROJECT_FINAL`
- `MERGE_REQUIRED_RUNNERS_MUST_NOT_DEFER = TRUE`
- `REMOTE_RETRY_LOOPS = FORBIDDEN`
- `NEXT_MILESTONE_AFTER_EXTERNAL_WAIT = FORBIDDEN`

## Logical milestone

A logical milestone is one coherent state transition, for example:

- implement + focused verification + open/update PR;
- inspect one already-running Runner batch and record its state;
- fix one failed gate and push the correction;
- merge one fully green PR;
- verify one post-merge control set.

Do not combine implementation, repeated CI polling, merge, post-merge polling and next-task activation into one user turn.

## Non-negotiable AI orders

These are MUST/MUST-NOT rules, not recommendations.

1. MUST stop after one logical milestone.
2. MUST NOT keep a turn open waiting for remote work.
3. MUST NOT use sleep, polling loops, repeated CI/check fetches, or retry-until-green behavior.
4. MUST NOT start the next development milestone after a remote/Runner boundary in the same turn.
5. MUST checkpoint/resume rather than reconstruct state from chat memory.
6. MUST register every Runner-dependent activity in `docs/RUNNER_BENCHMARK.md` when discovered.
7. MUST classify safely deferable Runner work as `PROJECT_FINAL` so it accumulates for the project-final consolidated Runner pass.
8. MUST NOT defer a security-critical, destructive/authority-sensitive, next-step prerequisite, repository-required merge gate, or exact-head release/acceptance gate merely to save Runner usage; those remain `BLOCKING_NOW`, `FINAL_BATCH`, `CONDITIONAL`, or `POST_MERGE` as applicable.
9. MUST fail closed on ambiguous classification: if unsure whether a Runner can safely wait until project end, do not classify it `PROJECT_FINAL`.
10. MUST prefer batched/grouped repository reads/writes over many repetitive remote calls where semantics are identical.
11. MUST end the user turn after a tool/service timeout or unrecoverable remote error once the durable checkpoint is sufficient for deterministic resume; do not enter an unbounded retry loop.

## Runner rule

After a Runner batch starts, fetch/check Runner state at most once in the current user turn. If any required gate is queued or in progress:

1. preserve exact repository/branch/issue/PR/head/run identifiers;
2. use GitHub PR/issue/check metadata as the volatile Runner source of truth;
3. update the durable branch checkpoint only if a durable code/process milestone changed and doing so will not invalidate the candidate head;
4. end the user-facing turn;
5. resume from the exact identifiers on the next user `continue`.

Blocking/security-critical Runner work remains blocking. Blocking does not authorize busy-waiting; it means later implementation must not proceed until a later turn confirms the required result.

Safely deferable Runner work that is not required for the current merge/release-train correctness is `PROJECT_FINAL`: record it immediately, do not execute it during ordinary development turns, and execute the accumulated project-final queue together at the final project acceptance checkpoint. `PROJECT_FINAL` is never a bypass for required exact-head PR/merge/security/release gates.

## Checkpoint-before-wait rule

Before any external dependency that may outlive the current response—CI, CodeQL, target harness, marketplace/account evidence, approval, or another remote dependency—the branch/PR must already contain enough durable information to recover:

- repository;
- owning issue;
- working branch;
- PR number when created;
- exact candidate head SHA;
- completed logical milestone;
- external dependency/run identity when known;
- exact next action;
- blockers/authority boundaries that remain false.

Do not create extra checkpoint commits after an exact-head Runner batch has started merely to record polling state; that would mutate the candidate and restart/obsolete CI. Volatile Runner status belongs to GitHub's PR/check/run metadata.

## Failure/retry rule

A failed Runner is one future logical milestone:

- inspect the failure;
- fix the cause;
- push the affected branch;
- allow the new exact-head batch to start;
- checkpoint and end the turn after at most one status fetch.

Never loop until green inside one user turn.

## Delivery limitation

This repository protocol minimizes workflow-caused delivery risk. It cannot guarantee transport, browser, network, ChatGPT service, or UI delivery outside repository control. No repository policy may claim absolute zero delivery-failure probability.
