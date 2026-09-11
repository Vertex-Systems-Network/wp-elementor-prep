export const P14_PREPARATION_SCHEMA_VERSION = 1 as const;
export const P14_PREPARATION_ENGINE_VERSION = 'p14-core-v1' as const;

export type P14RemediationClass =
  | 'P14_SAFE_CANDIDATE'
  | 'P14_SAFE_NOOP'
  | 'ADVISORY'
  | 'MANUAL_REVIEW'
  | 'UNSUPPORTED';

export type P14PlanDecision = 'ELIGIBLE' | 'NOOP' | 'REVIEW' | 'REFUSED';
export type P14PlanStatus = 'READY' | 'NO_CHANGES_NEEDED' | 'BLOCKED';

export type P14ErrorCode =
  | 'P14_P13_REPORT_REQUIRED'
  | 'P14_P13_REPORT_STALE'
  | 'P14_NO_ELIGIBLE_RECIPES'
  | 'P14_RECIPE_VERSION_MISMATCH'
  | 'P14_RECIPE_PREREQUISITE_MISSING'
  | 'P14_RECIPE_CONFLICT'
  | 'P14_CLONE_FAILED'
  | 'P14_SOURCE_CHANGED_DURING_RUN'
  | 'P14_TRANSFORM_FAILED'
  | 'P14_VALIDATION_FAILED'
  | 'P14_RESCORE_FAILED'
  | 'P14_FINALIZE_FAILED'
  | 'P14_DISCARD_FAILED'
  | 'P14_CANCELLED'
  | 'P14_INPUT_TOO_LARGE'
  | 'P14_INTERNAL_INVARIANT_FAILED';

export type P14MutationField =
  | 'layoutMode'
  | 'primaryAxisSizingMode'
  | 'counterAxisSizingMode'
  | 'itemSpacing'
  | 'padding'
  | 'textAutoResize'
  | 'layoutSizing'
  | 'layoutGrow'
  | 'layoutAlign'
  | 'wrapperCreation';

export interface P14PreparationRecipeDefinition {
  id: string;
  version: number;
  sourceRuleIds: string[];
  minConfidence: number;
  prerequisites: string[];
  mutationAllowlist: P14MutationField[];
  validationProfileId: string;
  conflictsWith: string[];
  orderClass: string;
}

export interface P14PreparationFindingInput {
  findingId: string;
  sourceRuleId: string;
  sourceRuleVersion: number;
  targetNodeIds: string[];
  confidence: number;
  remediationClass: P14RemediationClass;
  acceptedRecipeId?: string;
  acceptedRecipeVersion?: number;
  refusalCode?: string;
}

export interface P14PreparationAction {
  actionId: string;
  findingId: string;
  decision: P14PlanDecision;
  sourceRuleId: string;
  sourceRuleVersion: number;
  targetNodeIds: string[];
  confidence: number;
  recipeId: string | null;
  recipeVersion: number | null;
  orderClass: string;
  prerequisiteRecipeIds: string[];
  conflictsWithRecipeIds: string[];
  mutationAllowlist: P14MutationField[];
  validationProfileId: string | null;
  refusalCode: string | null;
}

export interface P14PlanBlocker {
  code: P14ErrorCode;
  detail: string;
  actionIds: string[];
}

export interface P14PreparationPlanV1 {
  schemaVersion: typeof P14_PREPARATION_SCHEMA_VERSION;
  engineVersion: typeof P14_PREPARATION_ENGINE_VERSION;
  p13RunId: string;
  source: {
    nodeId: string;
    fingerprint: string;
  };
  status: P14PlanStatus;
  actions: P14PreparationAction[];
  blockers: P14PlanBlocker[];
  eligibleActionIds: string[];
  noOpActionIds: string[];
  reviewActionIds: string[];
  refusedActionIds: string[];
  planDigest: string;
}

export type P14TransactionState =
  | 'IDLE'
  | 'PREFLIGHT'
  | 'PLAN_READY'
  | 'AWAITING_CONFIRMATION'
  | 'CLONING'
  | 'TRANSFORMING'
  | 'VALIDATING'
  | 'RESCORING'
  | 'FINALIZING'
  | 'COMPLETE'
  | 'CANCELLED'
  | 'REJECTED'
  | 'BLOCKED'
  | 'SOURCE_STALE'
  | 'CLEANUP_REQUIRED';

export type P14PreparationStatus =
  | 'PREPARED'
  | 'PREPARED_WITH_REVIEW'
  | 'NO_CHANGES_NEEDED'
  | 'REJECTED'
  | 'BLOCKED'
  | 'CLEANUP_REQUIRED'
  | 'CANCELLED';

export interface P14TransactionEvent {
  state: P14TransactionState;
  at: string;
  detail?: string;
}

export interface P14CandidateHandle {
  sourceNodeId: string;
  candidateNodeId: string;
}

export interface P14RecipeExecutionResult {
  actionId: string;
  recipeId: string;
  applied: boolean;
  becameNoOp?: boolean;
  detail?: string;
}

export interface P14ValidationCheck {
  id: string;
  passed: boolean;
  required: boolean;
  detail?: string;
}

export interface P14ValidationSummary {
  passed: boolean;
  checks: P14ValidationCheck[];
}

export interface P14RescoreSummary {
  runId: string;
  score: number;
  status: string;
  blockerCount: number;
  highRiskCount: number;
  introducedBlockerOrHighCount: number;
  reviewRequired: boolean;
}

export interface P14RetentionEvidence {
  transactionId: string;
  sourceNodeId: string;
  retainedNodeId: string;
  preparedName: string;
}

export interface P14ReceiptError {
  code: P14ErrorCode;
  stage: string;
  detail: string;
  recovery?: string;
}

export interface P14PreparationReceiptV1 {
  schemaVersion: 1;
  engineVersion: typeof P14_PREPARATION_ENGINE_VERSION;
  transactionId: string;
  status: P14PreparationStatus;
  terminalState: Extract<
    P14TransactionState,
    'COMPLETE' | 'CANCELLED' | 'REJECTED' | 'BLOCKED' | 'SOURCE_STALE' | 'CLEANUP_REQUIRED'
  >;
  source: {
    nodeId: string;
    beforeFingerprint: string;
    afterFingerprint: string;
  };
  candidate?: {
    nodeId: string;
    retained: boolean;
  };
  p13RunId: string;
  planDigest: string;
  appliedActions: P14RecipeExecutionResult[];
  validation?: P14ValidationSummary;
  rescore?: P14RescoreSummary;
  retention?: P14RetentionEvidence;
  errors: P14ReceiptError[];
  events: P14TransactionEvent[];
}

export interface P14RetainedDuplicateAdapter {
  fingerprintSource(sourceNodeId: string): Promise<string>;
  cloneSource(sourceNodeId: string, transactionId: string): Promise<P14CandidateHandle>;
  applyRecipe(candidate: P14CandidateHandle, action: P14PreparationAction): Promise<P14RecipeExecutionResult>;
  validateCandidate(candidate: P14CandidateHandle, plan: P14PreparationPlanV1): Promise<P14ValidationSummary>;
  rescoreCandidate(candidate: P14CandidateHandle, plan: P14PreparationPlanV1): Promise<P14RescoreSummary>;
  retainCandidate(
    candidate: P14CandidateHandle,
    transactionId: string,
    preparedName: string,
  ): Promise<P14RetentionEvidence>;
  discardCandidate(candidate: P14CandidateHandle): Promise<void>;
}
