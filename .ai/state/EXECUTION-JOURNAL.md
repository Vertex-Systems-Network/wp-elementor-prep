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
