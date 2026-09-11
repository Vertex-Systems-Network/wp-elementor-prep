import {
  BUILD_READY_SCHEMA_VERSION,
  BUILD_READY_SCORE_VERSION,
  RESPONSIVE_RISK_VERSION,
  type BuildReadyFinding,
  type BuildReadyReportV2,
  type BuildReadyStatus,
} from './build-ready-types';
import { buildP14PreparationPlan } from './p14-preparation-plan';
import type {
  P14PreparationFindingInput,
  P14PreparationPlanV1,
  P14PreparationRecipeDefinition,
} from './p14-preparation-types';
import {
  P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION,
  PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
  resolveP14SafeRecipe,
  validateP14SafeRecipeRegistry,
  type P14SafeRecipeRegistryV1,
} from './p14-safe-recipe-registry';

export const P13_P14_HANDOFF_SCHEMA_VERSION = 1 as const;
export const P13_P14_HANDOFF_VERSION = 1 as const;

export interface P13P14HandoffResult {
  schemaVersion: typeof P13_P14_HANDOFF_SCHEMA_VERSION;
  handoffVersion: typeof P13_P14_HANDOFF_VERSION;
  acceptanceAuthority: false;
  targetCompatibilityClaim: false;
  valid: boolean;
  failures: string[];
  registrySchemaVersion: typeof P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION;
  registryValid: boolean;
  p13RunId: string | null;
  source: {
    nodeId: string;
    fingerprint: string;
  } | null;
  findings: P14PreparationFindingInput[];
  recipes: P14PreparationRecipeDefinition[];
  acceptedCandidateCount: number;
  reviewOnlyCount: number;
}

export interface P13P14PlanResult {
  handoff: P13P14HandoffResult;
  plan: P14PreparationPlanV1 | null;
}

