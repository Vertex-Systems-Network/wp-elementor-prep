# Last Durable Checkpoint

Status: VERIFYING  
Repository: `Vertex-Systems-Network/wp-elementor-prep`  
Observed main: `ce8d314e9fceae5e5db84ae91a206d9248186da3`  
Active Issue: `#637`  
Active PR: `#638`  
Active branch: `docs/delivery-resilient-ai-flow`

## Milestone

Fixed the two exact-head governance-contract failures without weakening any test or policy:
- restored the legacy `max_runner_status_fetches_per_turn: 1` and related delivery-resilience state keys inside the Supervisor v2 schema;
- restored the exact one-consolidated-refresh invariant wording required by the durable-state regression contract.

## Root cause

The Supervisor v2 state/schema replacement accidentally dropped backward-compatible delivery-resilience keys, and one regression assertion expected the canonical invariant phrase without the new `Use at most ONE` wording.

## Exact next safe action

The new exact-head Runner batch starts automatically from this source change. Do not poll it again in this milestone. On the next user `continue`, perform ONE consolidated exact-head status refresh for PR #638.
