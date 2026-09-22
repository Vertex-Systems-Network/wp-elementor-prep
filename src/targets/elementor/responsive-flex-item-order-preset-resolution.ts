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

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-order-preset-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-order-preset-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MAX_ENTRIES = 10_000 as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  containerSourcePath: 'includes/elements/container.php',
  containerSourceBlobSha: '3486766b9565af99536ae205ed1936bb155daed0',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  qunitFixturePath: 'tests/qunit/mock/elments/container.json',
  qunitFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  controlName: 'order',
  desktopSettingKey: '_flex_order',
  tabletSettingKey: '_flex_order_tablet',
  mobileSettingKey: '_flex_order_mobile',
  startTargetValue: -99999,
  endTargetValue: 99999,
});

export type P15ElementorResponsiveOrderPreset = 'start' | 'end';

export interface P15ElementorResponsiveFlexItemOrderPresetEntryV1 {
  sourceNodeId: string;
  tabletOrderPreset?: P15ElementorResponsiveOrderPreset;
  mobileOrderPreset?: P15ElementorResponsiveOrderPreset;
}

export interface P15ElementorResponsiveFlexItemOrderPresetManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemOrderPresetEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemOrderPresetIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemOrderPresetIssueV1 {
  code: P15ElementorResponsiveFlexItemOrderPresetIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemOrderPresetStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED';

export interface P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderPreset: P15ElementorResponsiveOrderPreset | null;
  mobileOrderPreset: P15ElementorResponsiveOrderPreset | null;
}

export interface P15ElementorResponsiveFlexItemOrderPresetResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemOrderPresetStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOrders: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemOrderPresetIssueV1[];
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

const ENTRY_KEYS = ['mobileOrderPreset', 'sourceNodeId', 'tabletOrderPreset'] as const;
const ISSUE_CODES: readonly P15ElementorResponsiveFlexItemOrderPresetIssueCode[] = [
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRIES_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_VALUE_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED_CANDIDATE_INVALID',
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

function validOrderPreset(value: unknown): value is P15ElementorResponsiveOrderPreset {
  return value === 'start' || value === 'end';
}

function snapshotOrderPreset(value: P15ElementorResponsiveOrderPreset): P15ElementorResponsiveOrderPreset {
  return value;
}

function mapOrderPreset(value: P15ElementorResponsiveOrderPreset): number {
  return value === 'start'
    ? P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.startTargetValue
    : P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.endTargetValue;
}

function cloneSummaryEntry(
  entry: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1,
): P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1 {
  return {
    sourceNodeId: entry.sourceNodeId,
    tabletOrderPreset: entry.tabletOrderPreset === null ? null : snapshotOrderPreset(entry.tabletOrderPreset),
    mobileOrderPreset: entry.mobileOrderPreset === null ? null : snapshotOrderPreset(entry.mobileOrderPreset),
  };
}

function baseResult(
  status: P15ElementorResponsiveFlexItemOrderPresetStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedOrders: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1[],
  issues: P15ElementorResponsiveFlexItemOrderPresetIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFlexItemOrderPresetResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedOrders.length,
    resolvedOrders: resolvedOrders.map(cloneSummaryEntry),
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
 * Apply only explicit tablet/mobile flex-item order presets to exact generated container bindings.
 *
 * Omitted breakpoints remain omitted. This contract does not infer responsive order or parent flex context,
 * accept arbitrary numeric/custom order, change desktop order, position items, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerOrderPreset(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemOrderPresetResultV1 {
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive flex-item order preset resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFlexItemOrderPresetIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFlexItemOrderPresetEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive flex-item order preset manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item order preset manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive flex-item order preset manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item order preset resolution cannot grant inference/custom-order/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_ENTRY_INVALID',
            path,
            message: 'Each responsive flex-item order preset entry may contain only sourceNodeId plus tablet/mobile align-self values.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item order preset sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item order preset sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletProvided = raw.tabletOrderPreset !== undefined;
        const mobileProvided = raw.mobileOrderPreset !== undefined;
        if (!tabletProvided && !mobileProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive flex-item order preset entry must explicitly provide tabletOrderPreset and/or mobileOrderPreset.',
          });
          continue;
        }

        if ((tabletProvided && !validOrderPreset(raw.tabletOrderPreset))
          || (mobileProvided && !validOrderPreset(raw.mobileOrderPreset))) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_VALUE_INVALID',
            path,
            message: `Responsive flex-item order preset must be the explicit preset start or end.`,
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletProvided
            ? { tabletOrderPreset: snapshotOrderPreset(raw.tabletOrderPreset as P15ElementorResponsiveOrderPreset) }
            : {}),
          ...(mobileProvided
            ? { mobileOrderPreset: snapshotOrderPreset(raw.mobileOrderPreset as P15ElementorResponsiveOrderPreset) }
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
      'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    if (resolution.tabletOrderPreset !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.tabletSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a tablet flex-item order preset override.',
      });
      continue;
    }
    if (resolution.mobileOrderPreset !== undefined
      && Object.prototype.hasOwnProperty.call(
        target.settings,
        P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.mobileSettingKey,
      )) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EXISTING_OVERRIDE_CONFLICT',
        path: `$source.${sourceNodeId}`,
        message: 'Generated base candidate already contains a mobile flex-item order preset override.',
      });
      continue;
    }

    if (resolution.tabletOrderPreset !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.tabletSettingKey] =
        mapOrderPreset(resolution.tabletOrderPreset);
    }
    if (resolution.mobileOrderPreset !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE.mobileSettingKey] =
        mapOrderPreset(resolution.mobileOrderPreset);
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive flex-item order preset output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedOrders = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletOrderPreset: entry.tabletOrderPreset === undefined ? null : snapshotOrderPreset(entry.tabletOrderPreset),
      mobileOrderPreset: entry.mobileOrderPreset === undefined ? null : snapshotOrderPreset(entry.mobileOrderPreset),
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedOrders,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveFlexItemOrderPresetIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFlexItemOrderPresetIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFlexItemOrderPresetSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileOrderPreset', 'sourceNodeId', 'tabletOrderPreset'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletOrderPreset === null || validOrderPreset(entry.tabletOrderPreset))
    && (entry.mobileOrderPreset === null || validOrderPreset(entry.mobileOrderPreset))
    && (entry.tabletOrderPreset !== null || entry.mobileOrderPreset !== null);
}

/** Serialize only sanitized flex-item order preset metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemOrderPresetSummary(
  result: P15ElementorResponsiveFlexItemOrderPresetResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedOrders.length;
  const uniqueIds = new Set(result.resolvedOrders.map((entry) => entry.sourceNodeId)).size
    === result.resolvedOrders.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_OVERRIDES'
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
    || !result.resolvedOrders.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-flex-item order preset result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedOrders: result.resolvedOrders.map(cloneSummaryEntry),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_ORDER_PRESET_EVIDENCE,
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
