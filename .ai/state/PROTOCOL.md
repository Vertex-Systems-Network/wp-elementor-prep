# Delivery-Resilient AI Execution Protocol

Status: CANONICAL / ACTIVE  
Owner issue: #637  
Established: 2026-09-21

This protocol keeps AI-native repository work resumable while minimizing long-turn/message-delivery risk.

## Machine-readable policy constants

- `MAX_LOGICAL_MILESTONES_PER_EXECUTION_BATCH = TIME_CREDIT_BOUNDED`
- `EXECUTION_BATCH_TARGET_DURATION = 5_HOURS_OR_WORKSPACE_CREDIT_LIMIT`
- `ACTIVE_BATCH_CONTINUES_WITHOUT_USER_RECONSENT = TRUE`
- `ROUTINE_IN_SCOPE_REPOSITORY_MUTATIONS = PREAUTHORIZED`
- `SAFE_GREEN_PR_MERGE_WITHIN_SCOPE = PREAUTHORIZED`
- `NEXT_SAFE_IN_SCOPE_BATCH_AFTER_MERGE = AUTO_CONTINUE`
- `USER_RECONSENT_REQUIRED_FOR_SCOPE_OR_AUTHORITY_EXPANSION_ONLY = TRUE`
- `MAX_RUNNER_STATUS_FETCHES_PER_MEANINGFUL_BOUNDARY = 1`
- `BUSY_WAITING = FORBIDDEN`
- `SLEEP_POLL_LOOPS = FORBIDDEN`
- `CHECKPOINT_BEFORE_EXTERNAL_WAIT_OR_CREDIT_EXHAUSTION = REQUIRED`
- `RUNNER_PENDING_ACTION = CONTINUE_INDEPENDENT_SAFE_WORK_OR_RECHECK_AT_MEANINGFUL_BOUNDARY`
- `RESUME_TRIGGER = ACTIVE_BATCH_OR_DURABLE_RESUME`
- `DEFAULT_DEFERABLE_RUNNER_CLASS = PROJECT_FINAL`
- `MERGE_REQUIRED_RUNNERS_MUST_NOT_DEFER = TRUE`
- `REMOTE_RETRY_LOOPS = FORBIDDEN`
- `NEXT_MILESTONE_AFTER_EXTERNAL_WAIT = ALLOWED_WITHIN_ACTIVE_EXECUTION_BATCH`
- `README_PROGRESS_SYNC = REQUIRED_ON_MATERIAL_REPOSITORY_MUTATION`
- `NEXT_ACTION_OPTIONS_PATH = .ai/state/NEXT-ACTION-OPTIONS.yaml`
- `NEXT_ACTION_OPTIONS_DURING_ACTIVE_BATCH = FALLBACK_RESUME_METADATA_ONLY`
- `FINAL_RESPONSE_NEXT_ACTION_OPTIONS = REQUIRED_AT_BATCH_BOUNDARY`
- `BUTTON_CLICK_GRANTS_AUTHORITY = FALSE`
- `FALLBACK_ACTION_TOKEN_REQUIRED = TRUE`
- `FAST_BATCH_MODE = ACTIVE`
- `DEFAULT_PRODUCT_CAPABILITIES_PER_BATCH = 3_TO_5`
- `MICRO_PR_DEFAULT = FALSE`
- `BATCH_REMOTE_CI = FINAL_BOUND_HEAD_ONLY`
- `BATCH_README_SYNC = FINAL_PRE_CI_HANDOFF_OR_MATERIAL_BLOCKER`
- `USER_UPDATE_CADENCE = BATCH_START_BLOCKER_BATCH_COMPLETE`

## AI Engineering Supervisor mandatory resume order

Repository/runtime evidence always outranks chat memory.

On every start, continue, resume, interrupted session, tool/connector failure, or previous message-delivery timeout:

1. read `.ai/state/CURRENT-STATE.yaml`;
2. read `.ai/state/LAST-CHECKPOINT.md`;
3. resolve exact current main/default SHA;
4. reconcile OPEN Issues first;
5. reconcile OPEN PRs/MRs second;
6. re-read `.ai/state/DETERMINISTIC-CLAIMS.yaml`, `.ai/state/COORDINATION-QUEUE.yaml`, and `.ai/state/RUNNER-BENCHMARK.yaml`;
7. inspect only relevant commits since the recorded anchor when drift is possible;
8. read large historical checkpoints only for a specific fact/conflict/evidence need.

Compact state is only a resume index and NEVER overrides repository/runtime truth. Never repeat work merely because the prior response was not delivered.

