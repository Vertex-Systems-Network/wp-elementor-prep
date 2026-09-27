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

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION =
  'p15-elementor-responsive-flex-item-custom-order-manifest-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION =
  'p15-elementor-responsive-flex-item-custom-order-result-v1' as const;
export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MAX_ENTRIES = 10_000 as const;

export const P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE = Object.freeze({
  elementorVersion: '4.2.4',
  elementorTagCommitSha: '0e292207b5b45f0e22603967ae41c0374211160d',
  flexItemSourcePath: 'includes/controls/groups/flex-item.php',
  flexItemSourceBlobSha: 'dc95ad439d8f9acfd5eefb1d129da67d9ff9c13a',
  containerFixturePath: 'tests/qunit/mock/elments/container.json',
  containerFixtureBlobSha: 'f06c5f60afa8fbef34ed922af419284cece09692',
  groupName: '_flex',
  orderControlName: 'order',
  customOrderControlName: 'order_custom',
  tabletOrderSettingKey: '_flex_order_tablet',
  mobileOrderSettingKey: '_flex_order_mobile',
  tabletCustomOrderSettingKey: '_flex_order_custom_tablet',
  mobileCustomOrderSettingKey: '_flex_order_custom_mobile',
  repositoryAcceptedValueRange: [-1000, 1000] as const,
  controlledTargetRoundtripPr: 827,
  controlledTargetRenderPr: 828,
});

export type P15ElementorFlexOrderValue = number;
export type P15ElementorFlexOrderCustom = true;

export interface P15ElementorResponsiveFlexItemCustomOrderEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom?: P15ElementorFlexOrderCustom;
  mobileOrderCustom?: P15ElementorFlexOrderCustom;
  tabletOrderValue?: P15ElementorFlexOrderValue;
  mobileOrderValue?: P15ElementorFlexOrderValue;
}

export interface P15ElementorResponsiveFlexItemCustomOrderManifestV1 {
  schemaVersion: 1;
  manifestVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION;
  sourceIrFingerprint: string;
  baseCandidateIdentityDigest: string;
  containers: P15ElementorResponsiveFlexItemCustomOrderEntryV1[];
  responsiveInferencePerformed: false;
  figmaMutation: false;
  networkAccess: false;
  responsiveClosureClaim: false;
  targetCompatibilityClaim: false;
  productionAcceptance: false;
  downloadEnabled: false;
}

export type P15ElementorResponsiveFlexItemCustomOrderIssueCode =
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_IR_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_UPSTREAM_GENERATION_NOT_READY'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_NOT_OBJECT'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_FIELDS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRIES_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRY_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_DUPLICATE_SOURCE_ID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_NOT_CONTAINER'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_VALUE_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDE_REQUIRED'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_AUTHORITY_FLAGS_INVALID'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_GENERATOR_BINDING_MISMATCH'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EXISTING_OVERRIDE_CONFLICT'
  | 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED_CANDIDATE_INVALID';

export interface P15ElementorResponsiveFlexItemCustomOrderIssueV1 {
  code: P15ElementorResponsiveFlexItemCustomOrderIssueCode;
  path: string;
  message: string;
}

export type P15ElementorResponsiveFlexItemCustomOrderStatus =
  | 'BLOCKED_INVALID_SOURCE_IR'
  | 'BLOCKED_UPSTREAM_GENERATION'
  | 'REJECTED_INVALID_MANIFEST'
  | 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES'
  | 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED';

export interface P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1 {
  sourceNodeId: string;
  tabletOrderCustom: P15ElementorFlexOrderCustom | null;
  mobileOrderCustom: P15ElementorFlexOrderCustom | null;
  tabletOrderValue: P15ElementorFlexOrderValue | null;
  mobileOrderValue: P15ElementorFlexOrderValue | null;
}

