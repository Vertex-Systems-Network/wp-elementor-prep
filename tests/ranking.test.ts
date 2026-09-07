import { describe, expect, it } from 'vitest';
import { rankPatternDetections } from '../src/core/ranking';
import type { PatternDetection } from '../src/core/types';

function detection(pattern: PatternDetection['pattern'], confidence: number, targetNodeId = '1:1'): PatternDetection {
  return { pattern, confidence, targetNodeId, targetNodeName: 'Target', evidence: {} };
}

describe('rankPatternDetections', () => {
  it('keeps the most specific interpretation for the same target', () => {
    const ranked = rankPatternDetections([
      detection('horizontal-row', 100),
      detection('carousel-track', 92),
    ]);

    expect(ranked).toHaveLength(1);
    expect(ranked[0]?.pattern).toBe('carousel-track');
  });

  it('preserves independent targets', () => {
    const ranked = rankPatternDetections([
      detection('grid', 90, 'grid'),
      detection('two-column', 95, 'columns'),
    ]);

    expect(ranked.map((item) => item.targetNodeId).sort()).toEqual(['columns', 'grid']);
  });
});