## Fast Batch Mode

Fast Batch Mode is the default development cadence inside an active execution batch. A user START/CONTINUE instruction activates one program bounded by up to five hours or available Workspace execution credit/session, whichever ends first. Normal milestone completion is not a stop condition.

- A normal product batch SHOULD contain **3-5 closely related bounded capabilities** that share the same target/source-evidence family and security/authority boundary.
- One batch uses one owning Issue, one branch and one PR/MR. Grouped implementation/test commits inside that PR are allowed.
- Do not create a separate micro-Issue/PR for every small setting or adjacent control by default.
- Remote exact-head CI/status verification SHOULD occur once on the **final bound batch head** after product code, focused tests, README/verifier, durable state and Runner metadata are synchronized.
- Focused static checks and deterministic repository-side validation MAY run while building the batch; they do not require a remote CI cycle per capability.
- Closely related intermediate commits inside the same active batch do not each require a README/state rewrite. Synchronize README, verifier and compact state once at the final pre-CI handoff, unless a material blocker, security/authority boundary, Issue/PR lifecycle state or externally relevant scope changes earlier.
- User-facing progress chatter is minimized: report **batch start**, any **material blocker/failure that changes the plan**, and **batch completion/verification boundary**. Do not emit per-control or per-small-commit status updates unless needed for correctness.
- A micro-PR remains valid when isolation is materially safer or necessary: security fixes, destructive/migration work, unrelated source/evidence families, authority-boundary changes, external/manual prerequisites, or focused repair of a failed merge-blocking gate.
- Security fail-closed rules, required checks, expected-head merge protection, exact-head review, external/manual evidence gates and production/release authority are never weakened by batching.
- A successful merge is followed by exact-main/roadmap reconciliation and the next safe related in-scope batch while execution credit remains.

## Active execution batch, consent and merge authority

One explicit user instruction to start or continue a development batch authorizes routine reversible repository work inside the accepted repository, roadmap and authority boundary until the five-hour / available-credit boundary, completion of the approved program, a genuine external/manual blocker, or a need to expand authority. Do not ask repeatedly for routine consent or stop at an ordinary milestone.

Within that boundary, proceed autonomously through repository reconciliation, Issues, branches, implementation, tests, documentation/state sync, PR creation/update, review and CI repair. A normal green PR may be merged only when its exact current head is known, all required workflows and security checks pass on that head, unresolved review threads are zero, the PR is mergeable, expected-head guard matches, and scope/authority checks pass. Then reconcile the resulting main and continue with the next safe related batch.

Fresh user authority is required only when the next action materially expands scope or risk, including destructive/data migration work, secrets or credentials requiring user input, paid-provider actions, production deployment, marketplace publishing, external account/security changes, manual evidence only the operator can supply, or a materially different project/phase not covered by the active program. Existing production, release, external runtime, and manual-evidence gates remain unchanged.

While checks are pending, preserve PR number, exact branch/head and check identities. Do not repeatedly fetch unchanged state, sleep-poll, or alter a certified candidate to record volatile status. Continue independent safe work; return to the check at the next meaningful boundary. If nothing independent remains, persist a durable checkpoint and wait for the external dependency.

## Credit/session boundary and durable checkpoint

As the five-hour or Workspace-credit/session boundary approaches, stop starting substantial new work, finish the current coherent batch where feasible, and persist a checkpoint with exact main SHA, active Issue/PR/branch/head, completed work, local and remote verification, unresolved threads, blockers, authority state, changed files, and exact next safe action. Resume from that evidence without repeating completed operations. Never interpret a timeout or lost output as proof that an operation failed.

During an active batch, `.ai/state/NEXT-ACTION-OPTIONS.yaml` is fallback/resume metadata; it must not force a user interaction when a safe in-scope action is already authorized. Render selectable actions only at batch completion, credit/session exhaustion, genuine blocker, or a materially different scope/authority decision. An action token or button starts a new request and never grants authority by itself.

## Timeout / remote-call hard budget

- Batch related read-only calls where supported.
- Read only what the active milestone requires.
- Use at most ONE consolidated CI/status refresh per milestone by default.
- The invariant is exactly: one consolidated CI/status refresh per milestone by default.
- Never tight-poll, repeatedly fetch unchanged status, or rerun a workflow because a message timed out.
- Persist VERIFYING or WAITING_EXTERNAL before the final exact-head observation.
- If required CI is still running after the refresh, do not mutate the certified source head merely to record pending state. Record the exact PR/head/check state, continue independent safe work that does not mutate the candidate, and recheck at the next meaningful lifecycle boundary. If no independent safe work remains, checkpoint and wait without busy polling.
- A second refresh in one milestone requires a material security, merge, incident/recovery, or provider state transition and a durable exception record.

