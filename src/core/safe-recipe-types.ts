import type { PatternKind, SemanticHint } from './types';

export type SafeRecipeKind =
  | 'vertical-stack'
  | 'horizontal-row'
  | 'two-column'
  | 'facts-list'
  | 'footer-columns'
  | 'simple-card-grid'
  | 'metric-grid'
  | 'social-link-strip';

export type SafeRecipeDecision = 'ELIGIBLE' | 'REVIEW' | 'NOOP' | 'UNSUPPORTED';

export type SafeRecipeReasonCode =
  | 'SUPPORTED_HIGH_CONFIDENCE'
  | 'BELOW_CONFIDENCE_GATE'
  | 'TARGET_NOT_FOUND'
  | 'TARGET_ALREADY_STRUCTURED'
  | 'SPECIAL_VISUAL_ROLE_PRESENT'
  | 'ABSOLUTE_CHILD_PRESENT'
  | 'FRAGMENTED_GRID_UNSAFE'
  | 'AMBIGUOUS_GRID_SEMANTICS'
  | 'ADVANCED_PATTERN_DEFERRED'
  | 'SEMANTIC_RECIPE_NOT_SUPPORTED'
  | 'PATTERN_NOT_SUPPORTED';

export interface SafeRecipePlan {
  schemaVersion: 1;
  decision: SafeRecipeDecision;
  recipe: SafeRecipeKind | null;
  reasonCode: SafeRecipeReasonCode;
  reason: string;
  confidence: number;
  minConfidence: number | null;
  pattern: PatternKind;
  semanticHint?: SemanticHint;
  targetNodeId: string;
  targetNodeName: string;
  /** Child-index path from the audited section root to the target. Clone candidates preserve this path before mutation. */
  targetPath: number[];
  evidence: Record<string, string | number | boolean>;
}
