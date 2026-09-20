import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  P15_NEUTRAL_EXPORT_MAX_RADIUS_PX,
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

export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION =
  'p15-elementor-responsive-border-radius-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION =
  'p15-elementor-responsive-border-radius-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  controlsStackSourcePath: 'includes/base/controls-stack.php',
  controlsStackSourceBlobSha: '00b280e518b89925c8f85a059b34136177ff3d4d',
  controlName: 'border_radius',
  desktopSettingKey: 'border_radius',
  tabletSettingKey: 'border_radius_tablet',
  mobileSettingKey: 'border_radius_mobile',
});

export interface P15ElementorResponsiveBorderRadiusEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx?: number;
  mobileCornerRadiusPx?: number;
}

export interface P15ElementorResponsiveBorderRadiusManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveBorderRadiusEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveBorderRadiusIssueCode =
  | 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_BORDER_RADIUS_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_ENTRY_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_BORDER_RADIUS_VALUE_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_BORDER_RADIUS_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_BORDER_RADIUS_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_BORDER_RADIUS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_BORDER_RADIUS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveBorderRadiusIssueV1 {
  code: P15ElementorResponsiveBorderRadiusIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveBorderRadiusStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES'
  | 'RESPONSIVE_BORDER_RADIUS_RESOLVED';

export interface P15ElementorResponsiveBorderRadiusSummaryEntryV1 {
  sourceNodeId: string;
  tabletCornerRadiusPx: number | null;
  mobileCornerRadiusPx: number | null;
}

export interface P15ElementorResponsiveBorderRadiusResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION;
  status: P15ElementorResponsiveBorderRadiusStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedBorderRadii: P15ElementorResponsiveBorderRadiusSummaryEntryV1[];
  issues: P15ElementorResponsiveBorderRadiusIssueV1[];
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

const ENTRY_KEYS = ['mobileCornerRadiusPx', 'sourceNodeId', 'tabletCornerRadiusPx'] as const;
const ISSUE_CODES: readonly P15ElementorResponsiveBorderRadiusIssueCode[] = [
  'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_BORDER_RADIUS_ENTRIES_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_ENTRY_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_BORDER_RADIUS_VALUE_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_BORDER_RADIUS_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_BORDER_RADIUS_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_BORDER_RADIUS_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_BORDER_RADIUS_RESOLVED_CANDIDATE_INVALID',
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

function validCornerRadiusPx(value: unknown): value is number {
  return typeof value === 'number'
    && Number.isFinite(value)
    && Number.isInteger(value)
    && value >= 0
    && value <= P15_NEUTRAL_EXPORT_MAX_RADIUS_PX;
}

function snapshotCornerRadius(value: number): number {
  return value;
}

function elementorDimensions(value: number): Record<string, unknown> {
  return {
    unit: 'px',
    top: String(value),
    right: String(value),
    bottom: String(value),
    left: String(value),
    isLinked: true,
  };
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveBorderRadiusSummaryEntryV1,
): P15ElementorResponsiveBorderRadiusSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletCornerRadiusPx: entry.tabletCornerRadiusPx === null ? null : snapshotCornerRadius(entry.tabletCornerRadiusPx),
    mobileCornerRadiusPx: entry.mobileCornerRadiusPx === null ? null : snapshotCornerRadius(entry.mobileCornerRadiusPx),
  };
}

function baseResult(
  status: P15ElementorResponsiveBorderRadiusStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedBorderRadii: P15ElementorResponsiveBorderRadiusSummaryEntryV1[],
  issues: P15ElementorResponsiveBorderRadiusIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveBorderRadiusResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedBorderRadii.length,
    resolvedBorderRadii: resolvedBorderRadii.map(cloneSummaryEntry),
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
 * Apply only explicit default tablet/mobile uniform px border-radius overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive border radius, convert units,
 * change desktop border radius, introduce negative radius values, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerBorderRadius(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveBorderRadiusResultV1 {
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive border radius resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveBorderRadiusIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveBorderRadiusEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive border radius manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive border radius manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive border radius manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive border radius resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_BORDER_RADIUS_ENTRY_INVALID',
            path,
            message: 'Each responsive border radius entry may contain only sourceNodeId plus tablet/mobile border-radius values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_BORDER_RADIUS_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive border radius sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_BORDER_RADIUS_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive border radius sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletCornerRadiusPx !== undefined;
        const mobileProvided = raw.mobileCornerRadiusPx !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_BORDER_RADIUS_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive border radius entry must explicitly provide tabletCornerRadiusPx and/or mobileCornerRadiusPx.',
          });
          continue;
        }

        if ((tabletProvided && !validCornerRadiusPx(raw.tabletCornerRadiusPx))
          || (mobileProvided && !validCornerRadiusPx(raw.mobileCornerRadiusPx))) {
          issues.push({
            code: 'P15_RESPONSIVE_BORDER_RADIUS_VALUE_INVALID',
            path,
            message: `Responsive border radius must be an integer px value between 0 and ${P15_NEUTRAL_EXPORT_MAX_RADIUS_PX}.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletCornerRadiusPx: snapshotCornerRadius(raw.tabletCornerRadiusPx as number) }
            : {}),
          ...(mobileProvided
            ? { mobileCornerRadiusPx: snapshotCornerRadius(raw.mobileCornerRadiusPx as number) }
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
      'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES',
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletCornerRadiusPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet border-radius override.',
      });
      continue;
    }
    if (resolution.mobileCornerRadiusPx !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_BORDER_RADIUS_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile border-radius override.',
      });
      continue;
    }

    if (resolution.tabletCornerRadiusPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE.tabletSettingKey] =
        elementorDimensions(resolution.tabletCornerRadiusPx);
    }
    if (resolution.mobileCornerRadiusPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE.mobileSettingKey] =
        elementorDimensions(resolution.mobileCornerRadiusPx);
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
        code: 'P15_RESPONSIVE_BORDER_RADIUS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive border radius output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedBorderRadii = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletCornerRadiusPx: entry.tabletCornerRadiusPx === undefined ? null : snapshotCornerRadius(entry.tabletCornerRadiusPx),
      mobileCornerRadiusPx: entry.mobileCornerRadiusPx === undefined ? null : snapshotCornerRadius(entry.mobileCornerRadiusPx),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_BORDER_RADIUS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedBorderRadii,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveBorderRadiusIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveBorderRadiusIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveBorderRadiusSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileCornerRadiusPx', 'sourceNodeId', 'tabletCornerRadiusPx'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletCornerRadiusPx === null || validCornerRadiusPx(entry.tabletCornerRadiusPx))
    && (entry.mobileCornerRadiusPx === null || validCornerRadiusPx(entry.mobileCornerRadiusPx))
    && (entry.tabletCornerRadiusPx !== null || entry.mobileCornerRadiusPx !== null);
}

/** Serialize only sanitized border-radius metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveBorderRadiusSummary(
  result: P15ElementorResponsiveBorderRadiusResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES'
    || result.status === 'RESPONSIVE_BORDER_RADIUS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedBorderRadii.length;
  const uniqueIds = new Set(result.resolvedBorderRadii.map((entry) => entry.sourceNodeId)).size
    === result.resolvedBorderRadii.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES'
    || result.status === 'RESPONSIVE_BORDER_RADIUS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_BORDER_RADIUS_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_BORDER_RADIUS_OVERRIDES'
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
    || !result.resolvedBorderRadii.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-border-radius result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedBorderRadii: result.resolvedBorderRadii.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_BORDER_RADIUS_EVIDENCE,
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