## Issues / PRs first hard gate

New development is forbidden while an accepted actionable OPEN Issue or PR/MR is being bypassed. An Issue already represented by an accepted PR is one work path.

Mandatory order: Compact State -> Exact Main -> OPEN Issues -> OPEN PRs/MRs -> Deterministic Claims -> Coordination Queue -> Runner Benchmark -> New Work.

## State drift / timeout recovery

On resume reconcile main SHA, merged/closed Issues and PRs, coordination queue, Runner Benchmark, and relevant commits since the recorded anchor. A merged item must not remain PENDING_MERGE.

After `Message delivery timed out. Please try again.`, verify what persisted before doing anything again. Never redo a merge, deployment, destructive action, migration, provider call, or formal runtime execution solely because the response was not delivered.

## Security fail-closed

Never weaken auth/authz, nonce/CSRF protections, validation/escaping, security checks, correct tests, branch protection or required checks merely to obtain green CI. Never force-push shared history, hard-code/expose secrets, invent results, mark running/skipped/deferred work PASS, reuse expired/consumed grants, or treat `continue` as new authority.

A timeout, connector failure, or missing chat context grants ZERO additional authority.

## Migration / data-safety hard gate

Migration/destructive work must review idempotency, transaction boundaries, apply-success/marker-failure recovery, retry behavior, rollback/restore, destructive recovery, concurrency, partial execution and backup/snapshot requirements. Never assume apply() followed by markApplied() is crash-safe.

## README / progress synchronization control

README module progress is a mandatory repository truth surface, not an optional documentation afterthought.

- Every material batch milestone that changes implementation state, module lifecycle, active blocker, accepted capability, PR/merge lifecycle, or exact next development step MUST update the relevant README progress row/summary before external wait or handoff. Under Fast Batch Mode, closely related intermediate commits inside the same active batch MAY defer README synchronization until the final pre-CI handoff, unless a material blocker, security/authority boundary, or Issue/PR lifecycle truth changes earlier.
- The README update MUST preserve the distinction between implementation progress, exact-head verification, runtime acceptance, external evidence and production authority.
- A stale README progress row is a blocking repository-truth defect and MUST be fixed before exact-head merge certification.
- `scripts/verify-readme-progress.mjs` MUST encode current machine-checkable progress invariants for active modules so implementation can fail CI when README truth drifts.
- Pure Runner-observation turns MUST NOT mutate an already-running exact candidate head merely to record volatile queued/running/check state. In that case, keep volatile Runner state in GitHub metadata and synchronize README on the next material repository mutation or post-merge reconciliation.
- Governance/security-only mutations that materially change an active blocker, enforcement state, or roadmap execution state MUST also update README. Truly internal bookkeeping with no public/module truth change may remain compact-state-only.

## Next-action options / button interaction contract

Every completed or paused logical milestone MUST expose the valid next actions needed to keep development moving.

- The canonical machine-readable surface is `.ai/state/NEXT-ACTION-OPTIONS.yaml`.
- Options MUST be derived from current repository/runtime truth, not chat memory.
- Each option MUST have a stable `action_id`, short `label`, exact `request_payload`, `enabled` state, `recommended` flag, and any `blocked_by` / `blocked_reason`.
- Show 2-4 useful options when possible. Exactly one enabled recommended option should identify the exact next safe action. Visible presentation order MUST be shuffled or rotated at every material milestone and MUST NOT pin the recommended action to a fixed numeric slot; stable `action_id` and `recommended_action_id` carry semantics, not the displayed number.
- When the host/client supports interactive quick actions or buttons, render enabled options as buttons. Clicking a button initiates the stored request payload as a NEW user request.
- A button click NEVER grants new merge, deployment, destructive, security, production, release, or external-service authority. Normal authorization and one-milestone rules still apply.
- Unsafe or sequencing-blocked actions MUST be disabled with a reason or omitted; never make a button a bypass around an active PR, required Runner gate, security blocker, manual evidence gate, or authority boundary.
- When generic interactive buttons are unavailable, render the same labels in the current shuffled `presentation_order` plus copyable action tokens/request payloads as the required fallback. Numbering follows that presentation order only and has no persistent semantic meaning. Do not pretend plain text is clickable.
- Refresh `NEXT-ACTION-OPTIONS.yaml` after every material state transition, PR/Issue lifecycle change, blocker change, or plan update that changes what the user can safely do next.
- `CURRENT-STATE.yaml` MUST identify the current recommended `action_id` and the next-action-options source path.
- A selected action starts the next user turn; it MUST NOT silently chain a second logical milestone into the current turn.

