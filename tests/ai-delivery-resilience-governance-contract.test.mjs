import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const protocol = readFileSync('.ai/state/PROTOCOL.md', 'utf8');
const currentState = readFileSync('.ai/state/CURRENT-STATE.yaml', 'utf8');
const aiPlan = readFileSync('docs/AI_NATIVE_PLAN.md', 'utf8');
const agents = readFileSync('AGENTS.md', 'utf8');
const runnerBenchmark = readFileSync('docs/RUNNER_BENCHMARK.md', 'utf8');

describe('delivery-resilient AI execution governance', () => {
  it('locks one logical milestone and one Runner observation per user turn', () => {
    expect(protocol).toContain('MAX_LOGICAL_MILESTONES_PER_TURN = 1');
    expect(protocol).toContain('MAX_RUNNER_STATUS_FETCHES_PER_TURN = 1');
    expect(protocol).toContain('BUSY_WAITING = FORBIDDEN');
    expect(protocol).toContain('SLEEP_POLL_LOOPS = FORBIDDEN');
    expect(protocol).toContain('RUNNER_PENDING_ACTION = CHECKPOINT_AND_END_TURN');

    expect(currentState).toContain('max_logical_milestones_per_turn: 1');
    expect(currentState).toContain('max_runner_status_fetches_per_turn: 1');
    expect(currentState).toContain('busy_waiting_allowed: false');
    expect(currentState).toContain('sleep_poll_loops_allowed: false');
  });

  it('wires the protocol into both the canonical AI plan and agent instructions', () => {
    for (const source of [aiPlan, agents]) {
      expect(source).toContain('.ai/state/PROTOCOL.md');
      expect(source).toContain('MAX_LOGICAL_MILESTONES_PER_TURN = 1');
      expect(source).toContain('MAX_RUNNER_STATUS_FETCHES_PER_TURN = 1');
      expect(source.toLowerCase()).toContain('busy-wait');
    }
  });

  it('keeps Runner batching compatible with checkpoint-and-end-turn observation', () => {
    expect(runnerBenchmark).toContain('## Delivery-resilient Runner observation');
    expect(runnerBenchmark).toContain('at most one Runner/check-status fetch');
    expect(runnerBenchmark).toContain('Never use sleep loops or repeated polling');
    expect(runnerBenchmark).toContain('BLOCKING_NOW');
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
  });
});
