import { detectPatterns as detectGeometricPatterns, recipeForPattern } from './classifier';
import { rankPatternDetections } from './ranking';
import { enrichSemanticHints } from './semantics';
import type { AuditNode, PatternDetection, PatternKind } from './types';

/** P2 classifier pipeline: geometry -> semantic hints -> same-target de-dup/ranking. */
export function detectPatterns(section: AuditNode, maxDepth = 3, maxResults = 8): PatternDetection[] {
  const geometric = detectGeometricPatterns(section, maxDepth, Math.max(maxResults * 4, 24));
  const enriched = enrichSemanticHints(section, geometric);
  return rankPatternDetections(enriched, maxResults);
}

export function detectBestPattern(section: AuditNode, maxDepth = 3): PatternDetection | null {
  return detectPatterns(section, maxDepth, 1)[0] ?? null;
}

export function recipeForDetection(detection: PatternDetection): string | null {
  return detection.semanticHint ?? recipeForPattern(detection.pattern);
}

export function recipeForPatternKind(pattern: PatternKind): string | null {
  return recipeForPattern(pattern);
}
