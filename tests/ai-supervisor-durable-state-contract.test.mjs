import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path) => readFileSync(path, 'utf8');
const bytes = (path) => Buffer.byteLength(read(path), 'utf8');

describe('AI Engineering Supervisor durable-state contract', () => {
  it('keeps compact state within hard byte ceilings', () => {
    expect(bytes('.ai/state/CURRENT-STATE.yaml')).toBeLessThanOrEqual(12 * 1024);
    expect(bytes('.ai/state/LAST-CHECKPOINT.md')).toBeLessThanOrEqual(16 * 1024);
    expect(bytes('.ai/state/EXECUTION-JOURNAL.md')).toBeLessThanOrEqual(32 * 1024);
  });

  it('retains mandatory resume fields and timeout controls', () => {
    const state = read('.ai/state/CURRENT-STATE.yaml');
    for (const field of [
      'observed_main_sha:', 'active_issue:', 'active_pr:', 'active_branch:',
      'current_milestone:', 'milestone_status:', 'last_completed_milestone:',
      'exact_next_safe_action:', 'pending_runner_ids:', 'blocked_runner_ids:',
      'current_blockers:', 'timeout_control:'
    ]) expect(state).toContain(field);
    expect(state).toContain('max_consolidated_status_refreshes_per_milestone: 1');
    expect(state).toContain('rerun_on_message_timeout_allowed: false');
  });

  it('enforces repository truth, issues/PRs first, and timeout recovery', () => {
    const protocol = read('.ai/state/PROTOCOL.md');
    expect(protocol).toContain('Repository/runtime evidence always outranks chat memory');
    expect(protocol).toContain('Issues / PRs first hard gate');
    expect(protocol).toContain('Message delivery timed out. Please try again.');
    expect(protocol).toContain('ZERO additional authority');
    expect(protocol).toContain('one consolidated CI/status refresh per milestone');
  });

  it('maintains machine-readable coordination, claims and Runner ledgers', () => {
    const queue = read('.ai/state/COORDINATION-QUEUE.yaml');
    const claims = read('.ai/state/DETERMINISTIC-CLAIMS.yaml');
    const runner = read('.ai/state/RUNNER-BENCHMARK.yaml');

    expect(queue).toContain('CQ-637');
    expect(queue).toContain('CQ-634');
    expect(claims).toContain('repository_runtime_evidence_outranks_chat_memory');

    for (const field of [
      'stable_task_id:', 'source_work:', 'command_or_workflow:', 'exact_source_identity:',
      'environment_identity:', 'matrix_identity:', 'input_identity:', 'fixture_identity:',
      'authorization_state:', 'security_critical:', 'merge_blocking:', 'expected_runner_time:',
      'deterministic_dedup_key:', 'status:', 'immutable_evidence:'
    ]) expect(runner).toContain(field);

    expect(runner).toContain('registration_grants_execution_authority: false');
    expect(runner).toContain('consumed_expired_historical_authorization_reuse_allowed: false');
  });

  it('wires the hard gate into AI plan and AGENTS', () => {
    for (const source of [read('docs/AI_NATIVE_PLAN.md'), read('AGENTS.md')]) {
      expect(source).toContain('AI Engineering Supervisor hard gate');
      expect(source).toContain('.ai/state/CURRENT-STATE.yaml');
      expect(source).toContain('.ai/state/LAST-CHECKPOINT.md');
      expect(source).toContain('.ai/state/RUNNER-BENCHMARK.yaml');
    }
  });

  it('links human Runner policy to machine-readable authority state', () => {
    const human = read('docs/RUNNER_BENCHMARK.md');
    expect(human).toContain('.ai/state/RUNNER-BENCHMARK.yaml');
    expect(human).toContain('Runner registration NEVER grants execution authority');
  });
});
