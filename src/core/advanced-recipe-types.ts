import type { AdvancedPatternKind } from './advanced-types';

export type AdvancedRecipeKind =
  | 'timeline-flow'
  | 'alternating-timeline'
  | 'carousel-viewport-track'
  | 'fragmented-card-synthesis'
  | 'milestone-grid'
  | 'page-vertical-flow';

/**
 * P6 recipe planning remains intentionally non-mutating until real-template calibration proves
 * each advanced transformer safe. `CALIBRATE` means the structure is strong enough to enter that
 * evidence phase; it does not authorize a production mutation.
 */
export type AdvancedRecipeDecision = 'CALIBRATE' | 'REVIEW' | 'PRESERVE' | 'NOOP';

export type AdvancedRecipeReasonCode =
  | 'TARGET_NOT_FOUND'
  | 'PRESERVATION_RELATIONSHIP_REQUIRED'
  | 'DETECTION_REQUIRES_REVIEW'
  | 'BELOW_CALIBRATION_GATE'
  | 'CANDIDATE_READY_FOR_CALIBRATION'
  | 'TARGET_ALREADY_STRUCTURED'
  | 'PATTERN_NOT_RECIPE_BACKED';

export interface AdvancedRecipePlan {
  schemaVersion: 1;
  decision: AdvancedRecipeDecision;
  recipe: AdvancedRecipeKind | null;
  reasonCode: AdvancedRecipeReasonCode;
  reason: string;
  confidence: number;
  minConfidence: number | null;
  pattern: AdvancedPatternKind;
  targetNodeId: string;
  targetNodeName: string;
  /** Child-index path from the audited section root to the target. Clone candidates must preserve it before mutation. */
  targetPath: number[];
  /** Nodes/relationships that a future transformer must explicitly preserve. */
  preserveNodeIds: string[];
  /** P6 planning is read-only until calibration and transaction evidence are complete. */
  mutationEnabled: false;
  /** Any future mutation must pass the same full-frame P3 visual/content validation gate used by P5. */
  futureMutationRequiresFullP3: true;
  /** Any future mutation must run as a P4 candidate with rejection/rollback semantics. */
  futureMutationRequiresP4Rollback: true;
  evidence: Record<string, string | number | boolean>;
}