export interface P15ElementorResponsiveFlexItemCustomOrderResultV1 {
  schemaVersion: 1;
  resultVersion: typeof P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION;
  status: P15ElementorResponsiveFlexItemCustomOrderStatus;
  sourceIrFingerprint: string | null;
  baseCandidateIdentityDigest: string | null;
  resolvedCandidateIdentityDigest: string | null;
  sourceContainerCount: number;
  resolvedContainerCount: number;
  resolvedOrder: P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1[];
  issues: P15ElementorResponsiveFlexItemCustomOrderIssueV1[];
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
  'mobileOrderCustom',
  'mobileOrderValue',
  'sourceNodeId',
  'tabletOrderCustom',
  'tabletOrderValue',
] as const;

const ISSUE_CODES: readonly P15ElementorResponsiveFlexItemCustomOrderIssueCode[] = [
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_IR_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_UPSTREAM_GENERATION_NOT_READY',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_NOT_OBJECT',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_FIELDS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRIES_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRY_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_DUPLICATE_SOURCE_ID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_NOT_CONTAINER',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_VALUE_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDE_REQUIRED',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_AUTHORITY_FLAGS_INVALID',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_GENERATOR_BINDING_MISMATCH',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EXISTING_OVERRIDE_CONFLICT',
  'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED_CANDIDATE_INVALID',
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

function validFlexOrderValue(value: unknown): value is P15ElementorFlexOrderValue {
  return Number.isSafeInteger(value) && (value as number) >= -1000 && (value as number) <= 1000;
}

function validCustomOrderType(value: unknown): value is P15ElementorFlexOrderCustom {
  return value === true;
}

function baseResult(
  status: P15ElementorResponsiveFlexItemCustomOrderStatus,
  sourceIrFingerprint: string | null,
  baseCandidateIdentityDigest: string | null,
  resolvedCandidateIdentityDigest: string | null,
  sourceContainerCount: number,
  resolvedOrder: P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1[],
  issues: P15ElementorResponsiveFlexItemCustomOrderIssueV1[],
  template: ElementorTemplateV04 | null,
  candidate: ElementorTemplateCandidateArtifactV1 | null,
): P15ElementorResponsiveFlexItemCustomOrderResultV1 {
  return {
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION,
    status,
    sourceIrFingerprint,
    baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest,
    sourceContainerCount,
    resolvedContainerCount: resolvedOrder.length,
    resolvedOrder: resolvedOrder.map((entry) => ({ ...entry })),
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
 * Apply only explicit tablet/mobile custom flex order value pairs to exact generated container bindings.
 *
 * Omitted controls remain omitted. This contract does not infer parent flex context, synthesize inheritance,
 * accept non-integer, out-of-range custom order values, change desktop flex order, infer responsive order, position items, or claim responsive closure.
 */
export function resolveP15ElementorResponsiveContainerFlexItemCustomOrder(
  sourceValue: unknown,
  manifestValue: unknown,
): P15ElementorResponsiveFlexItemCustomOrderResultV1 {
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_IR_INVALID' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_UPSTREAM_GENERATION_NOT_READY',
        path: '$source',
        message: 'Responsive flex-item custom order resolution requires an existing review-free generated local candidate.',
      }],
      null,
      null,
    );
  }

  const baseIdentity = buildElementorTemplateCandidateIdentity(baseGeneration.candidate);
  const issues: P15ElementorResponsiveFlexItemCustomOrderIssueV1[] = [];
  const resolutions = new Map<string, P15ElementorResponsiveFlexItemCustomOrderEntryV1>();

  if (!isRecord(manifestValue)) {
    issues.push({
      code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_NOT_OBJECT',
      path: '$manifest',
      message: 'Responsive flex-item custom order manifest must be an object.',
    });
  } else {
    if (!exactKeys(manifestValue, MANIFEST_KEYS)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_FIELDS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item custom order manifest contains unknown or missing fields.',
      });
    }
    if (manifestValue.schemaVersion !== 1
      || manifestValue.manifestVersion !== P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MANIFEST_VERSION_INVALID',
        path: '$manifest.manifestVersion',
        message: 'Responsive flex-item custom order manifest schema/version is unsupported.',
      });
    }
    if (!validFingerprint(manifestValue.sourceIrFingerprint)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_INVALID',
        path: '$manifest.sourceIrFingerprint',
        message: 'sourceIrFingerprint must be a SHA-256 fingerprint.',
      });
    } else if (manifestValue.sourceIrFingerprint !== sourceIrFingerprint) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_FINGERPRINT_MISMATCH',
        path: '$manifest.sourceIrFingerprint',
        message: 'Manifest is not bound to the exact current neutral IR.',
      });
    }
    if (!validFingerprint(manifestValue.baseCandidateIdentityDigest)) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_INVALID',
        path: '$manifest.baseCandidateIdentityDigest',
        message: 'baseCandidateIdentityDigest must be a SHA-256 candidate identity digest.',
      });
    } else if (manifestValue.baseCandidateIdentityDigest !== baseIdentity.digest) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_BASE_CANDIDATE_IDENTITY_MISMATCH',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_AUTHORITY_FLAGS_INVALID',
        path: '$manifest',
        message: 'Responsive flex-item custom order resolution cannot grant inference/mutation/network/closure/compatibility/production/download authority.',
      });
    }

    if (!Array.isArray(manifestValue.containers)
      || manifestValue.containers.length > P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MAX_ENTRIES) {
      issues.push({
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRIES_INVALID',
        path: '$manifest.containers',
        message: `containers must be an array of at most ${P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_MAX_ENTRIES} entries.`,
      });
    } else {
      for (let index = 0; index < manifestValue.containers.length; index += 1) {
        const raw = manifestValue.containers[index];
        const path = `$manifest.containers[${index}]`;

        if (!isRecord(raw)
          || !onlyAllowedKeys(raw, ENTRY_KEYS)
          || !validSourceNodeId(raw.sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_ENTRY_INVALID',
            path,
            message: 'Each responsive flex-item custom order entry may contain only sourceNodeId plus tablet/mobile custom-order type/value pairs.',
          });
          continue;
        }

        const sourceNodeId = raw.sourceNodeId;
        if (resolutions.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_DUPLICATE_SOURCE_ID',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item custom order sourceNodeId must be unique.',
          });
          continue;
        }
        if (!sourceContainers.has(sourceNodeId)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_SOURCE_NOT_CONTAINER',
            path: `${path}.sourceNodeId`,
            message: 'Responsive flex-item custom order sourceNodeId must identify an existing neutral container node.',
          });
          continue;
        }

        const tabletOrderCustomProvided = raw.tabletOrderCustom !== undefined;
        const mobileOrderCustomProvided = raw.mobileOrderCustom !== undefined;
        const tabletOrderValueProvided = raw.tabletOrderValue !== undefined;
        const mobileOrderValueProvided = raw.mobileOrderValue !== undefined;

        if (!tabletOrderCustomProvided && !mobileOrderCustomProvided && !tabletOrderValueProvided && !mobileOrderValueProvided) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDE_REQUIRED',
            path,
            message: 'Each responsive flex-item custom order entry must explicitly provide a complete tablet or mobile custom-order type/value pair.',
          });
          continue;
        }

        if ((tabletOrderCustomProvided && !validCustomOrderType(raw.tabletOrderCustom))
          || (mobileOrderCustomProvided && !validCustomOrderType(raw.mobileOrderCustom))
          || (tabletOrderValueProvided && !validFlexOrderValue(raw.tabletOrderValue))
          || (mobileOrderValueProvided && !validFlexOrderValue(raw.mobileOrderValue))
          || (tabletOrderCustomProvided !== tabletOrderValueProvided)
          || (mobileOrderCustomProvided !== mobileOrderValueProvided)) {
          issues.push({
            code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_VALUE_INVALID',
            path,
            message: 'Responsive flex-item custom order must use a custom selection and a finite integer value from -1000 through 1000.',
          });
          continue;
        }

        resolutions.set(sourceNodeId, {
          sourceNodeId,
          ...(tabletOrderCustomProvided ? { tabletOrderCustom: raw.tabletOrderCustom as P15ElementorFlexOrderCustom } : {}),
          ...(mobileOrderCustomProvided ? { mobileOrderCustom: raw.mobileOrderCustom as P15ElementorFlexOrderCustom } : {}),
          ...(tabletOrderValueProvided ? { tabletOrderValue: raw.tabletOrderValue as P15ElementorFlexOrderValue } : {}),
          ...(mobileOrderValueProvided ? { mobileOrderValue: raw.mobileOrderValue as P15ElementorFlexOrderValue } : {}),
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
      'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES',
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_GENERATOR_BINDING_MISMATCH' as const,
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_GENERATOR_BINDING_MISMATCH',
        path: '$.content',
        message: `Generated container binding missing for sourceNodeId ${sourceNodeId}.`,
      });
      continue;
    }

    const requested: Array<[unknown, string]> = [
      [resolution.tabletOrderCustom, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.tabletOrderSettingKey],
      [resolution.mobileOrderCustom, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.mobileOrderSettingKey],
      [resolution.tabletOrderValue, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.tabletCustomOrderSettingKey],
      [resolution.mobileOrderValue, P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.mobileCustomOrderSettingKey],
    ];

    let conflict = false;
    for (const [value, settingKey] of requested) {
      if (value !== undefined && Object.prototype.hasOwnProperty.call(target.settings, settingKey)) {
        issues.push({
          code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EXISTING_OVERRIDE_CONFLICT',
          path: `$source.${sourceNodeId}`,
          message: `Generated base candidate already contains requested responsive flex-item custom order key ${settingKey}.`,
        });
        conflict = true;
      }
    }
    if (conflict) continue;

    if (resolution.tabletOrderCustom !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.tabletOrderSettingKey] = 'custom';
    }
    if (resolution.mobileOrderCustom !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.mobileOrderSettingKey] = 'custom';
    }
    if (resolution.tabletOrderValue !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.tabletCustomOrderSettingKey] = resolution.tabletOrderValue;
    }
    if (resolution.mobileOrderValue !== undefined) {
      target.settings[P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE.mobileCustomOrderSettingKey] = resolution.mobileOrderValue;
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
        code: 'P15_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED_CANDIDATE_INVALID',
        path: '$resolvedCandidate',
        message: 'Responsive flex-item custom order output did not rebuild into a canonical ready Elementor candidate.',
      }],
      null,
      null,
    );
  }

  const resolvedIdentity = buildElementorTemplateCandidateIdentity(candidate);
  const resolvedOrder = [...resolutions.values()]
    .map((entry) => ({
      sourceNodeId: entry.sourceNodeId,
      tabletOrderCustom: entry.tabletOrderCustom ?? null,
      mobileOrderCustom: entry.mobileOrderCustom ?? null,
      tabletOrderValue: entry.tabletOrderValue ?? null,
      mobileOrderValue: entry.mobileOrderValue ?? null,
    }))
    .sort((left, right) => left.sourceNodeId.localeCompare(right.sourceNodeId));

  return baseResult(
    'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED',
    sourceIrFingerprint,
    baseIdentity.digest,
    resolvedIdentity.digest,
    sourceContainers.size,
    resolvedOrder,
    [],
    template,
    candidate,
  );
}

