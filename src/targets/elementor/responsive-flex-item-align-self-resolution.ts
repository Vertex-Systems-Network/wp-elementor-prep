import {
  buildElementorTemplateCandidateArtifact,
  type ElementorTemplateCandidateArtifactV1,
} from './candidate-artifact';
import { buildElementorTemplateCandidateIdentity } from './import-validation-contract';
import {
  validateP15NeutralExportDocument,
  type P15NeutralCrossAlignment,
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

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-align-self-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-align-self-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  controlName: 'align_self',
  desktopSettingKey: '_flex_align_self',
  tabletSettingKey: '_flex_align_self_tablet',
  mobileSettingKey: '_flex_align_self_mobile',
  targetValues: ['flex-start', 'center', 'flex-end', 'stretch'] as const,
});

export interface P15ElementorResponsiveFlexItemAlignSelfEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf?: P15NeutralCrossAlignment;
  mobileAlignSelf?: P15NeutralCrossAlignment;
}

export interface P15ElementorResponsiveFlexItemAlignSelfManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemAlignSelfEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemAlignSelfIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemAlignSelfIssueV1 {
  code: P15ElementorResponsiveFlexItemAlignSelfIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemAlignSelfStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED';

export interface P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1 {
  sourceNodeId: string;
  tabletAlignSelf: P15NeutralCrossAlignment | null;
  mobileAlignSelf: P15NeutralCrossAlignment | null;
}

export interface P15ElementorResponsiveFlexItemAlignSelfResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemAlignSelfStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedAlignments: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemAlignSelfIssueV1[];
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

const ENTRY_KEYS = ['mobileAlignSelf', 'sourceNodeId', 'tabletAlignSelf'] as const;
const ISSUE_CODES: readonly P15ElementorResponsiveFlexItemAlignSelfIssueCode[] = [
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRIES_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_VALUE_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED_CANDIDATE_INVALID',
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

function validAlignSelf(value: unknown): value is P15NeutralCrossAlignment {
  return typeof value === 'string'
    && ['start', 'center', 'end', 'stretch'].includes(value);
}

function snapshotAlignSelf(value: P15NeutralCrossAlignment): P15NeutralCrossAlignment {
  return value;
}

function mapAlignSelf(value: P15NeutralCrossAlignment): string {
  if (value === 'start') return 'flex-start';
  if (value === 'end') return 'flex-end';
  return value;
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1,
): P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletAlignSelf: entry.tabletAlignSelf === null ? null : snapshotAlignSelf(entry.tabletAlignSelf),
    mobileAlignSelf: entry.mobileAlignSelf === null ? null : snapshotAlignSelf(entry.mobileAlignSelf),
  };
}

function baseResult(
  status: P15ElementorResponsiveFlexItemAlignSelfStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedAlignments: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1[],
  issues: P15ElementorResponsiveFlexItemAlignSelfIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFlexItemAlignSelfResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedAlignments.length,
    resolvedAlignments: resolvedAlignments.map(cloneSummaryEntry),
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
 * Apply only explicit default tablet/mobile explicit flex-item align-self overrides to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive flex-item align-self, synthesize inheritance,
 * convert units, parse CSS/custom values, change desktop flex-item align-self, permit negative/fractional values,
 * or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerAlignSelf(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemAlignSelfResultV1 {
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive flex-item align-self resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFlexItemAlignSelfIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFlexItemAlignSelfEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive flex-item align-self manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item align-self manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive flex-item align-self manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item align-self resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_ENTRY_INVALID',
            path,
            message: 'Each responsive flex-item align-self entry may contain only sourceNodeId plus tablet/mobile align-self values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item align-self sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item align-self sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletAlignSelf !== undefined;
        const mobileProvided = raw.mobileAlignSelf !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive flex-item align-self entry must explicitly provide tabletAlignSelf and/or mobileAlignSelf.',
          });
          continue;
        }

        if ((tabletProvided && !validAlignSelf(raw.tabletAlignSelf))
          || (mobileProvided && !validAlignSelf(raw.mobileAlignSelf))) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_VALUE_INVALID',
            path,
            message: `Responsive flex-item align-self must be start, center, end or stretch.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletAlignSelf: snapshotAlignSelf(raw.tabletAlignSelf as P15NeutralCrossAlignment) }
            : {}),
          ...(mobileProvided
            ? { mobileAlignSelf: snapshotAlignSelf(raw.mobileAlignSelf as P15NeutralCrossAlignment) }
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
      'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletAlignSelf !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet flex-item align-self override.',
      });
      continue;
    }
    if (resolution.mobileAlignSelf !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile flex-item align-self override.',
      });
      continue;
    }

    if (resolution.tabletAlignSelf !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE.tabletSettingKey] =
        mapAlignSelf(resolution.tabletAlignSelf);
    }
    if (resolution.mobileAlignSelf !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE.mobileSettingKey] =
        mapAlignSelf(resolution.mobileAlignSelf);
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive flex-item align-self output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedAlignments = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletAlignSelf: entry.tabletAlignSelf === undefined ? null : snapshotAlignSelf(entry.tabletAlignSelf),
      mobileAlignSelf: entry.mobileAlignSelf === undefined ? null : snapshotAlignSelf(entry.mobileAlignSelf),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED',
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

function validIssue(issue: P15ElementorResponsiveFlexItemAlignSelfIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFlexItemAlignSelfIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFlexItemAlignSelfSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileAlignSelf', 'sourceNodeId', 'tabletAlignSelf'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletAlignSelf === null || validAlignSelf(entry.tabletAlignSelf))
    && (entry.mobileAlignSelf === null || validAlignSelf(entry.mobileAlignSelf))
    && (entry.tabletAlignSelf !== null || entry.mobileAlignSelf !== null);
}

/** Serialize only sanitized flex-item align-self metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemAlignSelfSummary(
  result: P15ElementorResponsiveFlexItemAlignSelfResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED';
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
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_OVERRIDES'
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
    throw new Error('Invalid or authority-inflated P15 responsive-flex-item align-self result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedAlignments: result.resolvedAlignments.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ALIGN_SELF_EVIDENCE,
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
