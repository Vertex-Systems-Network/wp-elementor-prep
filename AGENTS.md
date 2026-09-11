# AGENTS.md

This repository is AI-native. Any AI agent or developer working here MUST treat the files in `memory-bank/` as the canonical operational context.

## Mandatory session start

Before making changes, read in this order:

1. `memory-bank/PROJECT_STATE.md`
2. `memory-bank/NEXT_ACTIONS.md`
3. `memory-bank/DECISIONS.md`
4. `memory-bank/ROADMAP.md`
5. Relevant files under `docs/`

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

## Mandatory session end

After meaningful work, update:

- `memory-bank/PROJECT_STATE.md` — what is done, in progress, blocked, and remaining.
- `memory-bank/NEXT_ACTIONS.md` — exact next executable tasks.
- `memory-bank/ROADMAP.md` — when module/phase completion state or sequencing changes.
- `memory-bank/CHANGELOG.md` — concise dated record of changes.
- `memory-bank/DECISIONS.md` — only when a durable architectural/product/process decision changes or is added.
- root `README.md` — current issue/PR status plus module-wise and overall progress.

### README progress contract

Every meaningful completed work batch MUST leave the root README with a current module-wise progress table containing at least:

- module/phase,
- status,
- numeric progress percentage,
- 10-cell visual progress bar where practical,
- blocker or exact next work.

Also update an overall project progress percentage/bar.

Progress must be evidence-based. Do not mark externally blocked runtime acceptance as complete. Mark intentionally deferred work as `DEFERRED` rather than lowering active progress misleadingly.

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

## Definition of done

A task is not complete because code exists. It is complete when:

- the Issues-first and PR/MR-second queues were checked,
- required R0/R1 gates were completed for external target work,
- tests/verification pass,
- relevant memory-bank state is updated,
- README module and overall progress are updated,
- docs are updated when behavior/contracts changed,
- no known visual safety regression is introduced,
- no unsupported option combination is exposed as valid,
- local artifact validation is not misreported as real target verification,
- next work is unambiguous.
