import type { PatternDetection, RoleDetection, AuditNode } from './types';
import type {
  SafeRecipeKind,
  SafeRecipePlan,
  SafeRecipeReasonCode,
} from './safe-recipe-types';

interface RecipeRule {
  recipe: SafeRecipeKind;
  minConfidence: number;
}

const PATTERN_RULES: Partial<Record<PatternDetection['pattern'], RecipeRule>> = {
  'vertical-stack': { recipe: 'vertical-stack', minConfidence: 90 },
  'horizontal-row': { recipe: 'horizontal-row', minConfidence: 90 },
  'two-column': { recipe: 'two-column', minConfidence: 92 },
};

const SEMANTIC_RULES: Partial<Record<NonNullable<PatternDetection['semanticHint']>, RecipeRule>> = {
  'facts-list': { recipe: 'facts-list', minConfidence: 92 },
  'footer-columns': { recipe: 'footer-columns', minConfidence: 92 },
  'repeated-cards': { recipe: 'simple-card-grid', minConfidence: 94 },
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

function planned(
  detection: PatternDetection,
  targetPath: number[],
  recipe: SafeRecipeKind | null,
  decision: SafeRecipePlan['decision'],
  reasonCode: SafeRecipeReasonCode,
  reason: string,
  minConfidence: number | null,
  extraEvidence: Record<string, string | number | boolean> = {},
): SafeRecipePlan {
  return {
    schemaVersion: 1,
    decision,
    recipe,
    reasonCode,
    reason,
    confidence: detection.confidence,
    minConfidence,
    pattern: detection.pattern,
    semanticHint: detection.semanticHint,
    targetNodeId: detection.targetNodeId,
    targetNodeName: detection.targetNodeName,
    targetPath,
    evidence: { ...detection.evidence, ...extraEvidence },
  };
}

function ruleForDetection(detection: PatternDetection): RecipeRule | null {
  if (detection.semanticHint) {
    const semantic = SEMANTIC_RULES[detection.semanticHint];
    if (semantic) return semantic;
  }
  return PATTERN_RULES[detection.pattern] ?? null;
}

function alreadyStructured(target: AuditNode, detection: PatternDetection): boolean {
  if (!target.isAutoLayout) return false;
  if (detection.pattern === 'vertical-stack') return target.layoutMode === 'VERTICAL';
  if (detection.pattern === 'horizontal-row' || detection.pattern === 'two-column') return target.layoutMode === 'HORIZONTAL';
  return false;
}

export function planSafeRecipe(
  section: AuditNode,
  detection: PatternDetection,
  roles: RoleDetection[] = [],
): SafeRecipePlan {
  const match = findNodeById(section, detection.targetNodeId);
  if (!match) {
    return planned(
      detection,
      [],
      null,
      'REVIEW',
      'TARGET_NOT_FOUND',
      'The classifier target is not present in the audited section tree; no candidate mutation is allowed.',
      null,
    );
  }

  const { node: target, path } = match;

  if (detection.pattern === 'carousel-track' || detection.semanticHint === 'carousel-viewport' || detection.semanticHint === 'timeline-chapter') {
    return planned(
      detection,
      path,
      null,
      'UNSUPPORTED',
      'ADVANCED_PATTERN_DEFERRED',
      'Carousel and timeline structures are deferred to P6 and must remain read-only in P5.',
      null,
    );
  }

  if (detection.semanticHint === 'split-header') {
    return planned(
      detection,
      path,
      null,
      'REVIEW',
      'SEMANTIC_RECIPE_NOT_SUPPORTED',
      'Split-header semantics are not an initial P5 Safe Fix recipe.',
      null,
    );
  }

  if (detection.pattern === 'grid' && detection.semanticHint !== 'repeated-cards') {
    return planned(
      detection,
      path,
      null,
      'REVIEW',
      'AMBIGUOUS_GRID_SEMANTICS',
      'A geometric grid without conservative card semantics could represent metrics, media, facts or decoration; keep it in REVIEW.',
      null,
    );
  }

  if (detection.pattern === 'grid' && Boolean(detection.evidence.fragmentedCellCandidate)) {
    return planned(
      detection,
      path,
      null,
      'REVIEW',
      'FRAGMENTED_GRID_UNSAFE',
      'Fragmented grid synthesis requires wrapper creation and is intentionally deferred from the first Safe Fix recipes.',
      null,
    );
  }

  const roleOnTarget = roles.find((role) => role.targetNodeId === target.id || role.parentNodeId === target.id);
  if (roleOnTarget) {
    return planned(
      detection,
      path,
      null,
      'REVIEW',
      'SPECIAL_VISUAL_ROLE_PRESENT',
      `The target contains or is associated with ${roleOnTarget.role}; P5 will not normalize this structure automatically.`,
      null,
      { blockingRole: roleOnTarget.role },
    );
  }

  const absoluteChildren = target.children.filter((child) => child.visible && child.absolutePositioned).length;
  if (absoluteChildren > 0) {
    return planned(
      detection,
      path,
      null,
      'REVIEW',
      'ABSOLUTE_CHILD_PRESENT',
      'The target has visible absolute-positioned direct children; the first P5 recipes require ordinary-flow children only.',
      null,
      { absoluteDirectChildren: absoluteChildren },
    );
  }

  if (alreadyStructured(target, detection)) {
    const rule = ruleForDetection(detection);
    return planned(
      detection,
      path,
      rule?.recipe ?? null,
      'NOOP',
      'TARGET_ALREADY_STRUCTURED',
      'The target already uses the matching Auto Layout direction, so no mutation is necessary.',
      rule?.minConfidence ?? null,
    );
  }

  const rule = ruleForDetection(detection);
  if (!rule) {
    return planned(
      detection,
      path,
      null,
      'UNSUPPORTED',
      'PATTERN_NOT_SUPPORTED',
      'No conservative P5 recipe is registered for this detection.',
      null,
    );
  }

  if (detection.confidence < rule.minConfidence) {
    return planned(
      detection,
      path,
      rule.recipe,
      'REVIEW',
      'BELOW_CONFIDENCE_GATE',
      `Confidence ${detection.confidence}% is below the ${rule.minConfidence}% mutation gate for ${rule.recipe}.`,
      rule.minConfidence,
    );
  }

  return planned(
    detection,
    path,
    rule.recipe,
    'ELIGIBLE',
    'SUPPORTED_HIGH_CONFIDENCE',
    `High-confidence ${rule.recipe} target is eligible for candidate-only transformation followed by mandatory P3 validation.`,
    rule.minConfidence,
  );
}

export function planSafeRecipes(
  section: AuditNode,
  detections: PatternDetection[],
  roles: RoleDetection[] = [],
): SafeRecipePlan[] {
  return detections.map((detection) => planSafeRecipe(section, detection, roles));
}
