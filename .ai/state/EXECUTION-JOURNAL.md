# AI Execution Journal

This journal records durable AI-native execution-policy milestones only. It is not a CI polling log.

## 2026-09-21 — Delivery-resilient short-turn protocol

- Established issue #637.
- Defined one logical milestone per user-triggered development turn.
- Forbids busy-waiting and sleep/poll loops.
- Limits Runner/check-state inspection to one fetch per turn after a Runner batch starts.
- Requires checkpoint-and-end-turn when required gates are still queued/in-progress.
- Keeps volatile Runner state in GitHub PR/issue/check metadata so checkpoint commits do not invalidate exact-head CI.
- Requires deterministic resume from exact issue/branch/PR/head/run identifiers on the next user `continue`.

## 2026-09-21 — Mandatory AI Engineering Supervisor contract integrated

- Reconciled compact state with exact main, open Issues and open PRs.
- Active path is #637 -> PR #638; PR #636 remains accepted/actionable and must be processed next.
- Added machine-readable claims, coordination queue and Runner Benchmark.
- Added one-refresh timeout budget, state-drift recovery, security fail-closed, migration/data-safety and compact-state size limits.
- Milestone status is VERIFYING before exact-head Runner observation.

