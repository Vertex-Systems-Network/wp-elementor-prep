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

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-basis-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-basis-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  containerFixturePath: 'tests/qunit/mock/elments/container.json',
  containerFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  basisTypeControlName: 'basis_type',
  basisControlName: 'basis',
  tabletBasisTypeSettingKey: '_flex_basis_type_tablet',
  mobileBasisTypeSettingKey: '_flex_basis_type_mobile',
  tabletBasisSettingKey: '_flex_basis_tablet',
  mobileBasisSettingKey: '_flex_basis_mobile',
  acceptedUnit: 'px',
  acceptedSizeRange: [0, 1000] as const,
});

export type P15ElementorFlexBasisPx = number;
export type P15ElementorFlexBasisCustom = true;

export interface P15ElementorResponsiveFlexItemBasisEntryV1 {
  sourceNodeId: string;
  tabletBasisCustom?: P15ElementorFlexBasisCustom;
  mobileBasisCustom?: P15ElementorFlexBasisCustom;
  tabletBasisPx?: P15ElementorFlexBasisPx;
  mobileBasisPx?: P15ElementorFlexBasisPx;
}

export interface P15ElementorResponsiveFlexItemBasisManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemBasisEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemBasisIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemBasisIssueV1 {
  code: P15ElementorResponsiveFlexItemBasisIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemBasisStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED';

export interface P15ElementorResponsiveFlexItemBasisSummaryEntryV1 {
  sourceNodeId: string;
  tabletBasisCustom: P15ElementorFlexBasisCustom | null;
  mobileBasisCustom: P15ElementorFlexBasisCustom | null;
  tabletBasisPx: P15ElementorFlexBasisPx | null;
  mobileBasisPx: P15ElementorFlexBasisPx | null;
}

export interface P15ElementorResponsiveFlexItemBasisResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemBasisStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedBasis: P15ElementorResponsiveFlexItemBasisSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemBasisIssueV1[];
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
  'mobileBasisCustom',
  'mobileBasisPx',
  'sourceNodeId',
  'tabletBasisCustom',
  'tabletBasisPx',
] as const;