function validIssue(issue: P15ElementorResponsiveFlexItemCustomOrderIssueV1): boolean {
  return isRecord(issue)
    && typeof issue.code === 'string'
    && ISSUE_CODES.includes(issue.code as P15ElementorResponsiveFlexItemCustomOrderIssueCode)
    && typeof issue.path === 'string'
    && issue.path.length > 0
    && issue.path.length <= 1024;
}

function validSummaryEntry(entry: P15ElementorResponsiveFlexItemCustomOrderSummaryEntryV1): boolean {
  return isRecord(entry)
    && exactKeys(entry, ['mobileOrderCustom', 'mobileOrderValue', 'sourceNodeId', 'tabletOrderCustom', 'tabletOrderValue'])
    && validSourceNodeId(entry.sourceNodeId)
    && (entry.tabletOrderCustom === null || entry.tabletOrderCustom === true)
    && (entry.mobileOrderCustom === null || entry.mobileOrderCustom === true)
    && (entry.tabletOrderValue === null || validFlexOrderValue(entry.tabletOrderValue))
    && (entry.mobileOrderValue === null || validFlexOrderValue(entry.mobileOrderValue))
    && ((entry.tabletOrderCustom === null) === (entry.tabletOrderValue === null))
    && ((entry.mobileOrderCustom === null) === (entry.mobileOrderValue === null))
    && (
      entry.tabletOrderCustom !== null
      || entry.mobileOrderCustom !== null
      || entry.tabletOrderValue !== null
      || entry.mobileOrderValue !== null
    );
}

