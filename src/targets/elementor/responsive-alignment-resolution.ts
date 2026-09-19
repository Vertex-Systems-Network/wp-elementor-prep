import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralCrossAlignment,
  type P15NeutralExportDocumentV1,
  type P15NeutralJustification,
} from './neutral-export-ir';
import { fingerprintP15NeutralExportDocument } from './neutral-export-ir-identity';
import {
  bindP15NeutralSourceToGeneratedContainers,
  cloneP15ReadyElementorTemplate,
  collectP15NeutralContainerNodes,
} from './responsive-container-binding';
import type { ElementorTemplateV04 } from './template-v04';
import { generateElementorV3TemplateCandidate } from './v3-template-generator';

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION =
  'p15-elementor-responsive-alignment-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION =
  'p15-elementor-responsive-alignment-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  flexContainerSourcePath: 'includes/controls/groups/flex-container.php',
  flexContainerSourceBlobSha: 'ce9e412e31b7710f33129ae35634ecb51e580d38',
  containerMockSourcePath: 'tests/qunit/mock/elments/container.json',
  containerMockSourceBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: 'flex',
  justifyControlName: 'justify_content',
  alignControlName: 'align_items',
  tabletJustifySettingKey: 'flex_justify_content_tablet',
  mobileJustifySettingKey: 'flex_justify_content_mobile',
  tabletAlignSettingKey: 'flex_align_items_tablet',
  mobileAlignSettingKey: 'flex_align_items_mobile',
});

export interface P15ElementorResponsiveAlignmentEntryV1 {
  sourceNodeId: string;
  tabletAlignItems?: P15NeutralCrossAlignment;
  mobileAlignItems?: P15NeutralCrossAlignment;
  tabletJustifyContent?: P15NeutralJustification;
  mobileJustifyContent?: P15NeutralJustification;
}

export interface P15ElementorResponsiveAlignmentManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveAlignmentEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveAlignmentIssueCode =
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_ENTRY_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_ALIGNMENT_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_ALIGNMENT_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_ALIGNMENT_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_ALIGNMENT_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveAlignmentIssueV1 {
  code: P15ElementorResponsiveAlignmentIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveAlignmentStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES'
  | 'RESPONSIVE_ALIGNMENTS_RESOLVED';

export interface P15ElementorResponsiveAlignmentSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignItems: P15NeutralCrossAlignment | null;
  mobileAlignItems: P15NeutralCrossAlignment | null;
  tabletJustifyContent: P15NeutralJustification | null;
  mobileJustifyContent: P15NeutralJustification | null;
}

export interface P15ElementorResponsiveAlignmentResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION;
  status: P15ElementorResponsiveAlignmentStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedAlignments: P15ElementorResponsiveAlignmentSummaryEntryV1[];
  issues: P15ElementorResponsiveAlignmentIssueV1[];
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

const ENTRY_KEYS = [
  'mobileAlignItems',
  'mobileJustifyContent',
  'sourceNodeId',
  'tabletAlignItems',
  'tabletJustifyContent',
] as const;

const CROSS_ALIGNMENTS: readonly P15NeutralCrossAlignment[] = [
  'start',
  'center',
  'end',
  'stretch',
];
const JUSTIFICATIONS: readonly P15NeutralJustification[] = [
  'start',
  'center',
  'end',
  'space-between',
  'space-around',
  'space-evenly',
];