const ISSUE_CODES: readonly P15ElementorResponsiveFlexItemBasisIssueCode[] = [
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRIES_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_VALUE_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED_CANDIDATE_INVALID',
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

function validFlexBasisPx(value: unknown): value is P15ElementorFlexBasisPx {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= 1000;
}

function validCustomBasisType(value: unknown): value is P15ElementorFlexBasisCustom {
  return value === true;
}

function baseResult(
  status: P15ElementorResponsiveFlexItemBasisStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedBasis: P15ElementorResponsiveFlexItemBasisSummaryEntryV1[],
  issues: P15ElementorResponsiveFlexItemBasisIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFlexItemBasisResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedBasis.length,
    resolvedBasis: resolvedBasis.map((entry) => ({ ...entry })),
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
 * Apply only explicit tablet/mobile custom flex basis px pairs to exact generated container bindings.
 *
 * Omitted controls remain omitted. This contract does not infer parent flex context, synthesize inheritance,
 * accept non-integer, negative, or over-1000 px values, change desktop flex basis, reorder items, position items, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemBasis(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemBasisResultV1 {
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive flex-item basis resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFlexItemBasisIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFlexItemBasisEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive flex-item basis manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item basis manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive flex-item basis manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item basis resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_ENTRY_INVALID',
            path,
            message: 'Each responsive flex-item basis entry may contain only sourceNodeId plus tablet/mobile custom-basis type/value pairs.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item basis sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item basis sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletBasisCustomProvided = raw.tabletBasisCustom !== undefined;
        const mobileBasisCustomProvided = raw.mobileBasisCustom !== undefined;
        const tabletBasisPxProvided = raw.tabletBasisPx !== undefined;
        const mobileBasisPxProvided = raw.mobileBasisPx !== undefined;

        if (!tabletBasisCustomProvided && !mobileBasisCustomProvided && !tabletBasisPxProvided && !mobileBasisPxProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive flex-item basis entry must explicitly provide a complete tablet or mobile custom-basis type/value pair.',
          });
          continue;
        }

        if ((tabletBasisCustomProvided && !validCustomBasisType(raw.tabletBasisCustom))
          || (mobileBasisCustomProvided && !validCustomBasisType(raw.mobileBasisCustom))
          || (tabletBasisPxProvided && !validFlexBasisPx(raw.tabletBasisPx))
          || (mobileBasisPxProvided && !validFlexBasisPx(raw.mobileBasisPx))
          || (tabletBasisCustomProvided !== tabletBasisPxProvided)
          || (mobileBasisCustomProvided !== mobileBasisPxProvided)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_VALUE_INVALID',
            path,
            message: 'Responsive flex-item custom basis must use type custom and a finite integer px size from 0 through 1000.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletBasisCustomProvided ? { tabletBasisCustom: raw.tabletBasisCustom as P15ElementorFlexBasisCustom } : {}),
          ...(mobileBasisCustomProvided ? { mobileBasisCustom: raw.mobileBasisCustom as P15ElementorFlexBasisCustom } : {}),
          ...(tabletBasisPxProvided ? { tabletBasisPx: raw.tabletBasisPx as P15ElementorFlexBasisPx } : {}),
          ...(mobileBasisPxProvided ? { mobileBasisPx: raw.mobileBasisPx as P15ElementorFlexBasisPx } : {}),
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
      'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requested: Array<[unknown, string]> = [
      [resolution.tabletBasisCustom, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.tabletBasisTypeSettingKey],
      [resolution.mobileBasisCustom, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.mobileBasisTypeSettingKey],
      [resolution.tabletBasisPx, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.tabletBasisSettingKey],
      [resolution.mobileBasisPx, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.mobileBasisSettingKey],
    ];

    let conflict = false;
    for (const [value, settingKey] of requested) {
      if (value !== undefined && Object.prototype.hasOwnProperty.call(target.settings, settingKey)) {
        issues.push({
          code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_EXISTING_OVERRIDE_CONFLICT',
          path: `$source.${sourceNodeId}`,
          message: `Generated base candidate already contains requested responsive flex-item basis key ${settingKey}.`,
        });
        conflict = true;
      }
    }
    if (conflict) continue;

    if (resolution.tabletBasisCustom !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.tabletBasisTypeSettingKey] = 'custom';
    }
    if (resolution.mobileBasisCustom !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.mobileBasisTypeSettingKey] = 'custom';
    }
    if (resolution.tabletBasisPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.tabletBasisSettingKey] = { size: resolution.tabletBasisPx, unit: 'px' };
    }
    if (resolution.mobileBasisPx !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE.mobileBasisSettingKey] = { size: resolution.mobileBasisPx, unit: 'px' };
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive flex-item basis output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedBasis = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletBasisCustom: entry.tabletBasisCustom ?? null,
      mobileBasisCustom: entry.mobileBasisCustom ?? null,
      tabletBasisPx: entry.tabletBasisPx ?? null,
      mobileBasisPx: entry.mobileBasisPx ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedBasis,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveFlexItemBasisIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFlexItemBasisIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFlexItemBasisSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileBasisCustom', 'mobileBasisPx', 'sourceNodeId', 'tabletBasisCustom', 'tabletBasisPx'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletBasisCustom === null || entry.tabletBasisCustom === true)
    && (entry.mobileBasisCustom === null || entry.mobileBasisCustom === true)
    && (entry.tabletBasisPx === null || validFlexBasisPx(entry.tabletBasisPx))
    && (entry.mobileBasisPx === null || validFlexBasisPx(entry.mobileBasisPx))
    && ((entry.tabletBasisCustom === null) === (entry.tabletBasisPx === null))
    && ((entry.mobileBasisCustom === null) === (entry.mobileBasisPx === null))
    && (
      entry.tabletBasisCustom !== null
      || entry.mobileBasisCustom !== null
      || entry.tabletBasisPx !== null
      || entry.mobileBasisPx !== null
    );
}

/** Serialize only sanitized flex-item basis metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemBasisSummary(
  result: P15ElementorResponsiveFlexItemBasisResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedBasis.length;
  const uniqueIds = new Set(result.resolvedBasis.map((entry) => entry.sourceNodeId)).size
    === result.resolvedBasis.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FLEX_ITEM_BASIS_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FLEX_ITEM_BASIS_OVERRIDES'
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
    || !result.resolvedBasis.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-flex-item-basis result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedBasis: result.resolvedBasis.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_BASIS_EVIDENCE,
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
