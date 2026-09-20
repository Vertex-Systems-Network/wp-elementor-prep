import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralExportDocumentV1,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes,
} from './responsive-container-binding';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION =
  'p15-elementor-responsive-min-height-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION =
  'p15-elementor-responsive-min-height-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX = 1440 as const;

export const P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  sliderSourcePath: 'includes/controls/slider.php',
  sliderSourceBlobSha: 'f56798bd5e0a2bee5a7c3a7771ecbaf2af87fb7f',
  fixtureSourcePath: 'tests/jest/unit/modules/container-converter/assets/js/editor/commands/convert.test.js',
  fixtureSourceBlobSha: '27c8d0eadae77a9c4e33258111829f47ed9e217b',
  controlName: 'min_height',
  desktopSettingKey: 'min_height',
  tabletSettingKey: 'min_height_tablet',
  mobileSettingKey: 'min_height_mobile',
  unit: 'px',
  maxPx: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX,
});

export interface P15ElementorResponsiveMinHeightEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx?: number;
  mobileMinHeightPx?: number;
}

export interface P15ElementorResponsiveMinHeightManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveMinHeightEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveMinHeightIssueCode =
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_MIN_HEIGHT_VALUE_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_MIN_HEIGHT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_MIN_HEIGHT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_MIN_HEIGHT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_MIN_HEIGHT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveMinHeightIssueV1 {
  code: P15ElementorResponsiveMinHeightIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveMinHeightStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES'
  | 'RESPONSIVE_MIN_HEIGHT_RESOLVED';

export interface P15ElementorResponsiveMinHeightSummaryEntryV1 {
  sourceNodeId: string;
  tabletMinHeightPx: number | null;
  mobileMinHeightPx: number | null;
}

export interface P15ElementorResponsiveMinHeightResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION;
  status: P15ElementorResponsiveMinHeightStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedMinHeights: P15ElementorResponsiveMinHeightSummaryEntryV1[];
  issues: P15ElementorResponsiveMinHeightIssueV1[];
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

const ENTRY_KEYS = ['mobileMinHeightPx', 'sourceNodeId', 'tabletMinHeightPx'] as const;
const ISSUE_CODES: readonly P15ElementorResponsiveMinHeightIssueCode[] = [
  'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_MIN_HEIGHT_ENTRIES_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_ENTRY_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_MIN_HEIGHT_VALUE_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_MIN_HEIGHT_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_MIN_HEIGHT_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_MIN_HEIGHT_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_MIN_HEIGHT_RESOLVED_CANDIDATE_INVALID',
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

function validMinHeightPx(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && Number.isInteger(value)
    && value >= 0
    && value <= P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX;
}

function snapshotMinHeight(value: number): number {
  return value;
}

function elementorSlider(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    size: value,
    sizes: [],
  };
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveMinHeightSummaryEntryV1,
): P15ElementorResponsiveMinHeightSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletMinHeightPx: entry.tabletMinHeightPx === null ? null : snapshotMinHeight(entry.tabletMinHeightPx),
    mobileMinHeightPx: entry.mobileMinHeightPx === null ? null : snapshotMinHeight(entry.mobileMinHeightPx),
  };
}

