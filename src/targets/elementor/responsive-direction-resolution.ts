import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import {
  buildElementorTemplateCandidateIdentity,
} from './import-validation-contract';
import {
  fingerprintP15NeutralExportDocument,
} from './neutral-export-ir-identity';
import {
  validateP15NeutralExportDocument,
  type P15NeutralContainerNode,
  type P15NeutralExportDocumentV1,
  type P15NeutralExportNode,
} from './neutral-export-ir';
import {
  type ElementorContainerV04,
  type ElementorElementV04,
  type ElementorTemplateV04,
} from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION =
  'p15-elementor-responsive-direction-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION =
  'p15-elementor-responsive-direction-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  groupName: 'flex',
  controlName: 'direction',
  tabletSettingKey: 'flex_direction_tablet',
  mobileSettingKey: 'flex_direction_mobile',
});

export type P15ElementorResponsiveDirection =
  | 'row'
  | 'column'
  | 'row-reverse'
  | 'column-reverse';

export interface P15ElementorResponsiveDirectionEntryV1 {
  sourceNodeId: string;
  tabletDirection?: P15ElementorResponsiveDirection;
  mobileDirection?: P15ElementorResponsiveDirection;
}

export interface P15ElementorResponsiveDirectionManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveDirectionEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveDirectionIssueCode =
  | 'P15_RESPONSIVE_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_ENTRY_INVALID'
  | 'P15_RESPONSIVE_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_DIRECTION_INVALID'
  | 'P15_RESPONSIVE_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveDirectionIssueV1 {
  code: P15ElementorResponsiveDirectionIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveDirectionStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_OVERRIDES'
  | 'RESPONSIVE_DIRECTIONS_RESOLVED';

export interface P15ElementorResponsiveDirectionSummaryEntryV1 {
  sourceNodeId: string;
  tabletDirection: P15ElementorResponsiveDirection | null;
  mobileDirection: P15ElementorResponsiveDirection | null;
}

export interface P15ElementorResponsiveDirectionResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION;
  status: P15ElementorResponsiveDirectionStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedDirections: P15ElementorResponsiveDirectionSummaryEntryV1[];
  issues: P15ElementorResponsiveDirectionIssueV1[];
  template: ElementorTemplateV04 | null;
  candidate: ElementorTemplateCandidateArtifactV1 | null;
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
  internalReviewRequired: true;
}

const MANIFEST_KEYS = [
  'baseCandidateIdentityDigest',
  'containers',
  'downloadEnabled',
  'figmaMutation',
  'manifestVersion',
  'networkAccess',
  'productionAcceptance',
  'responsiveClosureClaim',
  'responsiveInferencePerformed',
  'schemaVersion',
  'sourceIrFingerprint',
  'targetCompatibilityClaim',
] as const;

const ENTRY_KEYS = ['mobileDirection', 'sourceNodeId', 'tabletDirection'] as const;
const DIRECTIONS: readonly P15ElementorResponsiveDirection[] = [
  'row',
  'column',
  'row-reverse',
  'column-reverse',
];

const ISSUE_CODES: readonly P15ElementorResponsiveDirectionIssueCode[] = [
  'P15_RESPONSIVE_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_ENTRIES_INVALID',
  'P15_RESPONSIVE_ENTRY_INVALID',
  'P15_RESPONSIVE_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_DIRECTION_INVALID',
  'P15_RESPONSIVE_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_RESOLVED_CANDIDATE_INVALID',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const canonical = [...expected].sort();
  return actual.length === canonical.length
    && actual.every((key, index) => key === canonical[index]);
}

function onlyAllowedKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function validFingerprint(value: unknown): value is string {
  return typeof value === 'string' && /^sha256:[0-9a-f]{64}$/.test(value);
}

function validSourceNodeId(value: unknown): value is string {
  return typeof value === 'string'
    && value.length > 0
    && value.length <= 512
    && value.trim() === value;
}

function validDirection(value: unknown): value is P15ElementorResponsiveDirection {
  return typeof value === 'string' && DIRECTIONS.includes(value as P15ElementorResponsiveDirection);
}

function expectedWidgetType(node: Exclude<P15NeutralExportNode, P15NeutralContainerNode>): string | null {
  if (node.kind === 'heading') return 'heading';
  if (node.kind === 'text') return 'text-editor';
  if (node.kind === 'button') return 'button';
  if (node.kind === 'image') return 'image';
  return null;
}

function collectSourceContainers(
  nodes: readonly P15NeutralExportNode[],
  containers: Map<string, P15NeutralContainerNode>,
): void {
  for (const node of nodes) {
    if (node.kind !== 'container') continue;
    containers.set(node.sourceNodeId, node);
    collectSourceContainers(node.children, containers);
  }
}

