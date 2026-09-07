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

## Mandatory session end

After meaningful work, update:

- `memory-bank/PROJECT_STATE.md` — what is done, in progress, blocked, and remaining.
- `memory-bank/NEXT_ACTIONS.md` — exact next executable tasks.
- `memory-bank/CHANGELOG.md` — concise dated record of changes.
- `memory-bank/DECISIONS.md` — only when a durable architectural/product decision changes or is added.

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

- tests pass,
- relevant memory-bank state is updated,
- docs are updated when behavior/contracts changed,
- no known visual safety regression is introduced,
- next work is unambiguous.
