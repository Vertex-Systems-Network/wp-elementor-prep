# Memory Bank

This directory is the canonical continuity layer for this AI-native repository.

An AI agent should be able to enter the repository with no chat history and understand:

- what the product is,
- what has already been done,
- what is being worked on,
- what remains,
- what decisions are locked,
- what to do next.

## Files

- `PROJECT_STATE.md` — current source of truth.
- `ROADMAP.md` — milestone progress and remaining scope.
- `NEXT_ACTIONS.md` — immediate executable queue.
- `DECISIONS.md` — durable decisions and rationale.
- `CHANGELOG.md` — chronological record of meaningful work.

## Rules

1. Read the memory-bank before development.
2. Update it after meaningful work.
3. Never use it to hide unresolved failures; state blockers clearly.
4. Do not mark work complete merely because code was started.
5. Keep next actions concrete enough that another agent can execute them without guessing.