function baseResult(
  status: P15ElementorResponsiveMinHeightStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedMinHeights: P15ElementorResponsiveMinHeightSummaryEntryV1[],
  issues: P15ElementorResponsiveMinHeightIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveMinHeightResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedMinHeights.length,
    resolvedMinHeights: resolvedMinHeights.map(cloneSummaryEntry),
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
 * Apply only explicit default tablet/mobile integer-px min-height overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive min height, synthesize inheritance,
 * convert units, parse CSS/custom values, change desktop min height, permit negative/fractional values,
 * or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerMinHeight(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveMinHeightResultV1 {
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
        code: 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_IR_INVALID' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  const source = sourceValue as P15NeutralExportDocumentV1;
  const sourceIrFingerprint = fingerprintP15NeutralExportDocument(source);
  const sourceContainers = collectP15NeutralContainerNodes(source);
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
        code: 'P15_RESPONSIVE_MIN_HEIGHT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive min height resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveMinHeightIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveMinHeightEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive min height manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive min height manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive min height manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_MIN_HEIGHT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive min height resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MIN_HEIGHT_ENTRY_INVALID',
            path,
            message: 'Each responsive min height entry may contain only sourceNodeId plus tablet/mobile min-height values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MIN_HEIGHT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive min height sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MIN_HEIGHT_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive min height sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletMinHeightPx !== undefined;
        const mobileProvided = raw.mobileMinHeightPx !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_MIN_HEIGHT_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive min height entry must explicitly provide tabletMinHeightPx and/or mobileMinHeightPx.',
          });
          continue;
        }

        if ((tabletProvided && !validMinHeightPx(raw.tabletMinHeightPx))
          || (mobileProvided && !validMinHeightPx(raw.mobileMinHeightPx))) {
          issues.push({
            code: 'P15_RESPONSIVE_MIN_HEIGHT_VALUE_INVALID',
            path,
            message: `Responsive min height must be an integer px value between 0 and ${P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_MAX_PX}.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletMinHeightPx: snapshotMinHeight(raw.tabletMinHeightPx as number) }
            : {}),
          ...(mobileProvided
            ? { mobileMinHeightPx: snapshotMinHeight(raw.mobileMinHeightPx as number) }
            : {}),
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
      'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES',
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

  const template = cloneP15ReadyElementorTemplate(baseGeneration.candidate);
  const binding = bindP15NeutralSourceToGeneratedContainers(source, template);
  if (binding.issues.length > 0) {
    return baseResult(
      'REJECTED_INVALID_MANIFEST',
      sourceIrFingerprint,
      baseIdentity.digest,
      null,
      sourceContainers.size,
      [],
      binding.issues.map((issue) => ({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_GENERATOR_BINDING_MISMATCH' as const,
        path: issue.path,
        message: issue.message,
      })),
      null,
      null,
    );
  }

  for (const [sourceNodeId, resolution] of resolutions) {
    const target = binding.containers.get(sourceNodeId);
    if (!target || !isRecord(target.settings)) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletMinHeightPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet min-height override.',
      });
      continue;
    }
    if (resolution.mobileMinHeightPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_MIN_HEIGHT_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile min-height override.',
      });
      continue;
    }

    if (resolution.tabletMinHeightPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE.tabletSettingKey] =
        elementorSlider(resolution.tabletMinHeightPx);
    }
    if (resolution.mobileMinHeightPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE.mobileSettingKey] =
        elementorSlider(resolution.mobileMinHeightPx);
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
        code: 'P15_RESPONSIVE_MIN_HEIGHT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive min height output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedMinHeights = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletMinHeightPx: entry.tabletMinHeightPx === undefined ? null : snapshotMinHeight(entry.tabletMinHeightPx),
      mobileMinHeightPx: entry.mobileMinHeightPx === undefined ? null : snapshotMinHeight(entry.mobileMinHeightPx),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_MIN_HEIGHT_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedMinHeights,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveMinHeightIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveMinHeightIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveMinHeightSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileMinHeightPx', 'sourceNodeId', 'tabletMinHeightPx'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletMinHeightPx === null || validMinHeightPx(entry.tabletMinHeightPx))
    && (entry.mobileMinHeightPx === null || validMinHeightPx(entry.mobileMinHeightPx))
    && (entry.tabletMinHeightPx !== null || entry.mobileMinHeightPx !== null);
}

/** Serialize only sanitized min-height metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMinHeightSummary(
  result: P15ElementorResponsiveMinHeightResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES'
    || result.status === 'RESPONSIVE_MIN_HEIGHT_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedMinHeights.length;
  const uniqueIds = new Set(result.resolvedMinHeights.map((entry) => entry.sourceNodeId)).size
    === result.resolvedMinHeights.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES'
    || result.status === 'RESPONSIVE_MIN_HEIGHT_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_MIN_HEIGHT_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_MIN_HEIGHT_OVERRIDES'
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
    || !result.resolvedMinHeights.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-min-height result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedMinHeights: result.resolvedMinHeights.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_MIN_HEIGHT_EVIDENCE,
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
