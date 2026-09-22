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

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-factors-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-factors-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  growControlName: 'grow',
  shrinkControlName: 'shrink',
  desktopGrowSettingKey: '_flex_grow',
  tabletGrowSettingKey: '_flex_grow_tablet',
  mobileGrowSettingKey: '_flex_grow_mobile',
  desktopShrinkSettingKey: '_flex_shrink',
  tabletShrinkSettingKey: '_flex_shrink_tablet',
  mobileShrinkSettingKey: '_flex_shrink_mobile',
  acceptedFactors: [0, 1] as const,
});

export type P15ElementorBinaryFlexFactor = 0 | 1;

export interface P15ElementorResponsiveFlexItemFactorsEntryV1 {
  sourceNodeId: string;
  tabletGrow?: P15ElementorBinaryFlexFactor;
  mobileGrow?: P15ElementorBinaryFlexFactor;
  tabletShrink?: P15ElementorBinaryFlexFactor;
  mobileShrink?: P15ElementorBinaryFlexFactor;
}

export interface P15ElementorResponsiveFlexItemFactorsManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemFactorsEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemFactorsIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemFactorsIssueV1 {
  code: P15ElementorResponsiveFlexItemFactorsIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemFactorsStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED';

export interface P15ElementorResponsiveFlexItemFactorsSummaryEntryV1 {
  sourceNodeId: string;
  tabletGrow: P15ElementorBinaryFlexFactor | null;
  mobileGrow: P15ElementorBinaryFlexFactor | null;
  tabletShrink: P15ElementorBinaryFlexFactor | null;
  mobileShrink: P15ElementorBinaryFlexFactor | null;
}

export interface P15ElementorResponsiveFlexItemFactorsResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemFactorsStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedFactors: P15ElementorResponsiveFlexItemFactorsSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemFactorsIssueV1[];
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
  'mobileGrow',
  'mobileShrink',
  'sourceNodeId',
  'tabletGrow',
  'tabletShrink',
] as const;

