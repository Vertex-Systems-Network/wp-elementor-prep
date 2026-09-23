# Scheduled AI Development Plan

This file governs scheduled ChatGPT development runs only. Interactive/chat development continues to use the repository's existing AI-native plan, agent instructions, issues, PRs, roadmap and security contracts. This file supplements them and never weakens them.

## Run bootstrap
On every scheduled run, reconcile exact default-branch HEAD, repository instructions, durable AI state, accepted open Issues, open PRs, reviews, CI/runners and the repository's existing development plan before choosing work. Continue that plan from the last safe checkpoint; never create a parallel product roadmap.

## Google Drive ledger
Use the connected Google Drive app and one dedicated Google Sheet named `wp-elementor-prep — Scheduled AI Development Report`. Locate and reuse it; create it on the first run if absent. Append one row per run containing timestamp, repo, main SHA, milestone, Issue, PR, PR head, CI/runner, security, action, result/blocker and next safe action. Never overwrite prior rows. The Sheet is an audit ledger, not development authority. If Drive is unavailable, preserve the GitHub checkpoint and resume ledger updates later without fabricating data.

## Continuous development
Keep advancing accepted authorized work according to the existing development plan. Continue accepted Issue/PR work before unrelated new work. Pending runners are handoff boundaries, not project completion. Do not busy-wait or repeatedly poll unchanged CI. Inspect and fix failures safely; never bypass required checks, reviews, security, authorization or external-evidence gates. Never fabricate runtime/release/security evidence or use no-op commits as progress.

## Single-writer lease / supersession
Scheduled runs use a durable single-writer lease/checkpoint model. Before mutation, revalidate live GitHub state and prior scheduled work. Record run identity/start, exact base/head, active Issue/PR and next safe action in durable schedule state when supported. If a prior run is stale/safely supersedable, resume from its last durable checkpoint after revalidation. If it may still be mutating and the platform cannot safely terminate it, do not create a competing writer: fail closed, checkpoint the handoff and resume on the next scheduled run. Never assume a new invocation can forcibly kill another process.

## PR and merge safety
Use the repository's existing PR workflow. Before merge verify exact PR head, required checks, review/thread requirements, mergeability and main divergence. Merge only when existing policy and granted authority allow it, then reconcile resulting main.

## End/resume
A bounded run may end for completed iteration, pending runner/external dependency or safe handoff. The scheduled development program remains active and resumes on the next run until documented project completion criteria are genuinely satisfied or the owner cancels it.
