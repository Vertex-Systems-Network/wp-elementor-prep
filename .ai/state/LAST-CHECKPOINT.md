# Last Durable Checkpoint

Canonical `main` carries a neutral checkpoint. Active release trains update the checkpoint on their working branch only when a durable code/process milestone changes.

## Resume contract

A working-branch checkpoint must retain:

- repository;
- owning issue;
- branch;
- PR number if one exists;
- exact candidate head SHA if one exists;
- the single logical milestone completed in the turn;
- external dependency/run identity if known;
- exact next action;
- unresolved blockers and authority boundaries.

Runner polling ticks are not durable milestones and must not create checkpoint commits after exact-head checks start. For queued/in-progress Runner state, GitHub PR/check/run metadata is authoritative.

## Neutral main checkpoint

- repository: `Vertex-Systems-Network/wp-elementor-prep`
- active release train: none recorded in canonical main
- next action: inspect Issues first, then open PRs, then resume the highest-priority safe train
