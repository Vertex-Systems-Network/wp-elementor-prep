# AGENTS.md

This repository is AI-native. Any AI agent or developer working here MUST treat the files in `memory-bank/` as the canonical operational context.

## Mandatory session start

Before making changes, read in this order:

1. `.ai/state/PROTOCOL.md`
2. `.ai/state/CURRENT-STATE.yaml`
3. `.ai/state/LAST-CHECKPOINT.md`
4. `memory-bank/PROJECT_STATE.md`
5. `memory-bank/NEXT_ACTIONS.md`
6. `memory-bank/DECISIONS.md`
7. `memory-bank/ROADMAP.md`
8. `docs/RUNNER_BENCHMARK.md`
9. Relevant files under `docs/`

Do not assume chat history is available or current.

### Mandatory work-order gate

After reading repository context and **before starting new implementation**, execute this order:

1. **Issues first**
   - list every open issue,
   - classify actionable vs dependency-blocked vs external/runtime-blocked vs deferred,
   - fix actionable issues before unrelated new work,
   - run required verification,
   - update/close only when the real acceptance criteria are satisfied.
2. **PR/MR second**
   - list every open Pull Request / Merge Request,
   - inspect CI/checks, conflicts, mergeability and unresolved review feedback,
   - fix safely actionable failures/conflicts,
   - merge only when documented gates pass,
   - do not duplicate work already owned by an issue or PR/MR.
3. **R0 research gate when external targets are involved**
   - refresh official platform documentation,
   - refresh competitor/market signals,
   - verify target format/API stability,
   - record privacy/network/licensing constraints,
   - update acceptance criteria if the external platform changed.
4. **R1 reliability/compatibility gate for target adapters**
   - freeze immutable versioned `TargetProfile`,
   - freeze machine-readable capability descriptor,
   - define option dependency/reset rules,
   - define source staleness/run identity rules,
   - define state machine, structured errors and retry/cancel behavior,
   - define atomic generation/download contract,
   - define schema/package/reference/assets validators,
   - define real import/build/render/round-trip acceptance harness where applicable.
5. **New development third**
   - only after issues, PR/MRs and required R0/R1 gates are processed,
   - follow roadmap/dependency order,
   - use independent parallel workstreams where safe.

Never fabricate runtime/manual evidence or bypass an acceptance gate simply to close an issue or merge a branch.

## Fast release-train execution

Use release trains to reduce coordination overhead without weakening correctness or acceptance evidence.

- A release train is one focused issue/branch/PR with one acceptance objective and one explicit authority boundary.
- Multiple small implementation commits may remain in the same release train when they are tightly related, independently testable and do not broaden the accepted authority boundary.
- Do not create a separate docs-only PR after every micro-commit. Synchronize canonical status/docs once in the same accepted release train when practical, or once immediately after a grouped implementation train when the status surface genuinely changed.
- Update status/authority documentation immediately when a change actually changes phase status, authority, target support, runtime requirements or architectural sequencing.
- During development, prefer focused typecheck/tests/builds for rapid feedback. At the integration/merge checkpoint, the exact PR head must still pass the full documented CI/release/offline gates required by the repository.
- Never skip, weaken or reinterpret exact-head acceptance merely to shorten the development cycle.
- Parallel work is encouraged only when file ownership is clear. Avoid assigning multiple agents to the same integration hotspot (for example `src/plugin/main.ts` or `src/ui/ui.html`) at the same time unless one agent is explicitly responsible for integration.
- Keep target-specific work inside its adapter/module as long as possible; touch shared plugin/UI integration surfaces only at the bounded integration step.
- Prefer one coherent commercial slice that can be verified end-to-end over several partially wired roadmap phases.

### Runner Benchmark / deferred Runner batching

