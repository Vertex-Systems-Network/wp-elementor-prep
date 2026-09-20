import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  P15_NEUTRAL_EXPORT_MAX_SPACING_PX,
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

export const P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION =
  'p15-elementor-responsive-margin-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION =
  'p15-elementor-responsive-margin-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  dimensionsSourcePath: 'includes/controls/dimensions.php',
  dimensionsSourceBlobSha: '7de34809d407e5fa208935b77a6b6648c72d3c5d',
  controlName: 'margin',
  tabletSettingKey: 'margin_tablet',
  mobileSettingKey: 'margin_mobile',
  unit: 'px',
});

export interface P15ElementorResponsiveMarginPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface P15ElementorResponsiveMarginEntryV1 {
  sourceNodeId: string;
  tabletMarginPx?: P15ElementorResponsiveMarginPx;
  mobileMarginPx?: P15ElementorResponsiveMarginPx;
}

export interface P15ElementorResponsiveMarginManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveMarginEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveMarginIssueCode =
  | 'P15_RESPONSIVE_MARGIN_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_MARGIN_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_MARGIN_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_MARGIN_ENTRY_INVALID'
  | 'P15_RESPONSIVE_MARGIN_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_MARGIN_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_MARGIN_VALUE_INVALID'
  | 'P15_RESPONSIVE_MARGIN_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_MARGIN_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_MARGIN_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_MARGIN_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_MARGIN_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveMarginIssueV1 {
  code: P15ElementorResponsiveMarginIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveMarginStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_MARGIN_OVERRIDES'
  | 'RESPONSIVE_MARGIN_RESOLVED';

export interface P15ElementorResponsiveMarginSummaryEntryV1 {
  sourceNodeId: string;
  tabletMarginPx: P15ElementorResponsiveMarginPx | null;
  mobileMarginPx: P15ElementorResponsiveMarginPx | null;
}

export interface P15ElementorResponsiveMarginResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION;
  status: P15ElementorResponsiveMarginStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedMargins: P15ElementorResponsiveMarginSummaryEntryV1[];
  issues: P15ElementorResponsiveMarginIssueV1[];
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

const ENTRY_KEYS = ['mobileMarginPx', 'sourceNodeId', 'tabletMarginPx'] as const;
const MARGIN_KEYS = ['bottom', 'left', 'right', 'top'] as const;

const ISSUE_CODES: readonly P15ElementorResponsiveMarginIssueCode[] = [
  'P15_RESPONSIVE_MARGIN_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_MARGIN_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_MARGIN_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_MARGIN_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_MARGIN_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_MARGIN_ENTRIES_INVALID',
  'P15_RESPONSIVE_MARGIN_ENTRY_INVALID',
  'P15_RESPONSIVE_MARGIN_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_MARGIN_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_MARGIN_VALUE_INVALID',
  'P15_RESPONSIVE_MARGIN_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_MARGIN_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_MARGIN_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_MARGIN_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_MARGIN_RESOLVED_CANDIDATE_INVALID',
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

function validSpacing(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= 0
    && value <= P15_NEUTRAL_EXPORT_MAX_SPACING_PX;
}

function validMarginPx(value: unknown): value is P15ElementorResponsiveMarginPx {
  return isRecord(value)
    && exactKeys(value, MARGIN_KEYS)
    && validSpacing(value.top)
    && validSpacing(value.right)
    && validSpacing(value.bottom)
    && validSpacing(value.left);
}

function snapshotMargin(value: P15ElementorResponsiveMarginPx): P15ElementorResponsiveMarginPx {
  return {
    top: value.top,
    right: value.right,
    bottom: value.bottom,
    left: value.left,
  };
}

function elementorDimensions(value: P15ElementorResponsiveMarginPx): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value.top),
    right: String(value.right),
    bottom: String(value.bottom),
    left: String(value.left),
    isLinked: value.top === value.right
      && value.right === value.bottom
      && value.bottom === value.left,
  };
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveMarginSummaryEntryV1,
): P15ElementorResponsiveMarginSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletMarginPx: entry.tabletMarginPx ? snapshotMargin(entry.tabletMarginPx) : null,
    mobileMarginPx: entry.mobileMarginPx ? snapshotMargin(entry.mobileMarginPx) : null,
  };
}

