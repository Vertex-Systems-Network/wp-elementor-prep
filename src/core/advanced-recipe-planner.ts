import type { AuditNode } from './types';
import type { AdvancedPatternDetection } from './advanced-types';
import type {
  AdvancedRecipeKind,
  AdvancedRecipePlan,
  AdvancedRecipeReasonCode,
} from './advanced-recipe-types';

interface AdvancedRecipeRule {
  recipe: AdvancedRecipeKind;
  minConfidence: number;
}

const RECIPE_RULES: Partial<Record<AdvancedPatternDetection['pattern'], AdvancedRecipeRule>> = {
  'timeline-sequence': { recipe: 'timeline-flow', minConfidence: 94 },
  'alternating-timeline': { recipe: 'alternating-timeline', minConfidence: 96 },
  'carousel-viewport-track': { recipe: 'carousel-viewport-track', minConfidence: 96 },
  'fragmented-card-synthesis': { recipe: 'fragmented-card-synthesis', minConfidence: 97 },
  'milestone-grid': { recipe: 'milestone-grid', minConfidence: 95 },
  'page-vertical-flow': { recipe: 'page-vertical-flow', minConfidence: 94 },
};

interface NodePathMatch {
  node: AuditNode;
  path: number[];
}

function findNodeById(root: AuditNode, nodeId: string): NodePathMatch | null {
  const queue: NodePathMatch[] = [{ node: root, path: [] }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.node.id === nodeId) return current;
    current.node.children.forEach((child, index) => {
      queue.push({ node: child, path: [...current.path, index] });
    });
  }
  return null;
}

function preservationNodesFor(
  detection: AdvancedPatternDetection,
  allDetections: AdvancedPatternDetection[],
): string[] {
  const ids = new Set<string>();

  for (const candidate of allDetections) {
    if (candidate.decision !== 'PRESERVE' || candidate.targetNodeId !== detection.targetNodeId) continue;
    candidate.relatedNodeIds.forEach((id) => ids.add(id));
    if (candidate.relatedNodeIds.length === 0) ids.add(candidate.targetNodeId);
  }

  if (detection.decision === 'PRESERVE') {
    detection.relatedNodeIds.forEach((id) => ids.add(id));
    if (detection.relatedNodeIds.length === 0) ids.add(detection.targetNodeId);
  }

  return [...ids];
}

function planned(
  detection: AdvancedPatternDetection,
  targetPath: number[],
  recipe: AdvancedRecipeKind | null,
  decision: AdvancedRecipePlan['decision'],
  reasonCode: AdvancedRecipeReasonCode,
  reason: string,
  minConfidence: number | null,
  preserveNodeIds: string[],
  extraEvidence: Record<string, string | number | boolean> = {},
): AdvancedRecipePlan {
  return {
    schemaVersion: 1,
    decision,
    recipe,
    reasonCode,
    reason,
    confidence: detection.confidence,
    minConfidence,
    pattern: detection.pattern,
    targetNodeId: detection.targetNodeId,
    targetNodeName: detection.targetNodeName,
    targetPath,
    preserveNodeIds,
    mutationEnabled: false,
    futureMutationRequiresFullP3: true,
    futureMutationRequiresP4Rollback: true,
    evidence: {
      ...detection.evidence,
      sourceDecision: detection.decision,
      preservedRelationshipCount: preserveNodeIds.length,
      ...extraEvidence,
    },
  };
}

/**
 * Converts one P6 evidence detection into a deterministic read-only recipe plan.
 * This planner deliberately cannot authorize mutation. It only decides whether a structure should
 * stay preserved/reviewed, is already a no-op, or is strong enough to enter calibration.
 */
export function planAdvancedRecipe(
  section: AuditNode,
  detection: AdvancedPatternDetection,
  allDetections: AdvancedPatternDetection[] = [detection],
): AdvancedRecipePlan {
  const match = findNodeById(section, detection.targetNodeId);
  const rule = RECIPE_RULES[detection.pattern] ?? null;
  const preserveNodeIds = preservationNodesFor(detection, allDetections);

  if (!match) {
    return planned(
      detection,
      [],
      rule?.recipe ?? null,
      'REVIEW',
      'TARGET_NOT_FOUND',
      'The advanced classifier target is not present in the audited section tree; no calibration or mutation path is valid.',
      rule?.minConfidence ?? null,
      preserveNodeIds,
    );
  }

  if (detection.decision === 'PRESERVE') {
    return planned(
      detection,
      match.path,
      rule?.recipe ?? null,
      'PRESERVE',
      'PRESERVATION_RELATIONSHIP_REQUIRED',
      'This advanced structure contains an intentional overlay/overflow relationship that must be preserved exactly by any future recipe.',
      rule?.minConfidence ?? null,
      preserveNodeIds,
    );
  }

  if (detection.decision === 'NOOP') {
    return planned(
      detection,
      match.path,
      rule?.recipe ?? null,
      'NOOP',
      'TARGET_ALREADY_STRUCTURED',
      'The target already uses the intended structural direction, so no advanced normalization is needed.',
      rule?.minConfidence ?? null,
      preserveNodeIds,
    );
  }

  if (!rule) {
    return planned(
      detection,
      match.path,
      null,
      'REVIEW',
      'PATTERN_NOT_RECIPE_BACKED',
      'This preservation/evidence pattern has no standalone P6 transformer and must remain read-only.',
      null,
      preserveNodeIds,
    );
  }

  if (detection.decision === 'REVIEW') {
    return planned(
      detection,
      match.path,
      rule.recipe,
      'REVIEW',
      'DETECTION_REQUIRES_REVIEW',
      'The classifier intentionally marked this advanced structure for review; confidence alone cannot promote it into calibration.',
      rule.minConfidence,
      preserveNodeIds,
    );
  }

  if (detection.confidence < rule.minConfidence) {
    return planned(
      detection,
      match.path,
      rule.recipe,
      'REVIEW',
      'BELOW_CALIBRATION_GATE',
      `Confidence ${detection.confidence}% is below the ${rule.minConfidence}% calibration gate for ${rule.recipe}.`,
      rule.minConfidence,
      preserveNodeIds,
    );
  }

  return planned(
    detection,
    match.path,
    rule.recipe,
    'CALIBRATE',
    'CANDIDATE_READY_FOR_CALIBRATION',
    `High-confidence ${rule.recipe} evidence is ready for clone-only calibration; production mutation remains disabled.`,
    rule.minConfidence,
    preserveNodeIds,
  );
}

export function planAdvancedRecipes(
  section: AuditNode,
  detections: AdvancedPatternDetection[],
): AdvancedRecipePlan[] {
  return detections.map((detection) => planAdvancedRecipe(section, detection, detections));
}
