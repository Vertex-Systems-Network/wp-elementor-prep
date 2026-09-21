import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function read(path) {
  return readFileSync(path, 'utf8');
}

describe('runner benchmark governance contract', () => {
  it('keeps the Runner benchmark wired into AI-native planning and agent instructions', () => {
    const aiPlan = read('docs/AI_NATIVE_PLAN.md');
    const agents = read('AGENTS.md');

    for (const source of [aiPlan, agents]) {
      expect(source).toContain('docs/RUNNER_BENCHMARK.md');
      expect(source).toContain('FINAL_BATCH');
      expect(source).toContain('BLOCKING_NOW');
    }
  });

  it('keeps a canonical queue with standing exact-head Runner gates', () => {
    const benchmark = read('docs/RUNNER_BENCHMARK.md');

    expect(benchmark).toContain('## Standing final-batch baseline');
    expect(benchmark).toContain('## Deferred Runner queue');
    expect(benchmark).toContain('## Blocking-now queue');
    expect(benchmark).toContain('RB-001');
    expect(benchmark).toContain('RB-002');
    expect(benchmark).toContain('RB-003');
    expect(benchmark).toContain('RB-004');
    expect(benchmark).toContain('RB-005');
    expect(benchmark).toContain('RB-006');
    expect(benchmark).toContain('RB-007');
    expect(benchmark).toContain('exact commit SHA');
    expect(benchmark).toContain('workflow/run identity');
  });

  it('keeps the roadmap execution policy aligned with deferred Runner batching', () => {
    const roadmap = read('memory-bank/ROADMAP.md');

    expect(roadmap).toContain('docs/RUNNER_BENCHMARK.md');
    expect(roadmap).toContain('consolidated `FINAL_BATCH`');
    expect(roadmap).toContain('`BLOCKING_NOW` Runner entries immediately');
  });
});