function baseResult(
  status: P15ElementorResponsiveMarginStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedMargins: P15ElementorResponsiveMarginSummaryEntryV1[],
  issues: P15ElementorResponsiveMarginIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveMarginResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedMargins.length,
    resolvedMargins: resolvedMargins.map(cloneSummaryEntry),
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
 * Apply only explicit default tablet/mobile px margin overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract accepts only bounded finite non-negative px values,
 * derives isLinked from side equality, does not parse CSS/custom units or infer inheritance, leaves desktop
 * settings untouched, and does not claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerMargin(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveMarginResultV1 {
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
        code: 'P15_RESPONSIVE_MARGIN_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_MARGIN_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive margin resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveMarginIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveMarginEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_MARGIN_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive margin manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive margin manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_MARGIN_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive margin manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_MARGIN_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive margin resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_MARGIN_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MARGIN_ENTRY_INVALID',
            path,
            message: 'Each responsive margin entry may contain only sourceNodeId plus tablet/mobile margin objects.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MARGIN_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive margin sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_MARGIN_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive margin sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletMarginPx !== undefined;
        const mobileProvided = raw.mobileMarginPx !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_MARGIN_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive margin entry must explicitly provide tabletMarginPx and/or mobileMarginPx.',
          });
          continue;
        }

        if ((tabletProvided && !validMarginPx(raw.tabletMarginPx))
          || (mobileProvided && !validMarginPx(raw.mobileMarginPx))) {
          issues.push({
            code: 'P15_RESPONSIVE_MARGIN_VALUE_INVALID',
            path,
            message: `Responsive margin must contain exact finite non-negative top/right/bottom/left px values between 0 and ${P15_NEUTRAL_EXPORT_MAX_SPACING_PX}.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletMarginPx: snapshotMargin(raw.tabletMarginPx as P15ElementorResponsiveMarginPx) }
            : {}),
          ...(mobileProvided
            ? { mobileMarginPx: snapshotMargin(raw.mobileMarginPx as P15ElementorResponsiveMarginPx) }
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
      'NO_RESPONSIVE_MARGIN_OVERRIDES',
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
        code: 'P15_RESPONSIVE_MARGIN_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_MARGIN_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletMarginPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet margin override.',
      });
      continue;
    }
    if (resolution.mobileMarginPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_MARGIN_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile margin override.',
      });
      continue;
    }

    if (resolution.tabletMarginPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE.tabletSettingKey] =
        elementorDimensions(resolution.tabletMarginPx);
    }
    if (resolution.mobileMarginPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE.mobileSettingKey] =
        elementorDimensions(resolution.mobileMarginPx);
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
        code: 'P15_RESPONSIVE_MARGIN_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive margin output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedMargins = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletMarginPx: entry.tabletMarginPx ? snapshotMargin(entry.tabletMarginPx) : null,
      mobileMarginPx: entry.mobileMarginPx ? snapshotMargin(entry.mobileMarginPx) : null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_MARGIN_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedMargins,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveMarginIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveMarginIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveMarginSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileMarginPx', 'sourceNodeId', 'tabletMarginPx'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletMarginPx === null || validMarginPx(entry.tabletMarginPx))
    && (entry.mobileMarginPx === null || validMarginPx(entry.mobileMarginPx))
    && (entry.tabletMarginPx !== null || entry.mobileMarginPx !== null);
}

/** Serialize only sanitized margin metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveMarginSummary(
  result: P15ElementorResponsiveMarginResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_MARGIN_OVERRIDES'
    || result.status === 'RESPONSIVE_MARGIN_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedMargins.length;
  const uniqueIds = new Set(result.resolvedMargins.map((entry) => entry.sourceNodeId)).size
    === result.resolvedMargins.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_MARGIN_OVERRIDES'
    || result.status === 'RESPONSIVE_MARGIN_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_MARGIN_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_MARGIN_OVERRIDES'
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
    || !result.resolvedMargins.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-margin result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_MARGIN_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedMargins: result.resolvedMargins.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_MARGIN_EVIDENCE,
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