/** Serialize only sanitized flex-item custom order metadata; source content, template JSON and candidate bytes are omitted. */
export function serializeP15ElementorResponsiveFlexItemCustomOrderSummary(
  result: P15ElementorResponsiveFlexItemCustomOrderResultV1,
): string {
  const validStatus = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    || result.status === 'BLOCKED_UPSTREAM_GENERATION'
    || result.status === 'REJECTED_INVALID_MANIFEST'
    || result.status === 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED';
  const validCounts = Number.isSafeInteger(result.sourceContainerCount)
    && result.sourceContainerCount >= 0
    && Number.isSafeInteger(result.resolvedContainerCount)
    && result.resolvedContainerCount >= 0
    && result.resolvedContainerCount <= result.sourceContainerCount
    && result.resolvedContainerCount === result.resolvedOrder.length;
  const uniqueIds = new Set(result.resolvedOrder.map((entry) => entry.sourceNodeId)).size
    === result.resolvedOrder.length;
  const validSourceFingerprint = result.status === 'BLOCKED_INVALID_SOURCE_IR'
    ? result.sourceIrFingerprint === null
    : validFingerprint(result.sourceIrFingerprint);
  const baseDigestRequired = result.status !== 'BLOCKED_INVALID_SOURCE_IR'
    && result.status !== 'BLOCKED_UPSTREAM_GENERATION';
  const validBaseDigest = baseDigestRequired
    ? validFingerprint(result.baseCandidateIdentityDigest)
    : result.baseCandidateIdentityDigest === null;
  const resolvedDigestRequired = result.status === 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES'
    || result.status === 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED';
  const validResolvedDigest = resolvedDigestRequired
    ? validFingerprint(result.resolvedCandidateIdentityDigest)
    : result.resolvedCandidateIdentityDigest === null;
  const statusShapeValid = result.status === 'RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESOLVED'
    ? result.resolvedContainerCount > 0
      && result.baseCandidateIdentityDigest !== result.resolvedCandidateIdentityDigest
    : result.status === 'NO_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_OVERRIDES'
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
    || !result.resolvedOrder.every(validSummaryEntry)
    || !result.issues.every(validIssue)
    || result.responsiveInferencePerformed !== false
    || result.figmaMutation !== false
    || result.networkAccess !== false
    || result.responsiveClosureClaim !== false
    || result.targetCompatibilityClaim !== false
    || result.productionAcceptance !== false
    || result.downloadEnabled !== false
    || result.internalReviewRequired !== true) {
    throw new Error('Invalid or authority-inflated P15 responsive-flex-item-custom-order result.');
  }

  return `${JSON.stringify({
    schemaVersion: 1,
    resultVersion: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_RESULT_VERSION,
    status: result.status,
    sourceIrFingerprint: result.sourceIrFingerprint,
    baseCandidateIdentityDigest: result.baseCandidateIdentityDigest,
    resolvedCandidateIdentityDigest: result.resolvedCandidateIdentityDigest,
    sourceContainerCount: result.sourceContainerCount,
    resolvedContainerCount: result.resolvedContainerCount,
    resolvedOrder: result.resolvedOrder.map((entry) => ({ ...entry })),
    issues: result.issues.map((issue) => ({ code: issue.code, path: issue.path })),
    evidence: P15_ELEMENTOR_RESPONSIVE_FLEX_ITEM_CUSTOM_ORDER_EVIDENCE,
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