function bindingIssue(
  issues: P15ElementorResponsiveDirectionIssueV1[],
  path: string,
  message: string,
): void {
  issues.push({
    code: 'P15_RESPONSIVE_GENERATOR_BINDING_MISMATCH',
    path,
    message,
  });
}

function bindGeneratedContainers(
  sourceNodes: readonly P15NeutralExportNode[],
  targetElements: readonly ElementorElementV04[],
  targets: Map<string, ElementorContainerV04>,
  issues: P15ElementorResponsiveDirectionIssueV1[],
  targetPath: string,
): void {
  if (sourceNodes.length !== targetElements.length) {
    bindingIssue(
      issues,
      targetPath,
      'Generated Elementor tree length does not match the exact review-free neutral source tree.',
    );
    return;
  }

  for (let index = 0; index < sourceNodes.length; index += 1) {
    const source = sourceNodes[index];
    const target = targetElements[index];
    if (!source || !target) {
      bindingIssue(issues, `${targetPath}[${index}]`, 'Generated source/target element pair is missing.');
      continue;
    }

    const path = `${targetPath}[${index}]`;
    if (source.kind === 'review') {
      bindingIssue(issues, path, 'Review nodes cannot participate in responsive candidate binding.');
      continue;
    }

    if (source.kind === 'container') {
      if (target.elType !== 'container') {
        bindingIssue(issues, path, 'Neutral container did not bind to a generated Elementor container.');
        continue;
      }
      if (!isRecord(target.settings) || target.settings.flex_direction !== source.direction) {
        bindingIssue(issues, `${path}.settings.flex_direction`, 'Generated container base direction drifted from the neutral source.');
        continue;
      }
      targets.set(source.sourceNodeId, target);
      bindGeneratedContainers(source.children, target.elements, targets, issues, `${path}.elements`);
      continue;
    }

    const widgetType = expectedWidgetType(source);
    if (target.elType !== 'widget' || target.widgetType !== widgetType) {
      bindingIssue(issues, path, 'Neutral widget did not bind to the expected generated Elementor core widget.');
    }
  }
}

function cloneTemplateFromCandidate(candidate: ElementorTemplateCandidateArtifactV1): ElementorTemplateV04 {
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION' || typeof candidate.templateJson !== 'string') {
    throw new Error('Responsive direction resolver received a non-ready base candidate.');
  }
  return JSON.parse(candidate.templateJson) as ElementorTemplateV04;
}

function baseResult(
  status: P15ElementorResponsiveDirectionStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedDirections: P15ElementorResponsiveDirectionSummaryEntryV1[],
  issues: P15ElementorResponsiveDirectionIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveDirectionResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedDirections.length,
    resolvedDirections: resolvedDirections.map((entry) => ({ ...entry })),
    issues: issues.map((issue) => ({ ...issue })),
    template,
    candidate,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  };
}

/**
 * Apply explicit default-breakpoint direction overrides to exact generated container bindings.
 *
 * The manifest is bound to both the canonical neutral source and the exact base candidate identity.
 * No responsive values are inferred; omitted breakpoint keys remain omitted.
 */
