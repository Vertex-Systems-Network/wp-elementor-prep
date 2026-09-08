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
3. **New development third**
   - only after the issue and PR/MR queues are processed,
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
- Every classifier/score/recipe change must have tests.
- Keep the engine generic. Do not hard-code Marcus Vane node IDs or project-specific copy into product logic.
- Elementor compatibility is evaluated against modern nested container/data structures, not the legacy section/column model.
- Avoid unnecessary custom CSS/JS assumptions in the target Elementor mapping.

## Branching

Use focused branches and PRs. Recommended prefixes:

- `plan/`
- `feat/`
- `fix/`
- `test/`
- `docs/`

## Definition of done

A task is not complete because code exists. It is complete when:

- the Issues-first and PR/MR-second queues were checked,
- tests/verification pass,
- relevant memory-bank state is updated,
- README module and overall progress are updated,
- docs are updated when behavior/contracts changed,
- no known visual safety regression is introduced,
- next work is unambiguous.