const BUILD_READY_STATUSES = new Set<BuildReadyStatus>([
  'READY',
  'REVIEW',
  'NOT_READY',
  'INSUFFICIENT_EVIDENCE',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function positiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function finiteConfidence(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function stableStrings(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function findingSort(a: BuildReadyFinding, b: BuildReadyFinding): number {
  return a.ruleId.localeCompare(b.ruleId)
    || a.ruleVersion - b.ruleVersion
    || a.id.localeCompare(b.id)
    || a.nodeIds.join('|').localeCompare(b.nodeIds.join('|'));
}

function recipeSort(a: P14PreparationRecipeDefinition, b: P14PreparationRecipeDefinition): number {
  return a.id.localeCompare(b.id) || a.version - b.version;
}

function validateBuildReadyReportForHandoff(value: unknown): { valid: boolean; failures: string[] } {
  const failures: string[] = [];
  if (!isRecord(value)) return { valid: false, failures: ['P13 Build-Ready report must be an object.'] };
  if (value.schemaVersion !== BUILD_READY_SCHEMA_VERSION) failures.push('Unsupported Build-Ready report schema version.');
  if (value.buildReadyScoreVersion !== BUILD_READY_SCORE_VERSION) failures.push('Unsupported Build-Ready score version.');
  if (value.responsiveRiskVersion !== RESPONSIVE_RISK_VERSION) failures.push('Unsupported responsive-risk version.');
  if (!nonEmptyString(value.runId)) failures.push('Build-Ready runId is missing.');

  let expectedRunId: string | null = null;
  if (!isRecord(value.source)
    || !nonEmptyString(value.source.rootId)
    || !nonEmptyString(value.source.structuralHash)
    || !nonEmptyString(value.source.configHash)
    || !nonEmptyString(value.source.analyzerVersion)) {
    failures.push('Build-Ready source fingerprint evidence is incomplete.');
  } else {
    expectedRunId = `p13-${value.source.structuralHash}-${value.source.configHash}`;
    if (value.runId !== expectedRunId) {
      failures.push('Build-Ready runId does not match the exact source/config fingerprint binding.');
    }
  }

  if (!isRecord(value.score)
    || typeof value.score.status !== 'string'
    || !BUILD_READY_STATUSES.has(value.score.status as BuildReadyStatus)) {
    failures.push('Build-Ready score status is missing or unsupported.');
  } else if (value.score.status === 'INSUFFICIENT_EVIDENCE') {
    failures.push('Build-Ready evidence is insufficient for P14 preparation handoff.');
  }
  if (!Array.isArray(value.findings)) {
    failures.push('Build-Ready findings must be an array.');
    return { valid: false, failures };
  }

  const ids = new Set<string>();
  for (const [index, raw] of value.findings.entries()) {
    const prefix = `findings[${index}]`;
    if (!isRecord(raw)) {
      failures.push(`${prefix} must be an object.`);
      continue;
    }
    if (!nonEmptyString(raw.id)) failures.push(`${prefix}.id is missing.`);
    else if (ids.has(raw.id)) failures.push(`Build-Ready findings contain duplicate id ${raw.id}.`);
    else ids.add(raw.id);
    if (!nonEmptyString(raw.ruleId)) failures.push(`${prefix}.ruleId is missing.`);
    if (!positiveInteger(raw.ruleVersion)) failures.push(`${prefix}.ruleVersion must be a positive integer.`);
    if (!finiteConfidence(raw.confidence)) failures.push(`${prefix}.confidence must be between 0 and 100.`);
    if (!Array.isArray(raw.nodeIds)
      || raw.nodeIds.length === 0
      || raw.nodeIds.some((nodeId) => !nonEmptyString(nodeId))) {
      failures.push(`${prefix}.nodeIds must be a non-empty array of non-empty strings.`);
    } else if (new Set(raw.nodeIds).size !== raw.nodeIds.length) {
      failures.push(`${prefix}.nodeIds must not contain duplicates.`);
    }
    if (raw.remediationClass !== 'P14_SAFE_CANDIDATE'
      && raw.remediationClass !== 'MANUAL_REVIEW'
      && raw.remediationClass !== 'ADVISORY') {
      failures.push(`${prefix}.remediationClass is unsupported for P13→P14 handoff.`);
    }
    if (raw.targetAgnostic !== true) failures.push(`${prefix} must remain target-agnostic.`);
  }

  return { valid: failures.length === 0, failures };
}

function reviewFinding(
  finding: BuildReadyFinding,
  refusalCode?: string,
): P14PreparationFindingInput {
  return {
    findingId: finding.id,
    sourceRuleId: finding.ruleId,
    sourceRuleVersion: finding.ruleVersion,
    targetNodeIds: stableStrings(finding.nodeIds),
    confidence: finding.confidence,
    remediationClass: finding.remediationClass === 'ADVISORY' ? 'ADVISORY' : 'MANUAL_REVIEW',
    ...(refusalCode ? { refusalCode } : {}),
  };
}

export function buildP13P14Handoff(
  reportValue: unknown,
  registry: P14SafeRecipeRegistryV1 = PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
): P13P14HandoffResult {
  const reportValidation = validateBuildReadyReportForHandoff(reportValue);
  const registryValidation = validateP14SafeRecipeRegistry(registry);
  const report = reportValue as BuildReadyReportV2;

  if (!reportValidation.valid || !registryValidation.valid) {
    return {
      schemaVersion: P13_P14_HANDOFF_SCHEMA_VERSION,
      handoffVersion: P13_P14_HANDOFF_VERSION,
      acceptanceAuthority: false,
      targetCompatibilityClaim: false,
      valid: false,
      failures: [...reportValidation.failures, ...registryValidation.failures].sort(),
      registrySchemaVersion: P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION,
      registryValid: registryValidation.valid,
      p13RunId: reportValidation.valid ? report.runId : null,
      source: reportValidation.valid
        ? { nodeId: report.source.rootId, fingerprint: report.source.structuralHash }
        : null,
      findings: [],
      recipes: [],
      acceptedCandidateCount: 0,
      reviewOnlyCount: 0,
    };
  }

  const findings: P14PreparationFindingInput[] = [];
  const recipes = new Map<string, P14PreparationRecipeDefinition>();

  for (const finding of [...report.findings].sort(findingSort)) {
    if (finding.remediationClass !== 'P14_SAFE_CANDIDATE') {
      findings.push(reviewFinding(finding));
      continue;
    }

    const resolution = resolveP14SafeRecipe(registry, finding.ruleId, finding.ruleVersion);
    if (resolution.status !== 'MATCH') {
      findings.push(reviewFinding(finding, 'P14_SAFE_BINDING_REQUIRED'));
      continue;
    }

    if (finding.confidence < resolution.binding.recipe.minConfidence) {
      findings.push(reviewFinding(finding, 'P14_BELOW_CONFIDENCE_GATE'));
      continue;
    }

    const recipe = resolution.binding.recipe;
    findings.push({
      findingId: finding.id,
      sourceRuleId: finding.ruleId,
      sourceRuleVersion: finding.ruleVersion,
      targetNodeIds: stableStrings(finding.nodeIds),
      confidence: finding.confidence,
      remediationClass: 'P14_SAFE_CANDIDATE',
      acceptedRecipeId: recipe.id,
      acceptedRecipeVersion: recipe.version,
    });
    recipes.set(`${recipe.id}@${recipe.version}`, recipe);
  }

  const orderedRecipes = [...recipes.values()].sort(recipeSort);
  const acceptedCandidateCount = findings.filter((finding) => finding.remediationClass === 'P14_SAFE_CANDIDATE').length;
  return {
    schemaVersion: P13_P14_HANDOFF_SCHEMA_VERSION,
    handoffVersion: P13_P14_HANDOFF_VERSION,
    acceptanceAuthority: false,
    targetCompatibilityClaim: false,
    valid: true,
    failures: [],
    registrySchemaVersion: P14_SAFE_RECIPE_REGISTRY_SCHEMA_VERSION,
    registryValid: true,
    p13RunId: report.runId,
    source: {
      nodeId: report.source.rootId,
      fingerprint: report.source.structuralHash,
    },
    findings,
    recipes: orderedRecipes,
    acceptedCandidateCount,
    reviewOnlyCount: findings.length - acceptedCandidateCount,
  };
}

export function buildP14PreparationPlanFromBuildReady(
  reportValue: unknown,
  registry: P14SafeRecipeRegistryV1 = PRODUCTION_P14_SAFE_RECIPE_REGISTRY,
): P13P14PlanResult {
  const handoff = buildP13P14Handoff(reportValue, registry);
  if (!handoff.valid || !handoff.source || !handoff.p13RunId) return { handoff, plan: null };
  return {
    handoff,
    plan: buildP14PreparationPlan({
      p13RunId: handoff.p13RunId,
      sourceNodeId: handoff.source.nodeId,
      sourceFingerprint: handoff.source.fingerprint,
      findings: handoff.findings,
      recipes: handoff.recipes,
    }),
  };
}
