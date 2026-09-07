import type { PatternDetection, PatternKind } from './types';

const specificity: Record<PatternKind, number> = {
  'carousel-track': 500,
  grid: 400,
  'two-column': 300,
  'horizontal-row': 200,
  'vertical-stack': 100,
  unknown: 0,
};

function stronger(a: PatternDetection, b: PatternDetection): PatternDetection {
  const aSpecificity = specificity[a.pattern];
  const bSpecificity = specificity[b.pattern];
  if (aSpecificity !== bSpecificity) return aSpecificity > bSpecificity ? a : b;
  if (a.confidence !== b.confidence) return a.confidence > b.confidence ? a : b;
  return a;
}

/**
 * Keep one most-specific interpretation per target node, then rank targets by confidence.
 * Example: a clipped carousel track is also geometrically a horizontal row, but reporting both
 * for the same target is redundant and can mislead future recipe selection.
 */
export function rankPatternDetections(detections: PatternDetection[], maxResults = 8): PatternDetection[] {
  const byTarget = new Map<string, PatternDetection>();

  for (const detection of detections) {
    const current = byTarget.get(detection.targetNodeId);
    byTarget.set(detection.targetNodeId, current ? stronger(current, detection) : detection);
  }

  return [...byTarget.values()]
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return specificity[b.pattern] - specificity[a.pattern];
    })
    .slice(0, Math.max(1, maxResults));
}