const ISSUE_CODES: readonly P15ElementorResponsiveFlexItemFactorsIssueCode[] = [
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRIES_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_VALUE_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED_CANDIDATE_INVALID',
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

function validBinaryFactor(value: unknown): value is P15ElementorBinaryFlexFactor {
  return value === 0 || value === 1;
}

function baseResult(
  status: P15ElementorResponsiveFlexItemFactorsStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedFactors: P15ElementorResponsiveFlexItemFactorsSummaryEntryV1[],
  issues: P15ElementorResponsiveFlexItemFactorsIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFlexItemFactorsResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedFactors.length,
    resolvedFactors: resolvedFactors.map((entry) => ({ ...entry })),
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
 * Apply only explicit binary tablet/mobile flex grow/shrink factors to exact generated container bindings.
 *
 * Omitted controls remain omitted. This contract does not infer parent flex context, synthesize inheritance,
 * accept arbitrary numeric factors, change desktop flex factors, reorder items, position items, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemFactors(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemFactorsResultV1 {
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive flex-item factor resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFlexItemFactorsIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFlexItemFactorsEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive flex-item factor manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item factor manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive flex-item factor manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item factor resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_ENTRY_INVALID',
            path,
            message: 'Each responsive flex-item factor entry may contain only sourceNodeId plus tablet/mobile grow/shrink factors.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item factor sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item factor sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletGrowProvided = raw.tabletGrow !== undefined;
        const mobileGrowProvided = raw.mobileGrow !== undefined;
        const tabletShrinkProvided = raw.tabletShrink !== undefined;
        const mobileShrinkProvided = raw.mobileShrink !== undefined;

        if (!tabletGrowProvided
          && !mobileGrowProvided
          && !tabletShrinkProvided
          && !mobileShrinkProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive flex-item factor entry must explicitly provide at least one tablet/mobile grow/shrink factor.',
          });
          continue;
        }

        if ((tabletGrowProvided && !validBinaryFactor(raw.tabletGrow))
          || (mobileGrowProvided && !validBinaryFactor(raw.mobileGrow))
          || (tabletShrinkProvided && !validBinaryFactor(raw.tabletShrink))
          || (mobileShrinkProvided && !validBinaryFactor(raw.mobileShrink))) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_VALUE_INVALID',
            path,
            message: 'Responsive flex-item grow/shrink factors are deliberately restricted to binary integer values 0 or 1.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletGrowProvided ? { tabletGrow: raw.tabletGrow as P15ElementorBinaryFlexFactor } : {}),
          ...(mobileGrowProvided ? { mobileGrow: raw.mobileGrow as P15ElementorBinaryFlexFactor } : {}),
          ...(tabletShrinkProvided ? { tabletShrink: raw.tabletShrink as P15ElementorBinaryFlexFactor } : {}),
          ...(mobileShrinkProvided ? { mobileShrink: raw.mobileShrink as P15ElementorBinaryFlexFactor } : {}),
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
      'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requested: Array<[P15ElementorBinaryFlexFactor | undefined, string]> = [
      [resolution.tabletGrow, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.tabletGrowSettingKey],
      [resolution.mobileGrow, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.mobileGrowSettingKey],
      [resolution.tabletShrink, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.tabletShrinkSettingKey],
      [resolution.mobileShrink, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.mobileShrinkSettingKey],
    ];

    let conflict = false;
    for (const [value, settingKey] of requested) {
      if (value !== undefined && Object.prototype.hasOwnProperty.call(target.settings, settingKey)) {
        issues.push({
          code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_EXISTING_OVERRIDE_CONFLICT',
          path: `$source.${sourceNodeId}`,
          message: `Generated base candidate already contains requested responsive flex-item factor key ${settingKey}.`,
        });
        conflict = true;
      }
    }
    if (conflict) continue;

    if (resolution.tabletGrow !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.tabletGrowSettingKey] = resolution.tabletGrow;
    }
    if (resolution.mobileGrow !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.mobileGrowSettingKey] = resolution.mobileGrow;
    }
    if (resolution.tabletShrink !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.tabletShrinkSettingKey] = resolution.tabletShrink;
    }
    if (resolution.mobileShrink !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE.mobileShrinkSettingKey] = resolution.mobileShrink;
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive flex-item factors output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedFactors = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletGrow: entry.tabletGrow ?? null,
      mobileGrow: entry.mobileGrow ?? null,
      tabletShrink: entry.tabletShrink ?? null,
      mobileShrink: entry.mobileShrink ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedFactors,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveFlexItemFactorsIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFlexItemFactorsIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFlexItemFactorsSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileGrow', 'mobileShrink', 'sourceNodeId', 'tabletGrow', 'tabletShrink'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletGrow === null || validBinaryFactor(entry.tabletGrow))
    && (entry.mobileGrow === null || validBinaryFactor(entry.mobileGrow))
    && (entry.tabletShrink === null || validBinaryFactor(entry.tabletShrink))
    && (entry.mobileShrink === null || validBinaryFactor(entry.mobileShrink))
    && (
      entry.tabletGrow !== null
      || entry.mobileGrow !== null
      || entry.tabletShrink !== null
      || entry.mobileShrink !== null
    );
}

/** Serialize only sanitized flex-item factor metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemFactorsSummary(
  result: P15ElementorResponsiveFlexItemFactorsResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedFactors.length;
  const uniqueIds = new Set(result.resolvedFactors.map((entry) => entry.sourceNodeId)).size
    === result.resolvedFactors.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FLEX_ITEM_FACTORS_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FLEX_ITEM_FACTOR_OVERRIDES'
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
    || !result.resolvedFactors.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-flex-item-factors result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedFactors: result.resolvedFactors.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_FACTORS_EVIDENCE,
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
