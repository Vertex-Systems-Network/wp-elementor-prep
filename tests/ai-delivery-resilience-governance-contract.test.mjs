import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const protocol = readFileSync('.ai/state/PROTOCOL.md', 'utf8');
const currentState = readFileSync('.ai/state/CURRENT-STATE.yaml', 'utf8');
const aiPlan = readFileSync('docs/AI_NATIVE_PLAN.md', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const runnerBenchmark = readFileSync('docs/RUNNER_BENCHMARK.md', 'utf8');

describe('delivery-resilient AI execution governance', () => {
  it('allows time-bounded batch continuation while preserving Runner safety', () => {
    expect(protocol).toContain('MAX_LOGICAL_MILESTONES_PER_EXECUTION_BATCH = TIME_CREDIT_BOUNDED');
    expect(protocol).toContain('EXECUTION_BATCH_TARGET_DURATION = 5_HOURS_OR_WORKSPACE_CREDIT_LIMIT');
    expect(protocol).toContain('ACTIVE_BATCH_CONTINUES_WITHOUT_USER_RECONSENT = TRUE');
    expect(protocol).toContain('SAFE_GREEN_PR_MERGE_WITHIN_SCOPE = PREAUTHORIZED');
    expect(protocol).toContain('MAX_RUNNER_STATUS_FETCHES_PER_MEANINGFUL_BOUNDARY = 1');
    expect(protocol).toContain('BUSY_WAITING = FORBIDDEN');
    expect(protocol).toContain('SLEEP_POLL_LOOPS = FORBIDDEN');
    expect(protocol).toContain('RUNNER_PENDING_ACTION = CONTINUE_INDEPENDENT_SAFE_WORK_OR_RECHECK_AT_MEANINGFUL_BOUNDARY');
    expect(protocol).toContain('DEFAULT_DEFERABLE_RUNNER_CLASS = PROJECT_FINAL');
    expect(protocol).toContain('REMOTE_RETRY_LOOPS = FORBIDDEN');
    expect(protocol).toContain('NEXT_MILESTONE_AFTER_EXTERNAL_WAIT = ALLOWED_WITHIN_ACTIVE_EXECUTION_BATCH');

    expect(currentState).toContain('execution_batch_target_duration:');
    expect(currentState).toContain('active_batch_continues_without_user_reconsent: true');
    expect(currentState).toContain('safe_green_pr_merge_within_scope: preauthorized');
    expect(currentState).toContain('max_runner_status_fetches_per_meaningful_boundary: 1');
    expect(currentState).toContain('busy_waiting_allowed: false');
    expect(currentState).toContain('sleep_poll_loops_allowed: false');
    expect(currentState).toContain('default_deferable_runner_class: project_final');
    expect(currentState).toContain('remote_retry_loops_allowed: false');
    expect(currentState).toContain('next_milestone_after_external_wait_allowed_within_active_batch: true');
  });

  it('wires the protocol into both the canonical AI plan and agent instructions', () => {
    for (const source of [aiPlan, agents]) {
      expect(source).toContain('.ai/state/PROTOCOL.md');
      expect(source).toContain('MAX_LOGICAL_MILESTONES_PER_EXECUTION_BATCH = TIME_CREDIT_BOUNDED');
      expect(source).toContain('MAX_RUNNER_STATUS_FETCHES_PER_MEANINGFUL_BOUNDARY = 1');
      expect(source.toLowerCase()).toContain('busy-wait');
    }
  });

  it('keeps Runner batching compatible with active-batch checkpointing', () => {
    expect(runnerBenchmark).toContain('## Delivery-resilient Runner observation');
    expect(runnerBenchmark).toContain('queued or running Runner does not automatically end the batch');
    expect(runnerBenchmark).toContain('Never use sleep loops, repeated unchanged status fetches or retry-until-green behavior.');
    expect(runnerBenchmark).toContain('BLOCKING_NOW');
    expect(runnerBenchmark).toContain('PROJECT_FINAL');
    expect(runnerBenchmark).toContain('## Project-final Runner queue');
    expect(aiPlan).toContain('final project acceptance checkpoint');
    expect(aiPlan).toContain('Pending CI does not automatically end an active batch');
    expect(agents).toContain('consolidated project-final Runner pass');
  });

  it('keeps volatile Runner state out of status-only exact-head commits', () => {
    expect(protocol).toContain("GitHub's PR/check/run metadata");
    expect(protocol).toContain('Do not create extra checkpoint commits after an exact-head Runner batch has started');
    expect(agents).toContain('Do not create status-only checkpoint commits after exact-head checks start');
  });

  it('does not claim repository control can eliminate platform transport failures', () => {
    expect(protocol).toContain('cannot guarantee transport');
    expect(aiPlan).toContain('must not claim absolute protection');
    expect(agents).toContain('Never claim this protocol can eliminate');
    expect(agents).toContain('strict MUST/MUST-NOT orders');
  });
});