export function resolveP15ElementorResponsiveContainerDirections(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveDirectionResultV1 {
  const validation = validateP15NeutralExportDocument(sourceValue);
  if (!validation.valid) {
    return baseResult(
      'BLOCKED_INVALID_SOURCE_IR',
      null,
      null,
      null,
      0,
      [],
      validation.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceContainers = new Map<string, P15NeutralContainerNode>();
  collectSourceContainers(source.nodes, sourceContainers);

  const baseGeneration = generateElementorV3TemplateCandidate(source);
  if (baseGeneration.status !== 'GENERATED_LOCAL_CANDIDATE'
    || baseGeneration.template === null
    || baseGeneration.candidate === null) {
    return baseResult(
      'BLOCKED_UPSTREAM_GENERATION',
      sourceIrFingerprint,
      null,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_RESPONSIVE_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive direction resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveDirectionIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveDirectionEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive direction manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive direction manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_DIRECTION_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive direction manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_BASE_CANDIDATE_IDENTITY_MISMATCH',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'Manifest is not bound to the exact current base candidate identity.',
      });
    }
    if (manifestValue.responsiveInferencePerformed !== false
      || manifestValue.figmaMutation !== false
      || manifestValue.networkAccess !== false
      || manifestValue.responsiveClosureClaim !== false
      || manifestValue.targetCompatibilityClaim !== false
      || manifestValue.productionAcceptance !== false
      || manifestValue.downloadEnabled !== false) {
      issues.push({
        code: 'P15_RESPONSIVE_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive direction resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_DIRECTION_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_DIRECTION_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;
        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ENTRY_INVALID',
            path,
            message: 'Each responsive entry may contain only sourceNodeId plus tablet/mobile direction overrides.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletDirection !== undefined;
        const mobileProvided = raw.mobileDirection !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive entry must explicitly provide tabletDirection and/or mobileDirection.',
          });
          continue;
        }
        if ((tabletProvided && !validDirection(raw.tabletDirection))
          || (mobileProvided && !validDirection(raw.mobileDirection))) {
          issues.push({
            code: 'P15_RESPONSIVE_DIRECTION_INVALID',
            path,
            message: 'Responsive direction must be row, column, row-reverse or column-reverse.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided ? { tabletDirection: raw.tabletDirection as P15ElementorResponsiveDirection } : {}),
          ...(mobileProvided ? { mobileDirection: raw.mobileDirection as P15ElementorResponsiveDirection } : {}),
        });
      }
    }
  }

  if (issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      issues,
      null,
      null,
    );
  }

  if (resolutions.size === 0) {
    return baseResult(
      'NO_RESPONSIVE_OVERRIDES',
      sourceIrFingerprint,
      baseIdentity.digest,
      baseIdentity.digest,
      sourceContainers.size,
      [],
      [],
      baseGeneration.template,
      baseGeneration.candidate,
    );
  }

  const template = cloneTemplateFromCandidate(baseGeneration.candidate);
  const targetContainers = new Map<string, ElementorContainerV04>();
  const bindingIssues: P15ElementorResponsiveDirectionIssueV1[] = [];
  bindGeneratedContainers(source.nodes, template.content, targetContainers, bindingIssues, '$.content');
  if (bindingIssues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      bindingIssues,
      null,
      null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = targetContainers.get(sourceNodeId);
    if (!target || !isRecord(target.settings)) {
      bindingIssue(bindingIssues, '$.content', `Generated container binding missing for sourceNodeId ${sourceNodeId}.`);
      continue;
    }
    if (resolution.tabletDirection !== undefined
      && Object.prototype.hasOwnProperty.call(target.settings, P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.tabletSettingKey)) {
      issues.push({
        code: 'P15_RESPONSIVE_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet direction override.',
      });
      continue;
    }
    if (resolution.mobileDirection !== undefined
      && Object.prototype.hasOwnProperty.call(target.settings, P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.mobileSettingKey)) {
      issues.push({
        code: 'P15_RESPONSIVE_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile direction override.',
      });
      continue;
    }

    if (resolution.tabletDirection !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.tabletSettingKey] = resolution.tabletDirection;
    }
    if (resolution.mobileDirection !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE.mobileSettingKey] = resolution.mobileDirection;
    }
  }

  if (bindingIssues.length > 0 || issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      [...issues, ...bindingIssues],
      null,
      null,
    );
  }

  const candidate = buildElementorTemplateCandidateArtifact(template);
  if (candidate.status !== 'READY_FOR_TARGET_IMPORT_VALIDATION'
    || !candidate.validation.valid
    || candidate.templateJson === null) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      [{
        code: 'P15_RESPONSIVE_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive override output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedDirections = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletDirection: entry.tabletDirection ?? null,
      mobileDirection: entry.mobileDirection ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_DIRECTIONS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedDirections,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveDirectionIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveDirectionIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveDirectionSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileDirection', 'sourceNodeId', 'tabletDirection'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletDirection === null || validDirection(entry.tabletDirection))
    && (entry.mobileDirection === null || validDirection(entry.mobileDirection))
    && (entry.tabletDirection !== null || entry.mobileDirection !== null);
}

/** Serialize only sanitized responsive metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveDirectionSummary(
  result: P15ElementorResponsiveDirectionResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_OVERRIDES'
    || result.status === 'RESPONSIVE_DIRECTIONS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedDirections.length;
  const uniqueIds = new Set(result.resolvedDirections.map((entry) => entry.sourceNodeId)).size
    === result.resolvedDirections.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_OVERRIDES'
    || result.status === 'RESPONSIVE_DIRECTIONS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_DIRECTIONS_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_OVERRIDES'
      ? result.resolvedContainerCount === 0
        && result.baseCandidateIdentityDigest === result.resolvedCandidateIdentityDigest
      : result.resolvedContainerCount === 0;

  if (!validStatus
    || !validCounts
    || !uniqueIds
    || !validSourceFingerprint
    || !validBaseDigest
    || !validResolvedDigest
    || !statusShapeValid
    || !result.resolvedDirections.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-direction result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_DIRECTION_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedDirections: result.resolvedDirections.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_DIRECTION_EVIDENCE,
    responsiveInferencePerformed: false,
    figmaMutation: false,
    networkAccess: false,
    responsiveClosureClaim: false,
    targetCompatibilityClaim: false,
    productionAcceptance: false,
    downloadEnabled: false,
    internalReviewRequired: true,
  }, null, 2)}\n`;
}