const ISSUE_CODES: readonly P15ElementorResponsiveAlignmentIssueCode[] = [
  'P15_RESPONSIVE_ALIGNMENT_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_ALIGNMENT_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_ALIGNMENT_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_ALIGNMENT_ENTRIES_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_ENTRY_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_ALIGNMENT_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
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

function validCrossAlignment(value: unknown): value is P15NeutralCrossAlignment {
  return typeof value === 'string'
    && CROSS_ALIGNMENTS.includes(value as P15NeutralCrossAlignment);
}

function validJustification(value: unknown): value is P15NeutralJustification {
  return typeof value === 'string'
    && JUSTIFICATIONS.includes(value as P15NeutralJustification);
}

function mapCrossAlignment(value: P15NeutralCrossAlignment): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function mapJustification(value: P15NeutralJustification): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function baseResult(
  status: P15ElementorResponsiveAlignmentStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedAlignments: P15ElementorResponsiveAlignmentSummaryEntryV1[],
  issues: P15ElementorResponsiveAlignmentIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveAlignmentResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedAlignments.length,
    resolvedAlignments: resolvedAlignments.map((entry) => ({ ...entry })),
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
 * Apply only explicit default-breakpoint flex alignment overrides to exact generated container bindings.
 *
 * Omitted controls remain omitted. This contract does not synthesize inheritance, infer responsive
 * behavior, alter desktop alignment, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerAlignments(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveAlignmentResultV1 {
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
        code: 'P15_RESPONSIVE_ALIGNMENT_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_ALIGNMENT_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive alignment resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveAlignmentIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveAlignmentEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive alignment manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive alignment manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive alignment manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_ALIGNMENT_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive alignment resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_ALIGNMENT_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGNMENT_ENTRY_INVALID',
            path,
            message: 'Each responsive alignment entry may contain only sourceNodeId plus tablet/mobile align/justify overrides.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGNMENT_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive alignment sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGNMENT_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive alignment sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletAlignProvided = raw.tabletAlignItems !== undefined;
        const mobileAlignProvided = raw.mobileAlignItems !== undefined;
        const tabletJustifyProvided = raw.tabletJustifyContent !== undefined;
        const mobileJustifyProvided = raw.mobileJustifyContent !== undefined;

        if (!tabletAlignProvided
          && !mobileAlignProvided
          && !tabletJustifyProvided
          && !mobileJustifyProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGNMENT_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive alignment entry must explicitly provide at least one tablet/mobile alignment override.',
          });
          continue;
        }

        if ((tabletAlignProvided && !validCrossAlignment(raw.tabletAlignItems))
          || (mobileAlignProvided && !validCrossAlignment(raw.mobileAlignItems))
          || (tabletJustifyProvided && !validJustification(raw.tabletJustifyContent))
          || (mobileJustifyProvided && !validJustification(raw.mobileJustifyContent))) {
          issues.push({
            code: 'P15_RESPONSIVE_ALIGNMENT_VALUE_INVALID',
            path,
            message: 'Responsive alignItems/justifyContent value is outside the bounded neutral vocabulary.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletAlignProvided ? { tabletAlignItems: raw.tabletAlignItems as P15NeutralCrossAlignment } : {}),
          ...(mobileAlignProvided ? { mobileAlignItems: raw.mobileAlignItems as P15NeutralCrossAlignment } : {}),
          ...(tabletJustifyProvided ? { tabletJustifyContent: raw.tabletJustifyContent as P15NeutralJustification } : {}),
          ...(mobileJustifyProvided ? { mobileJustifyContent: raw.mobileJustifyContent as P15NeutralJustification } : {}),
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
      'NO_RESPONSIVE_ALIGNMENT_OVERRIDES',
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
        code: 'P15_RESPONSIVE_ALIGNMENT_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_ALIGNMENT_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requested = [
      [resolution.tabletAlignItems, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletAlignSettingKey],
      [resolution.mobileAlignItems, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileAlignSettingKey],
      [resolution.tabletJustifyContent, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletJustifySettingKey],
      [resolution.mobileJustifyContent, P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileJustifySettingKey],
    ] as const;

    let conflict = false;
    for (const [value, settingKey] of requested) {
      if (value !== undefined && Object.prototype.hasOwnProperty.call(target.settings, settingKey)) {
        issues.push({
          code: 'P15_RESPONSIVE_ALIGNMENT_EXISTING_OVERRIDE_CONFLICT',
          path: `$source.${sourceNodeId}`,
          message: `Generated base candidate already contains requested responsive alignment key ${settingKey}.`,
        });
        conflict = true;
      }
    }
    if (conflict) continue;

    if (resolution.tabletAlignItems !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletAlignSettingKey] =
        mapCrossAlignment(resolution.tabletAlignItems);
    }
    if (resolution.mobileAlignItems !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileAlignSettingKey] =
        mapCrossAlignment(resolution.mobileAlignItems);
    }
    if (resolution.tabletJustifyContent !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.tabletJustifySettingKey] =
        mapJustification(resolution.tabletJustifyContent);
    }
    if (resolution.mobileJustifyContent !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE.mobileJustifySettingKey] =
        mapJustification(resolution.mobileJustifyContent);
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
        code: 'P15_RESPONSIVE_ALIGNMENT_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive alignment output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignments = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletAlignItems: entry.tabletAlignItems ?? null,
      mobileAlignItems: entry.mobileAlignItems ?? null,
      tabletJustifyContent: entry.tabletJustifyContent ?? null,
      mobileJustifyContent: entry.mobileJustifyContent ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_ALIGNMENTS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedAlignments,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveAlignmentIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveAlignmentIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveAlignmentSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, [
      'mobileAlignItems',
      'mobileJustifyContent',
      'sourceNodeId',
      'tabletAlignItems',
      'tabletJustifyContent',
    ])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletAlignItems === null || validCrossAlignment(entry.tabletAlignItems))
    && (entry.mobileAlignItems === null || validCrossAlignment(entry.mobileAlignItems))
    && (entry.tabletJustifyContent === null || validJustification(entry.tabletJustifyContent))
    && (entry.mobileJustifyContent === null || validJustification(entry.mobileJustifyContent))
    && (
      entry.tabletAlignItems !== null
      || entry.mobileAlignItems !== null
      || entry.tabletJustifyContent !== null
      || entry.mobileJustifyContent !== null
    );
}

/** Serialize only sanitized alignment metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveAlignmentSummary(
  result: P15ElementorResponsiveAlignmentResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_ALIGNMENTS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedAlignments.length;
  const uniqueIds = new Set(result.resolvedAlignments.map((entry) => entry.sourceNodeId)).size
    === result.resolvedAlignments.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES'
    || result.status === 'RESPONSIVE_ALIGNMENTS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_ALIGNMENTS_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_ALIGNMENT_OVERRIDES'
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
    || !result.resolvedAlignments.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-alignment result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedAlignments: result.resolvedAlignments.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_ALIGNMENT_EVIDENCE,
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