- `docs/RUNNER_BENCHMARK.md` is the canonical ledger for every GitHub Actions, CI matrix, hosted/self-hosted Runner, target-harness or equivalent Runner-dependent task.
- Add a benchmark row immediately when a Runner task is discovered; do not rely on chat memory or remember it only at phase end.
- Record phase/issue, trigger, workflow/runner, dependencies, expected evidence, execution class and status.
- Default safely deferable tasks that are not required for current merge/release correctness to `PROJECT_FINAL` and accumulate them for one consolidated project-final Runner pass. Use `FINAL_BATCH` only for exact-head gates required before the active PR/release train may merge.
- Use `BLOCKING_NOW` and execute immediately when the Runner result is security-critical, required to continue safely, destructive/migration/authority-sensitive, release-blocking for the active objective, or required by repository merge rules.
- Keep post-merge-only checks as `POST_MERGE`. Live/manual external evidence remains owned by its phase/issue and must never be manufactured as Runner evidence.
- At each merge/release checkpoint, execute the required current-train `FINAL_BATCH`/`CONDITIONAL` items against the exact candidate head. At final project acceptance, execute the accumulated `PROJECT_FINAL` queue together.
- On failure, fix the cause, rerun affected Runner tasks, then rerun every exact-head gate required for merge/release.
- Batching reduces repeated Runner usage; it never permits skipping, weakening or fabricating required acceptance evidence.

## AI Engineering Supervisor hard gate

Repository/runtime evidence always outranks chat memory.

On every start, continue, resume, interruption, tool/connector failure, or prior message-delivery timeout, reconcile in this exact order:

1. `.ai/state/CURRENT-STATE.yaml`
2. `.ai/state/LAST-CHECKPOINT.md`
3. exact current main/default SHA
4. OPEN Issues
5. OPEN PRs/MRs
6. `.ai/state/DETERMINISTIC-CLAIMS.yaml`
7. `.ai/state/COORDINATION-QUEUE.yaml`
8. `.ai/state/RUNNER-BENCHMARK.yaml`
9. only then the active milestone

Do not repeat work because a response was not delivered. Do not use chat memory to override repository evidence. Do not start new development while an accepted actionable open Issue/PR path is being bypassed.

Before reporting COMPLETE/BLOCKED/VERIFYING/WAITING_EXTERNAL, durable state must already contain observed main SHA, active Issue/PR/branch, milestone/status, last completed milestone, exact next safe action, pending/blocked Runner IDs, blockers, and timeout-control settings.

Compact limits are mandatory: CURRENT-STATE <=12 KiB; LAST-CHECKPOINT <=16 KiB; EXECUTION-JOURNAL <=32 KiB.

## Delivery-resilient turn budget

Follow `.ai/state/PROTOCOL.md` on every development turn.

- `MAX_LOGICAL_MILESTONES_PER_TURN = 1`.
- `MAX_RUNNER_STATUS_FETCHES_PER_TURN = 1` after a Runner batch has started.
- Busy-waiting, repeated status polling and sleep/poll loops are forbidden.
- When required checks are queued/in-progress on the one allowed status inspection, preserve exact issue/branch/PR/head/run identifiers and end the response. Resume only on the next user `continue`.
- Never keep a user turn open merely to wait for CI, CodeQL, browser/target proof or another remote dependency.
- Do not create status-only checkpoint commits after exact-head checks start. GitHub PR/check/run metadata is the volatile source of truth.
- Before an external wait boundary, ensure the durable branch milestone and exact next action are recoverable from `.ai/state/*` plus the owning issue/PR.
- A blocking/security-critical Runner result blocks later implementation across turns; it does not permit polling until completion in one turn.
- Do not combine implementation, Runner waiting, merge, post-merge verification and next-task activation in one turn.
- Never claim this protocol can eliminate transport/UI/service failures outside repository control.
- These are strict MUST/MUST-NOT orders. Do not reinterpret them as suggestions to improve throughput.
- Never use retry-until-green behavior or a second remote wait cycle in the same user turn.
- Never start another development task after a Runner/external dependency boundary in the same turn.
- Every discovered Runner activity must be classified immediately; safely deferable work goes to `PROJECT_FINAL`, while merge/security/acceptance-critical work must remain in its stricter class.
- If classification is uncertain, fail closed: do not defer it to `PROJECT_FINAL`.

## Mandatory session end

After meaningful work, update only the canonical files whose truth materially changed:

- `memory-bank/PROJECT_STATE.md` — when done/in-progress/blocked/remaining project truth changes.
- `memory-bank/NEXT_ACTIONS.md` — when the executable queue changes.
- `memory-bank/ROADMAP.md` — when module/phase state, progress interpretation or sequencing changes.
- `memory-bank/CHANGELOG.md` — concise dated record for an accepted meaningful release train, not every intermediate commit.
- `memory-bank/DECISIONS.md` — only when a durable architectural/product/process decision changes or is added.
- `docs/RUNNER_BENCHMARK.md` — whenever a Runner task is discovered, reclassified, executed, failed, rerun or completed.
- root `README.md` — when user-facing module status/progress/blockers or product-surface truth changes.

Documentation sync is part of completion, but it must not create reflexive PR churn. Intermediate commits inside one release train do not each require a full canonical-doc rewrite when the externally visible truth has not changed yet.

### README progress contract

Every accepted work batch that changes module status/progress MUST leave the root README with a current module-wise progress table containing at least:

- module/phase,
- status,
- evidence-based progress percentage only where a stable denominator exists; otherwise `N/A`,
- 10-cell visual progress bar for percentage-backed rows or the non-denominated bar for `N/A`,
- blocker or exact next work.

Do **not** collapse the whole project into one synthetic overall percentage. Implementation, runtime acceptance and external review are separate evidence states. Progress must remain evidence-based; do not mark externally blocked runtime acceptance as complete. Mark intentionally deferred work as `DEFERRED` rather than lowering active progress misleadingly.

## Engineering rules

- Never enable a destructive Figma transformation before a read-only audit and validation path exists for the same pattern.
- Core functionality must remain AI-free and network-free unless a future optional module explicitly says otherwise.
- Prefer deterministic geometry/layout rules over heuristics that cannot be explained.
- Low-confidence detection must result in `REVIEW`, not mutation.
- Original visual design is authoritative. Structural cleanup must adapt to the design, not redesign it.
- New fixes must be transaction-safe: candidate -> validate -> commit or rollback.
- Every classifier/score/recipe/adapter/estimator change must have tests.
- Keep the engine generic. Do not hard-code customer-specific node IDs or project copy into product logic.
- Target adapters must be versioned and declare support limits.
- Target UI must be capability-driven; stale incompatible option values must be cleared/invalidated when target/profile changes.
- A locally valid artifact is not the same as a real import/render proof. Use precise readiness labels.
- Target generation must be atomic: incomplete/failed/cancelled artifacts are never exposed as ready downloads.
- Do not silently fall back to screenshots, custom HTML/JS or alternative widgets/blocks when native mapping fails.
- Elementor compatibility must distinguish v3 Container-oriented and v4 Atomic-oriented structures rather than assuming one universal schema.
- Unsupported Elementor Pro/third-party widgets are explicit REVIEW/UNSUPPORTED unless a dedicated tested adapter exists.
- Gutenberg outputs require parse/serialize/editor validity checks for supported target versions.
- Framework output must use pinned adapter dependency matrices; accepted artifacts must not depend on unbounded `latest` versions.
- Code-to-design arbitrary JavaScript execution is disabled by default until a separate sandbox specification is accepted.
- Figma image export must distinguish Stored Original bytes from Rendered Appearance.
- Current Community core remains `allowedDomains: ["none"]`; arbitrary direct customer-domain push is not part of the core contract.

## Branching

Use focused branches and PRs. Recommended prefixes:

- `plan/`
- `audit/`
- `feat/`
- `fix/`
- `test/`
- `docs/`

A focused PR may contain multiple tightly related commits in one release train. Avoid splitting implementation, tests, UI contract and immediately required status sync into separate PRs solely for process ceremony.

## Definition of done

A task/release train is not complete because code exists. It is complete when:

- the Issues-first and PR/MR-second queues were checked,
- required R0/R1 gates were completed for external target work,
- focused development verification passed during implementation,
- every discovered Runner-dependent task is recorded in `docs/RUNNER_BENCHMARK.md`,
- no required `BLOCKING_NOW` Runner item remains unresolved,
- the required consolidated `FINAL_BATCH` Runner entries passed on the exact integration/PR head,
- the exact integration/PR head passed the full required merge/release gates,
- relevant canonical memory/status files are synchronized once the truth changes,
- README module progress is updated when its user-facing status/progress/blocker truth changed,
- docs are updated when behavior/contracts changed,
- no known visual safety regression is introduced,
- no unsupported option combination is exposed as valid,
- local artifact validation is not misreported as real target verification,
- next work is unambiguous.
