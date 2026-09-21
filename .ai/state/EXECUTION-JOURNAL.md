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

## 2026-09-21 — Governance backward-compatibility fix

- Inspected only the two failed exact-head jobs from PR #638.
- Both failures came from governance regression-contract drift, not product/runtime/security behavior.
- Restored legacy delivery-resilience state keys inside Supervisor schema v2.
- Added the exact one-consolidated-refresh invariant phrase without weakening either test.
- New exact-head state is VERIFYING; no CI polling occurs in this fix milestone.

## 2026-09-21 — #638 post-merge reconciliation and #636 main sync

- Reconciled exact main `14cdcd57fa21a8bed73de35cdfa336923c0e787f`; #637/#638 are terminal merged/closed.
- Observed post-merge PR-origin audit PASS and CodeQL PASS in the single consolidated refresh.
- Promoted #634 / PR #636 to the active accepted path.
- Merge-synced current governance main into PR #636 without force-push while preserving Node 22/toolchain/security evidence.
- New PR #636 exact head is VERIFYING; no new-head CI polling occurs in this milestone.