## CI / supply-chain security

Where applicable:
- pin third-party CI actions to immutable revisions;
- disable unnecessary credential persistence;
- use least-privilege workflow permissions;
- avoid dangerous pull_request_target execution without a separately reviewed exception;
- enforce dependency-security gates;
- do not run untrusted lifecycle scripts during security lockfile generation unless explicitly reviewed;
- keep production/distributable dependency audits separate from development-tooling audits when appropriate.

## Terminal post-reconciliation finalization transport

A dedicated state-only finalization PR MAY be used to close a reconciliation lifecycle without creating an infinite reconciliation chain.

This exception is valid only when ALL are true:

- the immediately preceding product/reconciliation PR is already exact-head certified and merged;
- the finalization changes only protocol/state/README/verifier/Runner/journal/memory truth and grants no product/runtime/security/compatibility/production/download/release authority;
- canonical `CURRENT-STATE.yaml` is written as the settled post-merge state with `active_issue: null`, `active_pr: null`, and `milestone_status: IDLE_READY_NEXT_P15_BATCH`;
- the transport Issue/PR is NOT a canonical lifecycle owner and MUST NOT be written into `active_issue` / `active_pr`;
- GitHub Issue/PR metadata is the authority for the transport review/merge lifecycle;
- `observed_main_sha` records the exact main tip immediately before the terminal finalization transport PR. After that transport PR merges, the resulting merge commit does NOT by itself make canonical state stale and MUST NOT trigger another reconciliation PR;
- the next material product/security/governance mutation refreshes `observed_main_sha` to the then-current main tip;
- the transport PR still requires the normal exact-head merge/security gate set and expected-head merge protection.

This exception MUST NOT be used to hide unfinished product work, failed CI, unresolved review threads, missing evidence, active security blockers, or authority gaps. It exists only to terminate state-only reconciliation recursion.

## Final response truth contract

Keep completion messages compact and factual. Report repository, active/completed milestone, Issue/PR/commit evidence when available, CI state, blockers, exact next safe action, and the current next-action options from `.ai/state/NEXT-ACTION-OPTIONS.yaml`.

Never hide unfinished CI, review, state reconciliation, or authorization behind a success statement.

After any merge or material state transition, re-read deterministic claims, coordination queue, and Runner Benchmark before starting the next milestone.

## Compact state limits

- CURRENT-STATE.yaml <= 12 KiB
- LAST-CHECKPOINT.md <= 16 KiB
- EXECUTION-JOURNAL.md <= 32 KiB

The journal is rolling. Large historical checkpoints are not part of every resume.

## Logical milestone

A logical milestone is one coherent state transition. For product development, Fast Batch Mode makes that milestone a bounded batch rather than a single tiny control. Examples:

- implement 3-5 closely related capabilities + focused verification + open/update one PR;
- implement + focused verification + open/update PR when a micro-PR isolation exception applies;
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
12. MUST synchronize README progress before the active batch milestone reaches external wait/final exact-head CI or ends on a material blocker; intermediate commits inside one Fast Batch do not require per-commit README churn.
13. MUST NOT create a README-only commit during a pure Runner observation if doing so would invalidate an exact-head batch; synchronize it on the next material mutation or post-merge reconciliation instead.
14. MUST expose safe next-action options at every milestone boundary and prefer real host-supported buttons/quick actions when available.
15. MUST treat every button/quick-action selection as a new user request, never as implicit authority or permission to bypass blockers.
16. MUST provide a truthful non-clickable fallback action token/payload when the host does not support generic interactive buttons.

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

A failed Runner blocks merge of that exact candidate, but does not automatically end an active execution batch. Inspect the failure and continue other independent safe in-scope work where possible:

- inspect the failure;
- fix the cause;
- push the affected branch;
- allow the new exact-head batch to start;
- checkpoint the exact identifiers and next safe action before any external wait or session/credit boundary.

Never busy-poll or rerun unchanged workflows. A later repair is allowed in the same active batch after the genuine failure is understood.

## Delivery limitation

This repository protocol minimizes workflow-caused delivery risk. It cannot guarantee transport, browser, network, ChatGPT service, or UI delivery outside repository control. No repository policy may claim absolute zero delivery-failure probability.
